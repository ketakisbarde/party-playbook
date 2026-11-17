(() => {
  "use strict";

  const games = window.partyGames;
  const byId = new Map();
  const storageKey = "ash-birthday-party-v1";
  const audioSlots = new Map();
  const audio = document.getElementById("round-audio");
  let state;
  let promptRevealed = false;
  let timerInterval;
  let remaining = 30;
  let deadline = 0;
  let running = false;
  let rapid = null;
  let drawing = null;
  let spinTimeout;
  let spinning = false;
  let wheelRotation = 0;

  const el = id => document.getElementById(id);
  const teamLabel = index => `Team ${String.fromCharCode(65 + index)}`;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const action = (text, label, handler) => {
    const button = make("button", "secondary-button", text);
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.addEventListener("click", handler);
    return button;
  };

  function partyError(message) {
    reportError(message);
    for (const id of ["party-notice", "round-notice"]) {
      el(id).textContent = message;
      el(id).hidden = false;
    }
  }

  function clearPartyError() {
    if (el("site-error").textContent === el("party-notice").textContent) clearError();
    for (const id of ["party-notice", "round-notice"]) {
      el(id).textContent = "";
      el(id).hidden = true;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      partyError(`Party changes work in this tab, but couldn't be saved: ${error.message}. Keep this tab open.`);
    }
  }

  function loadState() {
    const fresh = {
      version: 3,
      enabled: games.map(game => game.id), selectedId: null, promptIndex: 0, playerCount: null
    };
    let raw;
    try {
      raw = localStorage.getItem(storageKey);
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      partyError(`Saved game choices aren't accessible: ${error.message}. You can still choose games in this tab.`);
      return fresh;
    }
    if (!raw) return fresh;
    let saved;
    try {
      saved = JSON.parse(raw);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      partyError("Saved game choices couldn't be read. All games are available; check your wheel choices before playing.");
      return fresh;
    }
    const valid = saved && [1, 2, 3].includes(saved.version) &&
      Array.isArray(saved.enabled) && saved.enabled.every(id => typeof id === "string") &&
      new Set(saved.enabled).size === saved.enabled.length &&
      (saved.selectedId === null || typeof saved.selectedId === "string") &&
      Number.isSafeInteger(saved.promptIndex) && saved.promptIndex >= 0;
    if (!valid) {
      partyError("Saved game choices are invalid. All games are available; check your wheel choices before playing.");
      return fresh;
    }
    const known = saved.enabled.filter(id => byId.has(id));
    if (known.length !== saved.enabled.length || (saved.selectedId && !byId.has(saved.selectedId))) {
      partyError("Some saved games were removed from the shelf. Their wheel entries were removed too; your other game choices were kept.");
      saved.enabled = known;
      if (!byId.has(saved.selectedId)) {
        saved.selectedId = null;
        saved.promptIndex = 0;
      }
    }
    let playerCount = saved.version === 3 ? saved.playerCount : null;
    if (playerCount !== null && !validPlayerCount(playerCount)) {
      partyError("The saved headcount is invalid. Please enter it again; your wheel choices were kept.");
      playerCount = null;
    }
    return { version: 3, enabled: saved.enabled, selectedId: saved.selectedId, promptIndex: saved.promptIndex, playerCount };
  }

  function validPlayerCount(count) {
    return Number.isSafeInteger(count) && count >= 2 && count <= 20;
  }

  function partyPlan() {
    if (state.playerCount === null) return null;
    const teamCount = Math.max(2, Math.ceil(state.playerCount / 4));
    const base = Math.floor(state.playerCount / teamCount);
    const extra = state.playerCount % teamCount;
    const sizes = Array.from({ length: teamCount }, (_, index) => base + (index < extra ? 1 : 0));
    return { players: state.playerCount, teamCount, sizes, chainSize: Math.min(...sizes) };
  }

  function showPartyTab(name, focus = false) {
    for (const tab of ["setup", "games"]) {
      const selected = tab === name;
      const button = el(`party-${tab}-tab`);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      el(`party-${tab}-panel`).hidden = !selected;
      if (selected && focus) button.focus();
    }
  }

  function renderPartySetup() {
    const plan = partyPlan();
    el("party-player-count").value = state.playerCount ?? "";
    el("party-plan-result").hidden = !plan;
    el("party-team-chips").replaceChildren();
    el("party-plan-summary").textContent = plan
      ? `${plan.players} players -> ${plan.teamCount} teams (${plan.sizes.join(", ")})`
      : "Enter your headcount to see your teams and game flow.";
    if (!plan) return;
    plan.sizes.forEach((size, index) => {
      el("party-team-chips").append(make("span", "party-team-chip", `${teamLabel(index)}: ${size} player${size === 1 ? "" : "s"}`));
    });
    el("party-plan-guide").textContent = plan.chainSize < 2
      ? "Solo teams: choose individual or whole-group games. Drawing, Copy the Step, Backwards and Reverse Charades need at least two players per team."
      : `Group games: everyone plays together. Team games: use Teams ${plan.sizes.map((_, index) => String.fromCharCode(65 + index)).join(", ")}. Telephone games: ${plan.chainSize} players per chain; rotate extras in. Open a game for roles and turn order.`;
  }

  function gameFlow(game, plan) {
    const order = plan.sizes.map((_, index) => teamLabel(index)).join(" -> ");
    const needsPartners = ["movie-backwards", "drawing-telephone", "dance-telephone", "reverse-charades"].includes(game.id);
    if (needsPartners && plan.chainSize < 2) {
      return ["Each team needs at least two players. Add players (four total minimum), or choose an individual/whole-group game."];
    }
    if (game.id === "bollywood") {
      return [`Lineup: one player each from ${order.replaceAll(" -> ", ", ")}. Start with Player 1; call the next teammate each round. Smaller teams loop back sooner. Equal turns, equal glory.`];
    }
    if (game.id === "wrong-answers" || game.id === "movie-backwards" || game.id === "five-things") {
      const fullCycles = Math.floor(game.prompts.length / plan.teamCount);
      const bonus = game.prompts.length % plan.teamCount;
      const starters = Array.from({ length: Math.ceil(game.prompts.length / game.roundSize) }, (_, round) =>
        `Round ${round + 1}: start with ${teamLabel(round * game.roundSize % plan.teamCount)}`);
      return [
        `Turn order: ${order}, then repeat. Each team sends its next player; smaller teams loop back sooner.`,
        `${starters.join("; ")}. Continue the team order across rounds.`,
        bonus
          ? `For equal turns: score the first ${fullCycles * plan.teamCount} prompts (${fullCycles} per team). Final ${bonus} prompt${bonus === 1 ? "" : "s"}: unscored bonus. Record points yourself.`
          : `${game.prompts.length} prompts = ${fullCycles} turns per team.`
      ];
    }
    switch (game.id) {
      case "drawing-telephone":
        return [
          `Each team: ${plan.chainSize} in line, all facing forward. Back = artist${plan.chainSize > 2 ? ` -> ${plan.chainSize - 2} copier${plan.chainSize > 3 ? "s" : ""}` : ""} -> front = guesser. Rotate extras between drawings.`,
          drawing && drawing.trial
            ? "Practice mode: Mountains = two big peaks. No clock, no points, no pressure! Click Finish trial / set up game when ready. Mountains is not in the scored pack."
            : `Your pack: ${drawing ? drawing.count : game.prompts.length} drawings${drawing ? ` / ${drawing.duration}s total` : ""}. Try Mountains first for a warm-up.`
        ];
      case "dance-telephone":
        return [`Each team: ${plan.chainSize} in line. First = actor; last = guesser. Rotate roles and extras each prompt.`];
      case "reverse-charades":
        return [`Each team: one guesser + ${plan.chainSize - 1} actor${plan.chainSize === 2 ? "" : "s"}. Same actor count for everyone; rotate extras each turn.`];
      case "alphabet":
        return ["Call one player per team together. Cycle each team's queue at NEXT!: eight chances per team, whatever its size."];
      case "hook-step":
        return ["Call one dancer per team, or invite whole teams. Use the same clip for competing teams; rotate dancers next turn."];
      case "tunnel-vision":
        return [`Set ${plan.teamCount} matching stations: three straws + one container each. Call one player per team; rotate after each race. Relay: switch after each straw, three total per team.`];
      case "balloon-cups":
        return [`Set ${plan.teamCount} matching lanes, five cups each. Call one player per team; rotate next race. Relay: switch after each cup, five total per team.`];
      case "balloon-knockdown":
        return [`Set ${plan.teamCount} matching table lanes. Call one player per team; rotate next race. Use five cups, or three for the accuracy prompt.`];
      case "dice-tower":
        return [`Call one player per team. Give all ${plan.teamCount} players equal dice sets; rotate next round.`];
      case "in-out":
        return [`One group: ${plan.players} players if you call; ${plan.players - 1} if a player calls. Warm up with IN, IN, OUT, no eliminations.`];
      case "count-together":
        return [`One group: all ${plan.players} players. Your target is ${plan.players}; no team scores.`];
      case "camera-catch":
        if (plan.players < 3) return ["Need three players: one seated camera player + two passing. Add a player or choose another group game."];
        return [`Seat one camera player; ${plan.players - 1} others form a circle. Switch camera player after each 45s round.`];
      case "scattergories":
        return [`All ${plan.players} play individually in your WhatsApp group. Teams take a tea break.`];
      case "hand-map":
        return [`All ${plan.players} play together. No teams or turn-taking; just you versus your hands.`];
      default:
        throw new Error(`Missing headcount instructions for game ${game.id}.`);
    }
  }

  function renderGamePlan(game) {
    if (!game) return;
    const plan = partyPlan();
    el("round-plan-heading").textContent = "How to play";
    el("round-plan-summary").textContent = plan
      ? game.group === "group" ? `${plan.players} players / ${game.id === "scattergories" ? "individual scores" : "one big group"}`
        : plan.sizes.map((size, index) => `${teamLabel(index)}: ${size}`).join(" / ")
      : "Add your headcount in Party setup for team sizes and turn order.";
    el("round-plan-steps").replaceChildren(...[
      ...(plan ? gameFlow(game, plan) : []), ...game.rules
    ].map(step => make("li", "", step)));
    el("drawing-trial").hidden = game.trialPrompt === undefined;
    if (game.trialPrompt) el("drawing-trial").textContent = `Trial: ${game.trialPrompt}`;
  }

  function stopSpin() {
    clearTimeout(spinTimeout);
    if (spinning) el("wheel-result").textContent = "Spin cancelled. Ready to choose again.";
    spinning = false;
    el("spin-wheel").disabled = !state.enabled.length;
    el("play-wheel-game").disabled = !state.selectedId;
  }

  function renderWheel() {
    const wheel = el("party-wheel");
    wheel.replaceChildren();
    const colors = ["#acc9e3", "#fff8e8", "#8eafd0", "#edf3f7"];
    const count = state.enabled.length;
    wheel.style.background = count
      ? `conic-gradient(${state.enabled.map((id, index) => `${colors[index % colors.length]} ${index * 360 / count}deg ${(index + 1) * 360 / count}deg`).join(",")})`
      : "#dce5ec";
    for (let index = 0; index < count; index += 1) {
      const label = make("span", "wheel-label", games.findIndex(game => game.id === state.enabled[index]) + 1);
      label.style.setProperty("--angle", `${(index + .5) * 360 / count}deg`);
      wheel.append(label);
    }
    el("spin-wheel").disabled = spinning || !count;
    el("play-wheel-game").disabled = !state.selectedId || spinning;
    if (!count) el("wheel-result").textContent = "No games checked. Check a game below to spin.";
    else if (state.selectedId && !spinning) el("wheel-result").textContent = `Last pick: ${byId.get(state.selectedId).title}`;
  }

  function renderMenu() {
    const filter = el("game-filter").value;
    el("party-game-grid").replaceChildren();
    const orderedGames = [...games.filter(game => game.group === "group"), ...games.filter(game => game.group === "teams")];
    orderedGames.forEach((game, index) => {
      if (filter !== "all" && filter !== game.group) return;
      const card = make("article", "party-game-card");
      card.append(make("span", "game-badge", `${String(index + 1).padStart(2, "0")} / ${game.group === "teams" ? "teams" : "whole group"}`));
      const open = action(game.title, `Play ${game.title}`, () => selectGame(game.id));
      open.className = "game-open handwritten";
      card.append(open, make("p", "party-small", game.supplies));
      const label = make("label", "wheel-choice");
      const check = make("input", "");
      check.type = "checkbox";
      check.setAttribute("aria-label", `Include ${game.title} in the wheel`);
      check.checked = state.enabled.includes(game.id);
      check.dataset.wheelGame = game.id;
      check.addEventListener("change", () => {
        stopSpin();
        state.enabled = games.filter(item => item.id === game.id ? check.checked : state.enabled.includes(item.id)).map(item => item.id);
        saveState();
        renderWheel();
      });
      label.append(check, document.createTextNode(" Include in wheel"));
      card.append(label);
      el("party-game-grid").append(card);
    });
  }

  function renderTimer() {
    const seconds = Math.max(0, Math.ceil(remaining));
    el("round-timer").textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    el("round-timer").classList.toggle("timer-expired", seconds === 0);
    el("start-timer").textContent = running ? "Pause timer" : seconds === 0 ? "Start again" : "Start timer";
    if (rapid) {
      const game = byId.get(state.selectedId);
      const reading = rapid.phase === "reading" && !rapid.complete;
      const phaseLabel = rapid.phase === "transition" ? "Next player"
        : game.revealSeconds === 0 ? "Your turn" : rapid.phase === "guess" ? "Guess" : "Answer";
      el("start-timer").textContent = running ? "Pause" : rapid.complete ? "Replay round" : reading ? `Start ${game.guessSeconds}s` : "Resume";
      el("rapid-step-clock").textContent = rapid.complete ? "Round complete"
        : reading ? `Read aloud first, then press Start ${game.guessSeconds}s`
        : `${phaseLabel}: ${Math.ceil(rapid.phaseRemaining)}s${running ? "" : " (paused)"}`;
      el("rapid-skip-tile").disabled = !running;
      el("next-prompt").disabled = !running && !reading;
      el("reveal-prompt").disabled = !running || rapid.phase !== "guess";
    }
    if (drawing) {
      el("start-timer").textContent = running ? "Pause game" : drawing.complete ? "Play again" : drawing.started ? "Resume game" : "START GAME";
      el("next-prompt").disabled = !drawing.trial && (!running || drawing.complete);
      el("reveal-prompt").disabled = drawing.complete;
      el("drawing-prompt-count").disabled = drawing.started && !drawing.complete;
    }
    for (const id of ["drawing-trial", "party-try-drawing"]) {
      el(id).disabled = Boolean(drawing && drawing.started && !drawing.complete);
    }
    el("timer-seconds").disabled = running || Boolean(drawing && drawing.started && !drawing.complete);
    const showChangeover = Boolean(rapid && running && !rapid.complete && rapid.phase === "transition" && location.hash === "#party-round");
    el("turn-changeover").hidden = !showChangeover;
    el("turn-changeover-countdown").textContent = showChangeover ? `${Math.ceil(rapid.phaseRemaining)}s` : "";
    el("round-send-cue").hidden = state.selectedId !== "scattergories" || seconds !== 0;
  }

  function pauseTimer() {
    if (running) {
      const now = performance.now();
      remaining = Math.max(0, (deadline - now) / 1000);
      if (rapid) rapid.phaseRemaining = Math.max(0, (rapid.phaseDeadline - now) / 1000);
    }
    clearInterval(timerInterval);
    running = false;
    renderTimer();
  }

  function setTimer(seconds) {
    pauseTimer();
    remaining = seconds;
    el("timer-seconds").value = seconds;
    el("round-status").textContent = "Ready when you are.";
    renderTimer();
  }

  function readDuration() {
    const input = el("timer-seconds");
    const value = Number(input.value);
    if (!input.checkValidity() || !Number.isInteger(value)) {
      input.reportValidity();
      partyError("Choose a whole-number round length between 1 and 600 seconds.");
      return null;
    }
    return value;
  }

  function suggestedDrawingTime(count) {
    return Math.min(600, Math.max(10, Math.round(count * 11.5 / 10) * 10));
  }

  function readDrawingCount() {
    const input = el("drawing-prompt-count");
    const count = Number(input.value);
    if (!input.checkValidity() || !Number.isInteger(count)) {
      input.reportValidity();
      partyError(`Choose a whole-number prompt count between 1 and ${input.max}. The previous drawing plan was kept.`);
      return null;
    }
    return count;
  }

  function prepareDrawingGame(count, seconds, startIndex = state.promptIndex) {
    pauseTimer();
    drawing = { count, duration: seconds, startIndex, turn: 0, started: false, complete: false, reason: null, trial: false };
    state.promptIndex = startIndex;
    promptRevealed = false;
    el("drawing-prompt-count").max = byId.get(state.selectedId).prompts.length;
    el("drawing-prompt-count").value = count;
    el("drawing-game-summary").textContent = `${count} prompts / ${seconds} seconds for the whole game. Suggested: ${suggestedDrawingTime(count)} seconds. Next drawing keeps the same clock running.`;
    setTimer(seconds);
    updatePromptView();
    renderGamePlan(byId.get(state.selectedId));
    saveState();
  }

  function finishDrawingGame(reason) {
    pauseTimer();
    drawing.complete = true;
    drawing.reason = reason;
    promptRevealed = false;
    el("round-status").textContent = reason === "time"
      ? "Time's up! Stop drawing and compare your manual team scores."
      : `All ${drawing.count} prompts played! Compare your manual team scores.`;
    updatePromptView();
    renderTimer();
  }

  function nextDrawingPrompt() {
    if (drawing.trial) {
      prepareDrawingGame(drawing.count, drawing.duration, drawing.startIndex);
      return;
    }
    if (drawing.turn + 1 >= drawing.count) {
      finishDrawingGame("all");
      return;
    }
    drawing.turn += 1;
    state.promptIndex = (drawing.startIndex + drawing.turn) % byId.get(state.selectedId).prompts.length;
    promptRevealed = false;
    updatePromptView();
    renderTimer();
    saveState();
  }

  function rapidCount() {
    const game = byId.get(state.selectedId);
    return Math.min(game.roundSize, game.prompts.length - rapid.round * game.roundSize);
  }

  function rapidStepSeconds(game) {
    return game.guessSeconds + game.revealSeconds + (game.transitionSeconds ?? 0);
  }

  function rapidRoundLabel(round) {
    const game = byId.get(state.selectedId);
    return round > 0 && (round + 1) * game.roundSize > game.prompts.length
      ? "Bonus round" : `Round ${round + 1}`;
  }

  function showRapidStage() {
    el("rapid-intro").hidden = rapid.started;
    el("round-prompt-card").hidden = !rapid.started;
    el("round-prompt-controls").hidden = !rapid.started;
    el("round-timer-panel").hidden = !rapid.started;
    el("rapid-finish").hidden = !rapid.complete;
    el("rapid-round-menu").hidden = !rapid.started || rapid.complete;
    el("rapid-round-menu-note").hidden = !rapid.started || rapid.complete;
  }

  function prepareRapidRound(round) {
    pauseTimer();
    const game = byId.get(state.selectedId);
    rapid = { round, started: false, complete: false, phase: game.readAloud ? "reading" : "guess", phaseRemaining: game.readAloud ? 0 : game.guessSeconds };
    state.promptIndex = round * game.roundSize;
    promptRevealed = false;
    setTimer(rapidCount() * rapidStepSeconds(game));
    const options = el("rapid-round-options");
    options.replaceChildren();
    for (let index = 0; index < Math.ceil(game.prompts.length / game.roundSize); index += 1) {
      const label = rapidRoundLabel(index);
      const button = action(label, `Choose ${label.toLowerCase()}`, () => chooseRapidRound(index));
      button.setAttribute("aria-pressed", String(index === round));
      options.append(button);
    }
    const count = rapidCount();
    const unit = game.promptUnit ?? (game.revealSeconds === 0 ? "question" : "clue");
    let timing = game.revealSeconds === 0
      ? game.readAloud
        ? `untimed teammate read-out / host starts each ${game.guessSeconds}s answer timer`
        : `${game.guessSeconds}s per person / automatic next ${unit}`
      : `${game.guessSeconds}s guessing + ${game.revealSeconds}s answer reveal`;
    if (game.transitionSeconds) timing += ` / ${game.transitionSeconds}s NEXT! changeover`;
    el("rapid-round-summary").textContent = `${rapidRoundLabel(round)}: ${count} ${unit}${count === 1 ? "" : "s"} / ${remaining} ${game.readAloud ? "timed seconds + reading time" : "seconds"} / ${timing}`;
    const suggested = game.prompts.filter(prompt => prompt.suggested).length;
    el("rapid-pack-note").textContent = game.revealSeconds === 0
      ? `${game.prompts.length} editable ${unit}s across ${Math.ceil(game.prompts.length / game.roundSize)} rounds. No repeated ${unit}s; the practice example stays out of the game.`
      : suggested
        ? `${game.prompts.length - suggested} supplied clues + ${suggested} editable starter suggestions. No repeated answers across these rounds.`
        : `All ${game.prompts.length} clues supplied by you. No repeated answers across these rounds.`;
    showRapidStage();
    updatePromptView();
    saveState();
  }

  function chooseRapidRound(round) {
    prepareRapidRound(round);
    const selected = el("rapid-round-options").querySelector('[aria-pressed="true"]');
    selected.focus({ preventScroll: true });
    el("rapid-round-options").scrollIntoView({ block: "center", behavior: "instant" });
  }

  function beginRapidRound() {
    clearPartyError();
    pauseTimer();
    const game = byId.get(state.selectedId);
    state.promptIndex = rapid.round * game.roundSize;
    rapid.started = true;
    rapid.complete = false;
    rapid.phase = "guess";
    rapid.phaseRemaining = game.guessSeconds;
    promptRevealed = false;
    setTimer(rapidCount() * rapidStepSeconds(game));
    showRapidStage();
    saveState();
    if (game.readAloud) {
      waitForReader();
      updatePromptView();
      renderTimer();
    } else runTimer();
    el("round-prompt-card").focus({ preventScroll: true });
    el("round-prompt-card").scrollIntoView({ block: "start", behavior: "instant" });
  }

  function waitForReader() {
    clearInterval(timerInterval);
    running = false;
    rapid.phase = "reading";
    rapid.phaseRemaining = 0;
    el("round-status").textContent = `Reader: say the title once, in normal order. Host: press Start ${byId.get(state.selectedId).guessSeconds}s when the reader finishes.`;
  }

  function finishRapidRound() {
    clearInterval(timerInterval);
    running = false;
    remaining = 0;
    rapid.complete = true;
    promptRevealed = byId.get(state.selectedId).revealSeconds > 0 &&
      Boolean(byId.get(state.selectedId).prompts[state.promptIndex].answer);
    updatePromptView();
    el("rapid-finish-title").textContent = `${rapidRoundLabel(rapid.round)} complete!`;
    el("rapid-next-round").disabled = rapid.round + 1 >= Math.ceil(byId.get(state.selectedId).prompts.length / byId.get(state.selectedId).roundSize);
    el("rapid-next-round").textContent = !el("rapid-next-round").disabled && rapidRoundLabel(rapid.round + 1) === "Bonus round"
      ? "Play bonus round" : "Next round";
    el("round-status").textContent = byId.get(state.selectedId).revealSeconds === 0
      ? byId.get(state.selectedId).readAloud
        ? "Round finished. Record team points and get the next player-reader pair ready."
        : "Round finished. Take a breather and get the line ready before starting another round."
      : "Round finished. Compare your points before starting another round.";
    showRapidStage();
    renderTimer();
    el("rapid-finish-title").focus({ preventScroll: true });
    el("rapid-finish").scrollIntoView({ block: "start", behavior: "instant" });
  }

  function nextRapidPrompt() {
    const game = byId.get(state.selectedId);
    if (state.promptIndex + 1 >= rapid.round * game.roundSize + rapidCount()) {
      finishRapidRound();
      return;
    }
    state.promptIndex += 1;
    rapid.phase = "guess";
    rapid.phaseRemaining = game.guessSeconds;
    promptRevealed = false;
    if (game.readAloud) {
      remaining = (rapid.round * game.roundSize + rapidCount() - state.promptIndex) * rapidStepSeconds(game);
      waitForReader();
    }
    updatePromptView();
    saveState();
  }

  function tickRapidRound(now) {
    const game = byId.get(state.selectedId);
    if (remaining === 0) {
      finishRapidRound();
      return;
    }
    // Phase deadlines advance from their scheduled time, not from a late timer tick.
    while (running && now >= rapid.phaseDeadline) {
      if (rapid.phase === "guess" && game.revealSeconds > 0) {
        rapid.phase = "answer";
        rapid.phaseRemaining = game.revealSeconds;
        promptRevealed = true;
        updatePromptView();
      } else if (rapid.phase !== "transition" && game.transitionSeconds) {
        rapid.phase = "transition";
        rapid.phaseRemaining = game.transitionSeconds;
        promptRevealed = false;
        updatePromptView();
      } else nextRapidPrompt();
      if (running) rapid.phaseDeadline += rapid.phaseRemaining * 1000;
    }
    if (running) rapid.phaseRemaining = Math.max(0, (rapid.phaseDeadline - now) / 1000);
  }

  function runTimer() {
    if (rapid && rapid.phase === "reading") {
      rapid.phase = "guess";
      rapid.phaseRemaining = byId.get(state.selectedId).guessSeconds;
      promptRevealed = false;
    }
    const now = performance.now();
    deadline = now + remaining * 1000;
    if (rapid) rapid.phaseDeadline = now + rapid.phaseRemaining * 1000;
    running = true;
    el("round-status").textContent = rapid
      ? state.selectedId === "alphabet"
        ? "Go! One player per team searches together. First valid object earns a point; rotate teammates at NEXT!."
        : state.selectedId === "five-things"
          ? "Go! Only the called player speaks: five different valid answers in ten seconds earns one point. Rotate at NEXT!; the host judges."
          : byId.get(state.selectedId).revealSeconds === 0
        ? byId.get(state.selectedId).readAloud
          ? "Go! Player: keep facing away and say the title backwards from memory. Reader: no hints or repeats. The host judges."
          : "Go! Only the front person answers. The next prompt is the next person's turn. The host judges answers."
        : "Go! The competing team representatives guess together. Movies advance automatically."
      : drawing ? "Go! All teams share this prompt. First correct team earns a point; click Next drawing without resetting the game clock." : "Go!";
    if (rapid) updatePromptView();
    renderTimer();
    timerInterval = setInterval(() => {
      const now = performance.now();
      remaining = Math.max(0, (deadline - now) / 1000);
      if (rapid) tickRapidRound(now);
      else if (remaining === 0) {
        if (drawing) finishDrawingGame("time");
        else {
          clearInterval(timerInterval);
          running = false;
          el("round-status").textContent = byId.get(state.selectedId).timeUpMessage ?? "Time's up! Review the round and choose a winner.";
        }
      }
      renderTimer();
    }, 100);
  }

  function updatePromptView() {
    const game = byId.get(state.selectedId);
    const prompts = game.prompts;
    const prompt = drawing && drawing.trial ? { text: game.trialPrompt } : prompts[state.promptIndex];
    const secret = game.mode === "secret";
    const changeover = Boolean(rapid && rapid.phase === "transition" && !rapid.complete);
    const reading = Boolean(rapid && rapid.phase === "reading" && !rapid.complete);
    el("hand-map-board").hidden = game.handMap === undefined;
    el("round-prompt-card").classList.toggle("hand-map-active", game.handMap !== undefined);
    el("hand-map-rows").replaceChildren();
    if (game.handMap) {
      for (const pair of game.handMap) {
        const row = document.createElement("tr");
        for (const shape of pair) {
          const cell = document.createElement("td");
          const symbol = make("span", `hand-map-symbol${shape === "circle" ? " hand-map-circle" : ""}`, shape === "palm" ? String.fromCodePoint(0x270b, 0xfe0e) : "");
          symbol.setAttribute("aria-hidden", "true");
          cell.append(symbol, make("span", "party-small", shape === "palm" ? "Handprint" : "Circle"));
          row.append(cell);
        }
        el("hand-map-rows").append(row);
      }
    }
    el("rapid-reader-reminder").hidden = !rapid || !game.readAloud || !rapid.started || rapid.complete || changeover;
    el("rapid-answer-start").hidden = !reading || !rapid.started;
    if (rapid) el("rapid-answer-start").textContent = `Start ${game.guessSeconds}s`;
    el("rapid-skip-tile").hidden = !rapid || reading;
    el("round-prompt-text").textContent = drawing && drawing.complete
        ? drawing.reason === "time" ? "TIME'S UP!" : "PACK COMPLETE!"
        : changeover ? "NEXT!" : secret && !promptRevealed
        ? game.id === "reverse-charades"
          ? "Actors only! Guessers, look away. Reveal, memorise, then hide."
          : "First players only! Everyone else, look away. Reveal, memorise, then hide."
        : prompt.text;
    el("round-answer").textContent = promptRevealed && !secret && prompt.answer ? prompt.answer : "";
    el("round-answer").hidden = !promptRevealed || secret || !prompt.answer;
    el("round-prompt-card").classList.toggle("answer-showing", Boolean(rapid && promptRevealed));
    el("round-prompt-card").classList.toggle("transition-showing", changeover);
    const canReveal = Boolean(secret || prompt.answer);
    el("reveal-prompt").hidden = !canReveal;
    el("reveal-prompt").setAttribute("aria-pressed", String(promptRevealed));
    el("reveal-prompt").textContent = secret
      ? promptRevealed ? "Hide secret prompt" : "Show secret prompt"
      : promptRevealed ? "Hide answer" : "Reveal answer";
    el("reveal-prompt").disabled = Boolean(rapid && (!running || rapid.phase !== "guess"));
    el("prompt-count").textContent = `${state.promptIndex + 1} / ${prompts.length}`;
    el("previous-prompt").disabled = state.promptIndex === 0;
    el("next-prompt").disabled = state.promptIndex >= prompts.length - 1;
    el("shuffle-prompt").disabled = prompts.length < 2;
    if (rapid) {
        el("prompt-count").textContent = `${rapidRoundLabel(rapid.round)} / ${game.id === "alphabet" ? "Letter" : game.revealSeconds === 0 ? "Turn" : "Clue"} ${state.promptIndex - rapid.round * game.roundSize + 1} of ${rapidCount()}`;
      el("previous-prompt").disabled = true;
      el("shuffle-prompt").disabled = true;
      el("next-prompt").disabled = !running && !reading;
      el("rapid-skip-tile").disabled = !running;
    }
    if (drawing) {
      el("drawing-game-settings").hidden = drawing.trial;
      el("round-timer-panel").hidden = drawing.trial;
      el("prompt-count").textContent = drawing.trial
        ? "Unscored, untimed trial / not in game pack"
        : `Drawing ${drawing.turn + 1} of ${drawing.count}${drawing.complete ? " / game finished" : ""}`;
      el("next-prompt").textContent = drawing.trial ? "Finish trial / set up game"
        : drawing.turn + 1 === drawing.count ? "Finish game" : "Next drawing";
      el("next-prompt").disabled = !drawing.trial && (!running || drawing.complete);
      el("previous-prompt").disabled = true;
      el("shuffle-prompt").disabled = true;
      el("reveal-prompt").disabled = drawing.complete;
    }
  }

  function audioKey() {
    return `${state.selectedId}:${state.promptIndex}`;
  }

  function renderAudio() {
    audio.pause();
    const game = byId.get(state.selectedId);
    el("audio-panel").hidden = game.mode !== "audio";
    const prompt = game.prompts[state.promptIndex];
    const slot = audioSlots.get(audioKey());
    const source = slot ? slot.url : prompt.audio;
    el("round-audio-file").value = "";
    if (source) audio.src = source;
    else audio.removeAttribute("src");
    audio.hidden = !source;
    audio.load();
    el("remove-audio").disabled = !slot;
    el("audio-status").textContent = slot ? `Ready: ${slot.name}` : source ? "Configured clip ready. Press play when you're ready." : "No audio added yet. Choose a clip you have permission to use.";
  }

  function renderPrompt() {
    promptRevealed = false;
    drawing = null;
    const game = byId.get(state.selectedId);
    const prompts = game.prompts;
    if (prompts.length && state.promptIndex >= prompts.length) {
      state.promptIndex = 0;
      saveState();
      partyError("The saved prompt was removed. This game is back at its first prompt; your wheel choices were kept.");
    }
    renderAudio();
    if (game.mode === "rapid") {
      prepareRapidRound(Math.floor(state.promptIndex / game.roundSize));
      return;
    }
    rapid = null;
    if (game.continuous) {
      prepareDrawingGame(prompts.length, suggestedDrawingTime(prompts.length));
      return;
    }
    updatePromptView();
    setTimer(game.seconds);
    saveState();
  }

  function renderRound() {
    const game = byId.get(state.selectedId);
    el("round-body").hidden = !game;
    el("round-empty").hidden = Boolean(game);
    el("party-round-title").textContent = game ? game.title : "Choose a game";
    if (!game) return;
    const isRapid = game.mode === "rapid";
    el("drawing-game-settings").hidden = !game.continuous;
    el("rapid-intro").classList.toggle("turn-game", isRapid && game.revealSeconds === 0);
    if (isRapid) {
      el("rapid-example-clue").textContent = game.example.text;
      el("rapid-example-answer").textContent = game.example.answer;
      el("rapid-example-tip").textContent = game.example.tip;
      el("rapid-skip-tile").setAttribute("aria-label", game.id === "alphabet" ? "Skip to the next letter" : game.revealSeconds === 0
        ? "Move to the next person's prompt" : "Skip this movie and show the next prompt");
    }
    el("rapid-intro").hidden = !isRapid;
    el("rapid-finish").hidden = true;
    el("rapid-round-menu").hidden = true;
    el("rapid-round-menu-note").hidden = true;
    el("rapid-step-clock").hidden = !isRapid;
    el("rapid-skip-tile").hidden = !isRapid;
    el("round-prompt-card").hidden = isRapid;
    el("round-prompt-card").classList.toggle("rapid-prompt", isRapid);
    el("round-prompt-controls").hidden = isRapid;
    el("round-timer-panel").hidden = isRapid;
    el("previous-prompt").hidden = isRapid || Boolean(game.continuous);
    el("shuffle-prompt").hidden = isRapid || Boolean(game.continuous);
    el("timer-duration-label").hidden = isRapid;
    el("timer-seconds").hidden = isRapid;
    el("rapid-timed-play-note").hidden = !isRapid || !game.readAloud;
    el("next-prompt").textContent = isRapid ? game.id === "alphabet" ? "Next letter" : game.revealSeconds === 0 ? "Next person" : "Skip movie" : game.id === "scattergories" ? "Next category" : "Next prompt";
    el("previous-prompt").textContent = game.id === "scattergories" ? "Previous category" : "Previous";
    el("shuffle-prompt").textContent = game.id === "scattergories" ? "Random category" : "Random prompt";
    el("reset-timer").textContent = isRapid ? "Restart round" : game.continuous ? "Reset game" : "Reset timer";
    el("timer-duration-label").textContent = game.continuous ? "Whole-game length (seconds; maximum 600)" : "Round length (seconds)";
    el("timer-help").textContent = isRapid
      ? game.readAloud
        ? `Reading is untimed. Press Start ${game.guessSeconds}s after each read-out. After the answer timer and NEXT! cue, the next title waits for you. Leaving this page or hiding the tab pauses an active timer. Reloading returns to round setup.`
        : "Prompts advance automatically. Leaving this page or hiding the tab pauses the timer. Reloading returns to round setup."
      : game.continuous
        ? "One continuous game clock: Next drawing never resets it. Settings lock while a game is in progress; Reset game unlocks them. Leaving this page or hiding the tab pauses play. Reloading returns to the full prompt pack and suggested time."
        : game.id === "scattergories"
          ? "Type three answers in WhatsApp but wait to send. At time's up, send together. Changing category starts a fresh default timer. Leaving this page or hiding the tab pauses the timer; reloading resets it."
          : "Timers pause when you leave the round or hide this tab. Reloading resets the timer.";
    el("round-supplies").textContent = `Grab: ${game.supplies}`;
    renderGamePlan(game);
    renderPrompt();
  }

  function selectGame(id, promptIndex = 0) {
    clearPartyError();
    pauseTimer();
    audio.pause();
    state.selectedId = id;
    state.promptIndex = promptIndex;
    renderRound();
    renderWheel();
    navigate("party-round");
  }

  function spinWheel() {
    clearPartyError();
    const pool = state.enabled.length > 1 ? state.enabled.filter(id => id !== state.selectedId) : state.enabled;
    const id = pool[Math.floor(Math.random() * pool.length)];
    const index = state.enabled.indexOf(id);
    spinning = true;
    el("wheel-result").textContent = "Picking your next game...";
    el("spin-wheel").disabled = true;
    el("play-wheel-game").disabled = true;
    wheelRotation = (Math.ceil(wheelRotation / 360) + 4) * 360 + 360 - (index + .5) * 360 / state.enabled.length;
    el("party-wheel").style.transform = `rotate(${wheelRotation}deg)`;
    spinTimeout = setTimeout(() => {
      spinning = false;
      state.selectedId = id;
      state.promptIndex = 0;
      saveState();
      renderRound();
      renderWheel();
      el("wheel-result").textContent = `The wheel picked: ${byId.get(id).title}!`;
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1800);
  }

  function initializeParty() {
    const modes = new Set(["quiz", "challenge", "audio", "secret", "rapid"]);
    const valid = Array.isArray(games) && games.length > 0 && games.every(game =>
      game && typeof game.id === "string" && /^[a-z][a-z0-9-]*$/.test(game.id) &&
      typeof game.title === "string" && game.title.trim() && ["teams", "group"].includes(game.group) &&
      modes.has(game.mode) && Number.isInteger(game.seconds) && game.seconds >= 1 && game.seconds <= 600 &&
      typeof game.supplies === "string" && Array.isArray(game.rules) && game.rules.length &&
      game.rules.every(rule => typeof rule === "string" && rule.trim()) && Array.isArray(game.prompts) &&
      game.prompts.length > 0 &&
      (game.timeUpMessage === undefined || typeof game.timeUpMessage === "string" && game.timeUpMessage.trim()) &&
      (game.handMap === undefined || Array.isArray(game.handMap) && game.handMap.length > 0 &&
        game.handMap.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(shape => ["palm", "circle"].includes(shape)))) &&
      (game.continuous === undefined || typeof game.continuous === "boolean" &&
        (!game.continuous || game.mode === "secret" && new Set(game.prompts.map(prompt => prompt && prompt.text)).size === game.prompts.length)) &&
      (game.trialPrompt === undefined || game.continuous && typeof game.trialPrompt === "string" &&
        game.trialPrompt.trim() && !game.prompts.some(prompt => prompt && prompt.text === game.trialPrompt)) &&
      (game.mode !== "rapid" || Number.isInteger(game.roundSize) && game.roundSize > 0 &&
        Number.isInteger(game.guessSeconds) && game.guessSeconds > 0 &&
        Number.isInteger(game.revealSeconds) && game.revealSeconds >= 0 &&
        (game.transitionSeconds === undefined || Number.isInteger(game.transitionSeconds) && game.transitionSeconds >= 0) &&
        (game.readAloud === undefined || typeof game.readAloud === "boolean") &&
        game.seconds === game.roundSize * rapidStepSeconds(game) &&
        game.example && typeof game.example.text === "string" && game.example.text.trim() &&
        typeof game.example.answer === "string" && game.example.answer.trim() &&
        typeof game.example.tip === "string" && game.example.tip.trim() &&
        typeof game.intro === "string" && game.intro.trim() &&
        (game.lineGuide === undefined || typeof game.lineGuide === "string" && game.lineGuide.trim()) &&
        (game.promptUnit === undefined || typeof game.promptUnit === "string" && game.promptUnit.trim()) &&
        game.prompts.every(prompt => prompt && prompt.text !== game.example.text) &&
        new Set(game.prompts.map(prompt => prompt && prompt.text)).size === game.prompts.length &&
        (game.revealSeconds === 0 || new Set(game.prompts.map(prompt => prompt && prompt.answer)).size === game.prompts.length)) &&
      game.prompts.every(prompt => prompt && typeof prompt.text === "string" && prompt.text.trim() &&
        (!(game.mode === "quiz" || game.mode === "rapid" && game.revealSeconds > 0) || prompt.answer !== undefined) &&
        (prompt.answer === undefined || typeof prompt.answer === "string" && prompt.answer.trim()) &&
        (prompt.suggested === undefined || typeof prompt.suggested === "boolean") &&
        (prompt.audio === undefined || typeof prompt.audio === "string" && prompt.audio.trim()))
    ) && new Set(games.map(game => game.id)).size === games.length;
    if (!valid) {
      partyError("Party game content is invalid. Check unique IDs, rules, prompts and round lengths in games-content.js.");
      return;
    }
    games.forEach(game => byId.set(game.id, game));
    state = loadState();
    renderMenu();
    renderWheel();
    renderRound();
    renderPartySetup();
    showPartyTab(state.playerCount === null ? "setup" : "games");
    saveState();

    for (const name of ["setup", "games"]) {
      el(`party-${name}-tab`).addEventListener("click", () => showPartyTab(name));
      el(`party-${name}-tab`).addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        showPartyTab(event.key === "Home" ? "setup" : event.key === "End" ? "games" : name === "setup" ? "games" : "setup", true);
      });
    }
    el("party-setup-form").addEventListener("submit", event => {
      event.preventDefault();
      const input = el("party-player-count");
      const count = Number(input.value);
      if (!input.checkValidity() || !validPlayerCount(count)) {
        input.reportValidity();
        partyError("Enter a whole-number player count between 2 and 20. Your previous plan was kept.");
        return;
      }
      clearPartyError();
      state.playerCount = count;
      saveState();
      renderPartySetup();
      renderGamePlan(byId.get(state.selectedId));
    });
    el("party-open-games").addEventListener("click", () => showPartyTab("games", true));
    el("round-edit-setup").addEventListener("click", () => {
      navigate("party");
      showPartyTab("setup");
      el("party-player-count").focus();
    });
    for (const id of ["drawing-trial", "party-try-drawing"]) {
      el(id).addEventListener("click", () => {
        const game = byId.get("drawing-telephone");
        selectGame(game.id);
        drawing.trial = true;
        updatePromptView();
        renderGamePlan(game);
        renderTimer();
      });
    }
    el("game-filter").addEventListener("change", renderMenu);
    for (const [id, enabled] of [["enable-all-games", true], ["disable-all-games", false]]) {
      el(id).addEventListener("click", () => {
        stopSpin();
        state.enabled = enabled ? games.map(game => game.id) : [];
        saveState();
        renderMenu();
        renderWheel();
      });
    }
    el("spin-wheel").addEventListener("click", spinWheel);
    el("play-wheel-game").addEventListener("click", () => selectGame(state.selectedId));
    el("start-rapid-round").addEventListener("click", beginRapidRound);
    el("rapid-answer-start").addEventListener("click", runTimer);
    el("rapid-next-round").addEventListener("click", () => chooseRapidRound(rapid.round + 1));
    for (const id of ["rapid-choose-round", "rapid-round-menu"]) {
      el(id).addEventListener("click", () => chooseRapidRound(rapid.round));
    }
    el("rapid-skip-tile").addEventListener("click", () => {
      nextRapidPrompt();
      if (running) rapid.phaseDeadline = performance.now() + rapid.phaseRemaining * 1000;
      renderTimer();
    });
    for (const [id, difference] of [["previous-prompt", -1], ["next-prompt", 1]]) {
      el(id).addEventListener("click", () => {
        if (drawing) {
          nextDrawingPrompt();
          return;
        }
        if (rapid) {
          nextRapidPrompt();
          if (running) rapid.phaseDeadline = performance.now() + rapid.phaseRemaining * 1000;
          renderTimer();
          return;
        }
        state.promptIndex += difference;
        renderPrompt();
      });
    }
    el("shuffle-prompt").addEventListener("click", () => {
      const count = byId.get(state.selectedId).prompts.length;
      const offset = 1 + Math.floor(Math.random() * (count - 1));
      state.promptIndex = (state.promptIndex + offset) % count;
      renderPrompt();
    });
    el("reveal-prompt").addEventListener("click", () => {
      promptRevealed = !promptRevealed;
      updatePromptView();
    });
    el("timer-seconds").addEventListener("change", () => {
      const seconds = readDuration();
      if (seconds !== null) {
        clearPartyError();
        if (drawing) prepareDrawingGame(drawing.count, seconds, drawing.startIndex);
        else setTimer(seconds);
      }
    });
    el("drawing-prompt-count").addEventListener("change", () => {
      const count = readDrawingCount();
      if (count === null) return;
      clearPartyError();
      prepareDrawingGame(count, suggestedDrawingTime(count), drawing.startIndex);
    });
    el("reset-timer").addEventListener("click", () => {
      if (rapid) {
        beginRapidRound();
        return;
      }
      if (drawing) {
        prepareDrawingGame(drawing.count, drawing.duration, drawing.startIndex);
        return;
      }
      const seconds = readDuration();
      if (seconds !== null) {
        clearPartyError();
        if (drawing) {
          if (drawing.complete) prepareDrawingGame(drawing.count, drawing.duration, drawing.startIndex);
          drawing.started = true;
        }
        setTimer(seconds);
      }
    });
    el("start-timer").addEventListener("click", () => {
      if (running) {
        pauseTimer();
        el("round-status").textContent = rapid ? "Paused. Press Resume to continue." : "Paused. Press Start timer to resume.";
        return;
      }
      if (rapid) {
        if (rapid.complete) beginRapidRound();
        else runTimer();
        return;
      }
      const startingDrawing = drawing && (!drawing.started || drawing.complete);
      const drawingCount = startingDrawing ? readDrawingCount() : null;
      if (startingDrawing && drawingCount === null) return;
      const seconds = readDuration();
      if (seconds === null) return;
      clearPartyError();
      if (startingDrawing) prepareDrawingGame(drawingCount, seconds, drawing.startIndex);
      if (drawing) drawing.started = true;
      if (remaining <= 0) remaining = seconds;
      if (byId.get(state.selectedId).mode === "secret") {
        promptRevealed = false;
        updatePromptView();
      }
      runTimer();
    });
    el("round-audio-file").addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(file.name)) {
        event.target.value = "";
        partyError("Choose an audio file such as MP3, WAV, M4A or OGG.");
        return;
      }
      clearPartyError();
      const old = audioSlots.get(audioKey());
      audio.pause();
      if (old) URL.revokeObjectURL(old.url);
      audioSlots.set(audioKey(), { name: file.name, url: URL.createObjectURL(file) });
      renderAudio();
    });
    el("remove-audio").addEventListener("click", () => {
      audio.pause();
      URL.revokeObjectURL(audioSlots.get(audioKey()).url);
      audioSlots.delete(audioKey());
      renderAudio();
    });
    audio.addEventListener("error", () => {
      if (audio.getAttribute("src")) {
        el("audio-status").textContent = "This clip couldn't play. Try another audio file.";
        partyError("The audio clip couldn't load or isn't supported by this browser. Choose another clip.");
      }
    });
    window.addEventListener("hashchange", () => {
      if (location.hash !== "#party-round") {
        if (running) {
          pauseTimer();
          el("round-status").textContent = "Paused because you left the round.";
        }
        audio.pause();
      }
      if (location.hash !== "#party") stopSpin();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (running) {
          pauseTimer();
          el("round-status").textContent = "Paused while this tab was hidden.";
        }
        audio.pause();
      }
    });
    window.addEventListener("pagehide", () => {
      pauseTimer();
      audio.pause();
      stopSpin();
      for (const slot of audioSlots.values()) URL.revokeObjectURL(slot.url);
      audioSlots.clear();
    });
    window.addEventListener("pageshow", event => {
      if (event.persisted && state.selectedId) renderAudio();
    });
  }

  initializeParty();
})();

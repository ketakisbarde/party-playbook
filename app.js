"use strict";

const content = window.birthdayContent;
const pages = [...document.querySelectorAll(".page")];
const pageIds = new Set(pages.map(page => page.id));
const errorBox = document.getElementById("site-error");
let messageIndex = 0;
let friendMessages = [];
let confettiTimer;
let celebrationAudio;
let celebrationVolume;
let celebrationSoundEnabled = true;

function reportError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function clearError() {
  errorBox.textContent = "";
  errorBox.hidden = true;
}

function showPage(id, moveFocus = true) {
  if (!pageIds.has(id)) {
    reportError("That birthday page doesn't exist. Use the chapter buttons below to return home.");
    return;
  }
  clearError();
  pages.forEach(page => { page.hidden = page.id !== id; });
  document.body.classList.toggle("birthday-chapter", document.getElementById(id).hasAttribute("data-fit-screen"));
  document.getElementById("celebration-sound").hidden = id !== "cake";
  if (id === "messages") setNoteRevealed(false);
  const chapter = ["messages", "ours", "physical"].includes(id) ? "gifts" : id === "party-round" ? "party" : id;
  document.querySelectorAll("[data-chapter]").forEach(link => {
    if (link.dataset.chapter === chapter) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
  if (moveFocus) {
    const heading = document.getElementById(id).querySelector("h1");
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function navigate(id) {
  if (window.location.hash === `#${id}`) showPage(id);
  else window.location.hash = id;
}

function setNoteRevealed(revealed) {
  const card = document.getElementById("flip-note");
  card.classList.toggle("revealed", revealed);
  card.setAttribute("aria-pressed", String(revealed));
  card.setAttribute("aria-label", revealed ? "Hide the name and return to the note" : "Reveal who wrote this note");
  card.setAttribute("aria-describedby", revealed ? "friend-name flip-hint" : "friend-message flip-hint");
  document.getElementById("note-front").setAttribute("aria-hidden", String(revealed));
  document.getElementById("note-back").setAttribute("aria-hidden", String(!revealed));
  document.getElementById("friend-name").textContent = revealed ? friendMessages[messageIndex].name : "";
  document.getElementById("flip-hint").textContent = card.disabled
    ? "Your guessing game will be ready when the wishes arrive."
    : revealed ? "Click the note again to return to the wish." : "Guess first, then click the note to reveal the name.";
}

function renderMessage() {
  const messages = friendMessages;
  const hasMessages = messages.length > 0;
  document.getElementById("flip-note").disabled = !hasMessages;
  setNoteRevealed(false);
  document.getElementById("friend-message").textContent = hasMessages
    ? messages[messageIndex].message
    : "Your letters are still on their way. Come back soon for a little love from your people.";
  document.getElementById("message-count").textContent = hasMessages
    ? `${messageIndex + 1} of ${messages.length} notes`
    : "No notes yet";
  document.getElementById("previous-message").disabled = !hasMessages || messageIndex === 0;
  document.getElementById("next-message").disabled = !hasMessages || messageIndex === messages.length - 1;
}

function loadPhoto(elementId, path, alt) {
  if (!path) return;
  const container = document.getElementById(elementId);
  const image = new Image();
  image.alt = alt;
  image.addEventListener("load", () => {
    container.replaceChildren(image);
    container.classList.add("has-photo");
  });
  image.addEventListener("error", () => {
    reportError(`The photo "${path}" couldn't load. Check the photo path in content.js.`);
  });
  image.src = path;
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

function celebrate() {
  const container = document.getElementById("confetti");
  clearTimeout(confettiTimer);
  container.replaceChildren();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let index = 0; index < 140; index += 1) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 1.8}s`;
    piece.style.animationDuration = `${3 + Math.random() * 2.5}s`;
    piece.style.setProperty("--drift", `${Math.random() * 200 - 100}px`);
    piece.style.width = `${6 + Math.random() * 7}px`;
    piece.style.height = `${8 + Math.random() * 10}px`;
    piece.style.rotate = `${Math.random() * 180}deg`;
    container.append(piece);
  }
  confettiTimer = setTimeout(() => container.replaceChildren(), 7600);
}

async function playCelebrationSound() {
  if (!celebrationSoundEnabled) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    reportError("Birthday sound isn't supported in this browser. You can still enjoy the celebration without sound.");
    return;
  }
  try {
    if (!celebrationAudio || celebrationAudio.state === "closed") {
      celebrationAudio = new AudioContext();
      celebrationVolume = celebrationAudio.createGain();
      celebrationVolume.connect(celebrationAudio.destination);
    }
    if (celebrationAudio.state !== "running") await celebrationAudio.resume();
    if (!celebrationSoundEnabled || document.getElementById("cake").hidden) return;
    if (celebrationAudio.state !== "running") {
      reportError("The browser couldn't start the birthday sound. Try enabling sound in the browser or celebrate with sound off.");
      return;
    }
    const start = celebrationAudio.currentTime;
    celebrationVolume.gain.setValueAtTime(.18, start);
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = celebrationAudio.createOscillator();
      const filter = celebrationAudio.createBiquadFilter();
      const gain = celebrationAudio.createGain();
      const noteStart = start + index * .17;
      const noteEnd = noteStart + (index === 2 ? .4 : .18);
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, noteStart);
      gain.gain.setValueAtTime(.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(.35, noteStart + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, noteEnd);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(celebrationVolume);
      oscillator.onended = () => {
        oscillator.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);
    });
  } catch (error) {
    reportError(`Couldn't play the birthday sound: ${error.message}. The rest of the surprise still works.`);
  }
}

function resetCake() {
  const button = document.getElementById("blow-candles");
  button.classList.remove("blown-out");
  button.disabled = false;
  document.getElementById("cake-status").textContent = "One click. One wish. All the love.";
  document.getElementById("after-cake").hidden = true;
}

function initialize() {
  if (!content || !Array.isArray(content.friendMessages) ||
      !content.friendMessages.every(note => note && typeof note.name === "string" && note.name.trim() &&
        typeof note.message === "string" && note.message.trim())) {
    reportError("Birthday content is missing or invalid. Each friendMessages entry in content.js needs a non-empty name and message.");
    return;
  }
  friendMessages = shuffleItems(content.friendMessages);
  document.querySelectorAll("[data-content]").forEach(element => {
    element.textContent = content[element.dataset.content];
  });
  document.querySelectorAll("img[data-required-asset]").forEach(image => {
    const showAssetError = () => reportError(`Birthday image couldn't load: ${image.getAttribute("src")}. Check that the image is in the website folder.`);
    image.addEventListener("error", showAssetError, { once: true });
    if (image.complete && image.naturalWidth === 0) showAssetError();
  });
  loadPhoto("birthday-photo", content.birthdayPhoto, "The birthday boy");
  loadPhoto("couple-photo", content.couplePhoto, "A favorite memory together");
  document.getElementById("messages-preview").hidden = !content.messagesArePreview;
  renderMessage();
  document.getElementById("flip-note").addEventListener("click", event => {
    setNoteRevealed(!event.currentTarget.classList.contains("revealed"));
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.go));
  });
  document.getElementById("blow-candles").addEventListener("click", event => {
    event.currentTarget.classList.add("blown-out");
    event.currentTarget.disabled = true;
    document.getElementById("cake-status").textContent = "Wish made. Here's to your happiest year yet!";
    document.getElementById("after-cake").hidden = false;
    celebrate();
    void playCelebrationSound();
    document.getElementById("after-cake").focus({ preventScroll: true });
  });
  document.getElementById("celebration-sound").addEventListener("click", event => {
    celebrationSoundEnabled = !celebrationSoundEnabled;
    event.currentTarget.textContent = celebrationSoundEnabled ? "Sound on" : "Sound off";
    event.currentTarget.setAttribute("aria-pressed", String(celebrationSoundEnabled));
    if (celebrationAudio && celebrationAudio.state !== "closed") {
      celebrationVolume.gain.setValueAtTime(celebrationSoundEnabled ? .18 : 0, celebrationAudio.currentTime);
    }
  });
  document.getElementById("decline").addEventListener("click", () => {
    document.getElementById("retry-message").textContent = "Please try again! These were picked just for you.";
    document.querySelector(".yes-button").focus({ preventScroll: true });
  });
  document.getElementById("previous-message").addEventListener("click", () => {
    if (messageIndex > 0) messageIndex -= 1;
    renderMessage();
  });
  document.getElementById("next-message").addEventListener("click", () => {
    if (messageIndex < friendMessages.length - 1) messageIndex += 1;
    renderMessage();
  });
  document.getElementById("restart").addEventListener("click", () => {
    resetCake();
    messageIndex = 0;
    renderMessage();
    document.getElementById("retry-message").textContent = "";
    clearTimeout(confettiTimer);
    document.getElementById("confetti").replaceChildren();
    if (celebrationAudio && celebrationAudio.state !== "closed") {
      celebrationVolume.gain.setValueAtTime(0, celebrationAudio.currentTime);
    }
    navigate("welcome");
  });
  const fullscreenButton = document.getElementById("fullscreen");
  fullscreenButton.addEventListener("click", async () => {
    clearError();
    if (!document.fullscreenEnabled) {
      reportError("Fullscreen isn't available in this browser. Use your browser's fullscreen command or cast the window to your TV.");
      return;
    }
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      reportError(`Couldn't enter fullscreen: ${error.message}. You can still cast the browser window to your TV.`);
    }
  });
  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "Exit fullscreen" : "TV / fullscreen";
    fullscreenButton.setAttribute("aria-pressed", String(Boolean(document.fullscreenElement)));
  });
  window.addEventListener("hashchange", () => showPage(window.location.hash.slice(1) || "welcome"));
  showPage(window.location.hash.slice(1) || "welcome", false);
}

initialize();

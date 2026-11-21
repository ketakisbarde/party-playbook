"use strict";

const content = window.birthdayContent;
const pages = [...document.querySelectorAll(".page")];
const pageIds = new Set(pages.map(page => page.id));
const errorBox = document.getElementById("site-error");
let messageIndex = 0;
let confettiTimer;

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
  document.getElementById("friend-name").textContent = revealed ? content.friendMessages[messageIndex].name : "";
  document.getElementById("flip-hint").textContent = card.disabled
    ? "Your guessing game will be ready when the wishes arrive."
    : revealed ? "Click the note again to return to the wish." : "Guess first, then click the note to reveal the name.";
}

function renderMessage() {
  const messages = content.friendMessages;
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

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const container = document.getElementById("confetti");
  clearTimeout(confettiTimer);
  container.replaceChildren();
  for (let index = 0; index < 45; index += 1) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * .5}s`;
    piece.style.rotate = `${Math.random() * 180}deg`;
    container.append(piece);
  }
  confettiTimer = setTimeout(() => container.replaceChildren(), 3200);
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
    document.getElementById("after-cake").focus({ preventScroll: true });
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
    if (messageIndex < content.friendMessages.length - 1) messageIndex += 1;
    renderMessage();
  });
  document.getElementById("restart").addEventListener("click", () => {
    resetCake();
    messageIndex = 0;
    renderMessage();
    document.getElementById("retry-message").textContent = "";
    clearTimeout(confettiTimer);
    document.getElementById("confetti").replaceChildren();
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

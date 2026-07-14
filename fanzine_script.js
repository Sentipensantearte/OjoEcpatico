
const pages = Array.from(document.querySelectorAll(".page"));


function ensurePageInner() {
  pages.forEach((page) => {
    const paper = page.querySelector('.page-paper');
    if (!paper) return;
    if (paper.querySelector('.page-inner')) return;

    const inner = document.createElement('div');
    inner.className = 'page-inner';

    const content = document.createElement('div');
    content.className = 'page-content';

    // Mover todos los hijos actuales dentro del wrapper de contenido
    while (paper.firstChild) {
      content.appendChild(paper.firstChild);
    }

    inner.appendChild(content);
    paper.appendChild(inner);
  });
}

function getPageScale(page) {
  const paper = page.querySelector('.page-paper');
  const inner = page.querySelector('.page-inner');
  const content = inner ? inner.querySelector('.page-content') : null;
  if (!paper || !inner || !content) return 1;


  const cs = getComputedStyle(inner);
  const padLeft = parseFloat(cs.paddingLeft) || 0;
  const padRight = parseFloat(cs.paddingRight) || 0;
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;

  const availW = paper.clientWidth - padLeft - padRight;
  const availH = paper.clientHeight - padTop - padBottom;

 
  content.style.transform = 'none';
  const rect = content.getBoundingClientRect();
  const contentW = Math.max(1, rect.width);
  const contentH = Math.max(1, rect.height);

  if (contentW === 0 || contentH === 0) return 1;

  return Math.min(1, availW / contentW, availH / contentH);
}

function fitPageElement(page, globalScale) {
  const paper = page.querySelector('.page-paper');
  const inner = page.querySelector('.page-inner');
  const content = inner ? inner.querySelector('.page-content') : null;
  if (!paper || !inner || !content) return;

  const cs = getComputedStyle(inner);
  const padTop = parseFloat(cs.paddingTop) || 0;

  let scale = page.classList.contains('cover') ? 1 : globalScale;
  if (!page.classList.contains('cover')) {
    const minScale = 0.82;
    scale = Math.max(minScale, scale);
  }

  content.style.transform = scale === 1 ? 'none' : `scale(${scale})`;
  inner.style.transform = `translateY(${padTop / Math.max(scale, 1)}px)`;
}

function fitAllPages() {
  const globalScale = pages.reduce((scale, page) => {
    if (page.classList.contains('cover')) return scale;
    return Math.min(scale, getPageScale(page));
  }, 1);

  pages.forEach((page) => fitPageElement(page, globalScale));
}

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fitAllPages, 120);
});


const prevPageButton = document.querySelector("#prevPage");
const nextPageButton = document.querySelector("#nextPage");
const pageCounter = document.querySelector("#pageCounter");
const menuButton = document.querySelector("#menuButton");
const closeIndexButton = document.querySelector("#closeIndex");
const indexPanel = document.querySelector("#indexPanel");
const indexList = document.querySelector("#indexList");


let currentPage = 0;


function twoDigits(number) {
  return String(number).padStart(2, "0");
}


function showPage(pageNumber) {
 
  currentPage = Math.max(0, Math.min(pageNumber, pages.length - 1));

 
  pages.forEach((page, index) => {
    page.classList.toggle("active", index === currentPage);
  });

  
  pageCounter.textContent = `${twoDigits(currentPage)} / ${twoDigits(pages.length - 1)}`;

 
  document.querySelectorAll("[data-index-button]").forEach((button, index) => {
    button.classList.toggle("active", index === currentPage);
  });

  
  requestAnimationFrame(fitAllPages);
}


function buildIndex() {
  pages.forEach((page, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.indexButton = index;
    button.textContent = `${twoDigits(index)} - ${page.dataset.title}`;

       button.addEventListener("click", () => {
      showPage(index);
      closeIndex();
    });

    indexList.appendChild(button);
  });
}


function openIndex() {
  indexPanel.classList.add("open");
  indexPanel.setAttribute("aria-hidden", "false");
}


function closeIndex() {
  indexPanel.classList.remove("open");
  indexPanel.setAttribute("aria-hidden", "true");
}


prevPageButton.addEventListener("click", () => showPage(currentPage - 1));
nextPageButton.addEventListener("click", () => showPage(currentPage + 1));


menuButton.addEventListener("click", openIndex);
closeIndexButton.addEventListener("click", closeIndex);


document.querySelectorAll("[data-go-to]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(Number(button.dataset.goTo));
  });
});


document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showPage(currentPage + 1);
  if (event.key === "ArrowLeft") showPage(currentPage - 1);
  if (event.key === "Escape") closeIndex();
});


document.querySelectorAll("[data-toggle-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const note = document.querySelector(`#${button.dataset.toggleTarget}`);
    note.classList.toggle("visible");
    
    requestAnimationFrame(fitAllPages);
  });
});


const blinkEyeButton = document.querySelector("#blinkEye");
if (blinkEyeButton) {
  blinkEyeButton.addEventListener("click", () => {
    blinkEyeButton.classList.toggle("blink");
  });
};




const authorOutput = document.querySelector("#authorOutput");
document.querySelectorAll("[data-author]").forEach((button) => {
  button.addEventListener("click", () => {
    authorOutput.textContent = authorTexts[button.dataset.author];
  });
});



const postTexts = {
  pulso: "PULSO: pagina publica, senial hacia afuera, ritmo de difusion.",
  eco: "ECO: grupo participativo, foro, archivo vivo de aportes.",
  reel: "REEL MANIFIESTO: golpe corto para abrir la pregunta en el feed."
};

const postOutput = document.querySelector("#postOutput");
const postStickerWall = document.querySelector("#postStickerWall");
document.querySelectorAll("[data-post]").forEach((button) => {
  button.addEventListener("click", () => {
    postOutput.textContent = postTexts[button.dataset.post];

    if (postStickerWall) {
      const image = button.querySelector("img");
      if (!image) return;

      const sticker = document.createElement("img");
      sticker.src = image.src;
      sticker.alt = image.alt;
      sticker.className = "sticker-item";
      postStickerWall.appendChild(sticker);
    }
  });
});


const duplicateStickerButton = document.querySelector("#duplicateSticker");
const stickerWall = document.querySelector("#stickerWall");

if (duplicateStickerButton && stickerWall) {
  duplicateStickerButton.addEventListener("click", () => {
    const sticker = document.createElement("img");
    sticker.src = "assets/ojolog.png";
    sticker.alt = "Sticker pegado";
    sticker.className = "sticker-item";
    stickerWall.appendChild(sticker);
  });
}


let activeSticker = null;
let offsetX = 0;
let offsetY = 0;

const stickerStartPositions = {
  4: { left: "40%", top: "87%" },
  6: { left: "65%", top: "80%" },
  8: { left: "18%", top: "76%" },
  12: { left: "10%", top: "48%" }
};

function createStickerOnPage(pageIndex) {
  const page = pages[pageIndex];
  if (!page) return;
  const paper = page.querySelector(".page-paper");
  if (!paper) return;
  if (paper.querySelector(".draggable-item")) return;

  const position = stickerStartPositions[pageIndex];
  if (!position) return;

  const sticker = document.createElement("img");
  sticker.src = "assets/neutro.png";
  sticker.alt = "Ojo neutro";
  sticker.className = "draggable-item";
  sticker.dataset.pageSticker = String(pageIndex);
  sticker.style.position = "absolute";
  sticker.style.left = position.left;
  sticker.style.top = position.top;
  sticker.style.width = "100px";
  sticker.draggable = false;
  sticker.style.zIndex = "60";
  sticker.addEventListener("dragstart", (event) => event.preventDefault());
  paper.appendChild(sticker);
}

function initializeStickerDrag() {
  document.querySelectorAll(".draggable-item").forEach((sticker) => {
    sticker.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      activeSticker = event.currentTarget;
      const rect = activeSticker.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      activeSticker.setPointerCapture(event.pointerId);
      activeSticker.style.zIndex = "80";
    });
  });
}

function initStickerInteraction() {
  const selectedPages = [4, 6, 8, 12];
  selectedPages.forEach((pageIndex) => createStickerOnPage(pageIndex));
  initializeStickerDrag();
}

document.addEventListener("pointermove", (event) => {
  if (!activeSticker) return;

  const parentRect = activeSticker.parentElement.getBoundingClientRect();
  const stickerRect = activeSticker.getBoundingClientRect();

  let left = event.clientX - parentRect.left - offsetX;
  let top = event.clientY - parentRect.top - offsetY;

  left = Math.max(0, Math.min(left, parentRect.width - stickerRect.width));
  top = Math.max(0, Math.min(top, parentRect.height - stickerRect.height));

  activeSticker.style.left = `${left}px`;
  activeSticker.style.top = `${top}px`;
});

document.addEventListener("pointerup", () => {
  if (!activeSticker) return;
  activeSticker.style.zIndex = "60";
  activeSticker = null;
});

document.addEventListener("pointercancel", () => {
  if (!activeSticker) return;
  activeSticker.style.zIndex = "60";
  activeSticker = null;
});

initStickerInteraction();


const finalForm = document.querySelector("#finalForm");
const finalNote = document.querySelector("#finalNote");
const notesWall = document.querySelector("#notesWall");

function addNote(text) {
  const note = document.createElement("p");
  note.textContent = text;
  notesWall.appendChild(note);
}

if (finalForm && finalNote && notesWall) {
  finalForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = finalNote.value.trim();
    if (text === "") return;

    addNote(text);
    finalNote.value = "";
  });
}


function attachImageLoadHandlers() {
  pages.forEach((page) => {
    const imgs = Array.from(page.querySelectorAll('img'));
    imgs.forEach((img) => {
      if (img.complete) {
        
        requestAnimationFrame(fitAllPages);
      } else {
        img.addEventListener('load', () => fitAllPages());
      }
    });
  });
}

buildIndex();

ensurePageInner();
fitAllPages();
showPage(0);
attachImageLoadHandlers();

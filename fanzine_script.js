/* =========================================================
   JAVASCRIPT DEL FANZINE
   Este archivo solo maneja interactividad.
   La idea es que sea facil de leer y modificar.
   ========================================================= */

/* Guardamos todas las paginas en un array para poder navegar. */
const pages = Array.from(document.querySelectorAll(".page"));

/* Envoltorio interno para cada page-paper: permite escalar contenido sin scroll. */
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

  // Account for inner padding so content doesn't get scaled into the padding area
  const cs = getComputedStyle(inner);
  const padLeft = parseFloat(cs.paddingLeft) || 0;
  const padRight = parseFloat(cs.paddingRight) || 0;
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;

  const availW = paper.clientWidth - padLeft - padRight;
  const availH = paper.clientHeight - padTop - padBottom;

  // Use the dedicated content box for stable measurements
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

/* Guardamos botones y lugares importantes de la interfaz. */
const prevPageButton = document.querySelector("#prevPage");
const nextPageButton = document.querySelector("#nextPage");
const pageCounter = document.querySelector("#pageCounter");
const menuButton = document.querySelector("#menuButton");
const closeIndexButton = document.querySelector("#closeIndex");
const indexPanel = document.querySelector("#indexPanel");
const indexList = document.querySelector("#indexList");

/* Esta variable dice que pagina se esta viendo ahora. */
let currentPage = 0;

/* Funcion chica para escribir numeros con dos digitos: 1 pasa a 01. */
function twoDigits(number) {
  return String(number).padStart(2, "0");
}

/* Muestra una pagina y oculta todas las demas. */
function showPage(pageNumber) {
  /* Evita que el numero se vaya antes de la primera o despues de la ultima pagina. */
  currentPage = Math.max(0, Math.min(pageNumber, pages.length - 1));

  /* Recorremos todas las paginas y dejamos activa solo la actual. */
  pages.forEach((page, index) => {
    page.classList.toggle("active", index === currentPage);
  });

  /* Actualizamos el contador inferior. */
  pageCounter.textContent = `${twoDigits(currentPage)} / ${twoDigits(pages.length - 1)}`;

  /* Marcamos en el indice cual pagina esta activa. */
  document.querySelectorAll("[data-index-button]").forEach((button, index) => {
    button.classList.toggle("active", index === currentPage);
  });

  // Ajustar escala global de todas las paginas para mantener coherencia.
  requestAnimationFrame(fitAllPages);
}

/* Construye el indice leyendo el atributo data-title de cada pagina. */
function buildIndex() {
  pages.forEach((page, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.indexButton = index;
    button.textContent = `${twoDigits(index)} - ${page.dataset.title}`;

    /* Cada boton del indice lleva a su pagina. */
    button.addEventListener("click", () => {
      showPage(index);
      closeIndex();
    });

    indexList.appendChild(button);
  });
}

/* Abre el indice lateral. */
function openIndex() {
  indexPanel.classList.add("open");
  indexPanel.setAttribute("aria-hidden", "false");
}

/* Cierra el indice lateral. */
function closeIndex() {
  indexPanel.classList.remove("open");
  indexPanel.setAttribute("aria-hidden", "true");
}

/* Botones de navegacion inferior. */
prevPageButton.addEventListener("click", () => showPage(currentPage - 1));
nextPageButton.addEventListener("click", () => showPage(currentPage + 1));

/* Botones de indice. */
menuButton.addEventListener("click", openIndex);
closeIndexButton.addEventListener("click", closeIndex);

/* Botones que tienen data-go-to, por ejemplo la portada. */
document.querySelectorAll("[data-go-to]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(Number(button.dataset.goTo));
  });
});

/* Flechas del teclado para navegar. Escape cierra el indice. */
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showPage(currentPage + 1);
  if (event.key === "ArrowLeft") showPage(currentPage - 1);
  if (event.key === "Escape") closeIndex();
});

/* =========================================================
   INTERACCIONES POR PAGINA
   ========================================================= */

/* Interaccion generica: muestra u oculta una nota escondida. Recalcula escala. */
document.querySelectorAll("[data-toggle-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const note = document.querySelector(`#${button.dataset.toggleTarget}`);
    note.classList.toggle("visible");
    // Recompute the global scale so visible text and notes fit consistently.
    requestAnimationFrame(fitAllPages);
  });
});

/* Pagina 2: cerrar y abrir el ojo. */
const blinkEyeButton = document.querySelector("#blinkEye");
if (blinkEyeButton) {
  blinkEyeButton.addEventListener("click", () => {
    blinkEyeButton.classList.toggle("blink");
  });
}

/* Pagina 4: textos de autores en lenguaje fanzine. */
const authorTexts = {
  franco: "Franco avisa: las redes fueron nuestras antes de que las capturaran. El proyecto intenta abrir un hueco comun dentro de esa captura.",
  casacuberta: "Casacuberta sirve para romper el pedestal: crear tambien es armar herramientas para que otres completen la obra.",
  heinz: "Heinz trae la estrategia DIY: no esperar permiso del sistema, construir alternativa, publicarla y dejar que circule.",
  scolari: "Scolari ordena el mapa: transmedia no es copiar y pegar, es que cada medio agregue una pieza distinta."
};

const authorOutput = document.querySelector("#authorOutput");
document.querySelectorAll("[data-author]").forEach((button) => {
  button.addEventListener("click", () => {
    authorOutput.textContent = authorTexts[button.dataset.author];
  });
});


/* Pagina 9: piezas de redes. */
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

/* Pagina 10: duplicar sticker con imagen en lugar de texto. */
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

/* Movilidad de stickers en paginas seleccionadas. */
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

/* Pagina 13: formulario final. Guarda notas solo en esta computadora/navegador. */
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

/* Inicializacion: armamos indice y mostramos la portada. */
// Recompute scaling when images inside pages finish loading
function attachImageLoadHandlers() {
  pages.forEach((page) => {
    const imgs = Array.from(page.querySelectorAll('img'));
    imgs.forEach((img) => {
      if (img.complete) {
        // already loaded - ensure page scales correctly
        requestAnimationFrame(fitAllPages);
      } else {
        img.addEventListener('load', () => fitAllPages());
      }
    });
  });
}

buildIndex();
// Preparar wrappers y ajustar escalado automático
ensurePageInner();
fitAllPages();
showPage(0);
attachImageLoadHandlers();

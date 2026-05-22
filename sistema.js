// ====================================
// ELEMENTOS
// ====================================

const palabras =
  document.querySelectorAll(".palabra");

const modal =
  document.getElementById("modal");

const cerrarModal =
  document.getElementById("cerrar-modal");

const ojoImg =
  document.getElementById("ojo-img");

const eyeMap = {
  Derecha: "assets/ojo/Derecha.png",
  DerArriba: "assets/ojo/DerArriba.png",
  Arriba: "assets/ojo/Arriba.png",
  IzqArriba: "assets/ojo/IzqArriba.png",
  izquierda: "assets/ojo/izquierda.png",
  IzqAbajo: "assets/ojo/IzqAbajo.png",
  Abajo: "assets/ojo/Abajo.png",
  DerAbajo: "assets/ojo/DerAbajo.png",
  neutro: "assets/ojo/neutro.png",
  neutro1: "assets/ojo/neutro1.png"
};

let hoverCount = 0;
let idleFrame = 0;
let idleTimer = null;

// ====================================
// VARIABLES GLOBALES
// ====================================

let anchoPantalla;
let altoPantalla;

let centroX;
let centroY;

let radioX;
let radioY;

let rotacion = 0;

let velocidad = 0.08;

// ====================================
// FUNCION RESPONSIVE
// ====================================

function recalcularSistema() {

  // tamaño pantalla

  anchoPantalla =
    window.innerWidth;

  altoPantalla =
    window.innerHeight;

  // centro

  centroX =
    anchoPantalla / 2;

  centroY =
    altoPantalla / 2;

  // usamos el lado mas chico
  // para mantener proporciones

  const ladoMenor =
    Math.min(
      anchoPantalla,
      altoPantalla
    );

  // ==================================
  // TAMAÑO ORBITA
  // ==================================

  const isLandscape = anchoPantalla > altoPantalla;
  if (isLandscape) {
    radioX = ladoMenor * 0.34;
    radioY = ladoMenor * 0.16;
  } else {
    radioX = ladoMenor * 0.38;
    radioY = ladoMenor * 0.20;
  }

  // ==================================
  // RESPONSIVE TEXTO
  // ==================================

  palabras.forEach((palabra) => {

    // tamaño base responsive

    let tamañoFuente =
      ladoMenor * 0.022;

    // limites

    tamañoFuente =
      Math.max(12, tamañoFuente);

    tamañoFuente =
      Math.min(22, tamañoFuente);

    palabra.style.fontSize =
      tamañoFuente + "px";
  });
}

// ejecutamos una vez
recalcularSistema();

// recalculamos al cambiar tamaño
window.addEventListener(
  "resize",
  recalcularSistema
);

function setEyeImage(key) {
  const src = eyeMap[key] || eyeMap.neutro;
  ojoImg.src = src;
}

function getClientCoordinates(event) {
  if (event.touches && event.touches.length) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY
    };
  }
  return {
    clientX: event.clientX,
    clientY: event.clientY
  };
}

function getEyeKeyFromMouse(coords) {
  const dx = coords.clientX - centroX;
  const dy = centroY - coords.clientY;
  let angle = Math.atan2(dy, dx) * 180 / Math.PI;
  if (angle < 0) angle += 360;

  const sector = Math.round(angle / 45) % 8;
  switch (sector) {
    case 0:
      return "Derecha";
    case 1:
      return "DerArriba";
    case 2:
      return "Arriba";
    case 3:
      return "IzqArriba";
    case 4:
      return "izquierda";
    case 5:
      return "IzqAbajo";
    case 6:
      return "Abajo";
    case 7:
      return "DerAbajo";
    default:
      return "neutro";
  }
}

function stopIdleAnimation() {
  if (idleTimer) {
    clearInterval(idleTimer);
    idleTimer = null;
  }
}

function startIdleAnimation() {
  stopIdleAnimation();
  idleTimer = setInterval(() => {
    if (hoverCount > 0) return;
    idleFrame = (idleFrame + 1) % 2;
    setEyeImage(idleFrame === 0 ? "neutro" : "neutro1");
  }, 650);
}

startIdleAnimation();

// ====================================
// ANIMACION ORBITAL
// ====================================

// ====================================
// ORIENTATION / ROTATE PROMPT
// ====================================

const rotateScreen = document.getElementById('rotate-screen');
let savedVelocidad = velocidad;

function checkOrientationPause() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const isSmall = window.matchMedia('(max-width: 900px)').matches;

  if (rotateScreen) {
    if (isPortrait && isSmall) {
      rotateScreen.style.display = 'flex';
      savedVelocidad = velocidad;
      velocidad = 0;
    } else {
      rotateScreen.style.display = 'none';
      velocidad = savedVelocidad || 0.08;
    }
  }
}

window.addEventListener('resize', () => {
  recalcularSistema();
  checkOrientationPause();
});
window.addEventListener('orientationchange', () => {
  recalcularSistema();
  checkOrientationPause();
});
checkOrientationPause();


function animar() {

  palabras.forEach((palabra) => {

    // angulo inicial

    const anguloBase =
      parseFloat(
        palabra.dataset.angulo
      );

    // angulo animado

    const angulo =
      (anguloBase + rotacion)
      * Math.PI / 180;

    // ==================================
    // POSICION
    // ==================================

    const x =
      centroX +
      Math.cos(angulo) * radioX;

    const y =
      centroY +
      Math.sin(angulo) * radioY;

    palabra.style.left =
      x + "px";

    palabra.style.top =
      y + "px";

    // ==================================
    // PROFUNDIDAD
    // ==================================

    const profundidad =
      (Math.sin(angulo) + 1) / 2;

    // escala

    const escala =
      0.7 + profundidad * 0.5;

    // opacidad

    palabra.style.opacity =
      0.25 + profundidad * 0.75;

    // transform

    palabra.style.transform =
      "translate(-50%, -50%) scale(" +
      escala +
      ")";
  });

  // rotacion global

  rotacion += velocidad;

  requestAnimationFrame(animar);
}

// iniciar
animar();

// ====================================
// INTERACCIONES
// ====================================

palabras.forEach((palabra) => {

  // ==================================
  // HOVER
  // ==================================

  const startTouchHover = (event) => {
    hoverCount += 1;
    stopIdleAnimation();
    velocidad = 0.01;

    const coords = getClientCoordinates(event);
    const eyeKey = getEyeKeyFromMouse(coords);
    setEyeImage(eyeKey);

    palabra.style.textShadow =
      "0 0 12px rgba(255,255,255,0.9)";
  };

  const moveTouchHover = (event) => {
    if (hoverCount === 0) return;
    const coords = getClientCoordinates(event);
    const eyeKey = getEyeKeyFromMouse(coords);
    setEyeImage(eyeKey);
  };

  const endTouchHover = () => {
    hoverCount = Math.max(0, hoverCount - 1);
    velocidad = 0.08;

    palabra.style.textShadow =
      "none";

    if (hoverCount === 0) {
      setTimeout(() => {
        if (hoverCount === 0) {
          startIdleAnimation();
        }
      }, 80);
    }
  };

  palabra.addEventListener(
    "mouseenter",
    startTouchHover
  );

  palabra.addEventListener(
    "pointerdown",
    startTouchHover
  );

  palabra.addEventListener(
    "touchstart",
    startTouchHover,
    { passive: true }
  );

  palabra.addEventListener(
    "mousemove",
    moveTouchHover
  );

  palabra.addEventListener(
    "touchmove",
    moveTouchHover,
    { passive: true }
  );

  palabra.addEventListener(
    "mouseleave",
    endTouchHover
  );

  palabra.addEventListener(
    "pointerup",
    endTouchHover
  );

  palabra.addEventListener(
    "touchend",
    endTouchHover
  );

  palabra.addEventListener(
    "touchcancel",
    endTouchHover
  );

  // ==================================
  // CLICK
  // ==================================

  palabra.addEventListener(
    "click",
    () => {

      velocidad = 0;

      modal.style.display =
        "flex";
    }
  );
});

// ====================================
// CERRAR MODAL
// ====================================

cerrarModal.addEventListener(
  "click",
  () => {

    modal.style.display =
      "none";

    velocidad = 0.08;
  }
);
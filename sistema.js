// ====================================
// ELEMENTOS
// ====================================

const palabras =
  document.querySelectorAll(".palabra");

const modal =
  document.getElementById("modal");

const cerrarModal =
  document.getElementById("cerrar-modal");

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

  radioX =
    ladoMenor * 0.38;

  radioY =
    ladoMenor * 0.20;

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

// ====================================
// ANIMACION ORBITAL
// ====================================

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

  palabra.addEventListener(
    "mouseenter",
    () => {

      velocidad = 0.01;

      palabra.style.textShadow =
        "0 0 12px rgba(255,255,255,0.9)";
    }
  );

  palabra.addEventListener(
    "mouseleave",
    () => {

      velocidad = 0.08;

      palabra.style.textShadow =
        "none";
    }
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
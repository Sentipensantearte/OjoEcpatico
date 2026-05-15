// ====================================
// PALABRAS
// ====================================

const palabras =
  document.querySelectorAll(".palabra");

// ====================================
// MODAL
// ====================================

const modal =
  document.getElementById("modal");

const cerrarModal =
  document.getElementById("cerrar-modal");

// ====================================
// CENTRO
// ====================================

const centroX =
  window.innerWidth / 2;

const centroY =
  window.innerHeight / 2;

// ====================================
// RADIOS
// ====================================

const radioX =
  window.innerWidth * 0.28;

const radioY =
  window.innerHeight * 0.20;

// ====================================
// ROTACION
// ====================================

let rotacion = 0;

// velocidad normal
let velocidad = 0.1;

// ====================================
// ANIMACION
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

    // posicion

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

    // profundidad

    const profundidad =
      (Math.sin(angulo) + 1) / 2;

    palabra.style.opacity =
      0.3 + profundidad * 0.7;

  });

  rotacion += velocidad;

  requestAnimationFrame(animar);
}

// iniciar
animar();

// ====================================
// INTERACCIONES
// ====================================

palabras.forEach((palabra) => {

  // hover

  palabra.addEventListener(
    "mouseenter",
    () => {

      velocidad = 0.01;
    }
  );

  palabra.addEventListener(
    "mouseleave",
    () => {

      velocidad = 0.1;
    }
  );

  // click

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

    velocidad = 0.1;
  }
);
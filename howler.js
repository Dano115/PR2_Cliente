const sound1 = new Howl({
  src: [
    "snd/Mrs.m4a",
    "Gods Eye.m4a",
    "Dave  Starlight.m4a",
    "Jim Legxacy x Dave  3x.m4a",
  ],
});

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const rewind = document.getElementById("rwn");
const next = document.getElementById("next");

start.addEventListener("click", () => {
  sound1.play();
});
stop.addEventListener("click", () => {
  sound1.stop();
});
rewind.addEventListener("click", () => {
  sound1.seek(0);
  sound1.play();
});
next.addEventListener("click", () => {
  sound1.next();
});

let cacnionesGlobales = {};

async function cargarInfo() {
  try {
    const respuesta = await fetch("songs.json");
    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo JSON");
    }
    cacnionesGlobales = await respuesta.json();
    console.log(cacnionesGlobales);
  } catch (error) {
    console.error("Hubo un error:", error);
  }
}

cargarInfo();
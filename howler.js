let listaCanciones = [];
let indice = 0;
let sound = null;

async function cargarInfo() {
  try {
    const respuesta = await fetch("songs.json");
    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo JSON");
    }
    datos = await respuesta.json();
    listaCanciones = Object.values(datos);
    console.log(listaCanciones.song2);
    reproducirCancion(indice);
    listarCanciones();
  } catch (error) {
    console.error("Hubo un error:", error);
  }
}

function listarCanciones(){
  lista.innerHTML = "";

listaCanciones.forEach((cancion,index) => {
  lista.innerHTML += `
  <img src="${cancion.cover}" alt="Portada">
  <br>
  <p><strong>${cancion.name} - ${cancion.cantante}</strong></p>
  `;

});
};

function reproducirCancion(index) {
  if (listaCanciones.length === 0) return;
  if (sound) {
    sound.stop();
    sound.unload();
  }
  const cancion = listaCanciones[index];

  sound = new Howl({
    src: [cancion.cancion],
    html5: true,
  });
  content.innerHTML = `
    <div>
      <img src="${cancion.cover}" alt="Portada">
    </div>
    <p><strong>${cancion.name} - ${cancion.cantante}</strong></p>
    
  `;

  sound.play();
}

cargarInfo();

const start = document.getElementById("start");
const stop = document.getElementById("stop");
const rewind = document.getElementById("rwn");
const next = document.getElementById("next");
const pause = document.getElementById("pause");
const mute = document.getElementById("mute");
const unmute = document.getElementById("unmute");
const content = document.getElementById("content");
const lista = document.getElementById("lista");


start.addEventListener("click", () => {
  if (sound) {
    sound.play();
  } else {
    console.log("El audio aún se está cargando...");
  }
});
mute.addEventListener("click", () => {
  sound.mute(true);
});
unmute.addEventListener("click", () => {
  sound.mute(false);
});
pause.addEventListener("click", () => {
  sound.pause();
});
stop.addEventListener("click", () => {
  sound.stop();
});
rewind.addEventListener("click", () => {
  if (listaCanciones.length === 0) return;
  indice = (indice - 1 + listaCanciones.length) % listaCanciones.length;
  reproducirCancion(indice);
});
next.addEventListener("click", () => {
  if (listaCanciones.length === 0) return;
  indice = (indice + 1) % listaCanciones.length;
  reproducirCancion(indice);
});
let listaCanciones = [];
let indice = 0;
let sound = null;
let timerId = null;

// Nodos para Ecualizador y Visualizador de Ondas
let lowFilter, midFilter, highFilter, analyser, dataArray;
let animationFrameId = null;

// Elementos del DOM
const lista = document.getElementById("lista");
const totalSongsCount = document.getElementById("total-songs-count");

// Elementos Sonando Ahora
const cardCover = document.getElementById("card-cover");
const cardTitle = document.getElementById("card-title");
const cardArtist = document.getElementById("card-artist");
const cardGenre = document.getElementById("card-genre");

// Elementos Player Inferior
const barCover = document.getElementById("bar-cover");
const barTitle = document.getElementById("bar-title");
const barArtist = document.getElementById("bar-artist");
const progress = document.getElementById("progress");
const timeCurrent = document.getElementById("time-current");
const timeTotal = document.getElementById("time-total");

// Botones Dinámicos
const btnPlayToggle = document.getElementById("btn-play-toggle");
const btnMuteToggle = document.getElementById("btn-mute-toggle");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

// Controles Volumen y Ecualizador
const volume = document.getElementById("volume");
const volumeVal = document.getElementById("volume-val");
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");

async function cargarInfo() {
  try {
    const respuesta = await fetch("songs.json");
    if (!respuesta.ok) throw new Error("No se pudo cargar songs.json");
    const datos = await respuesta.json();
    listaCanciones = Object.values(datos);

    totalSongsCount.textContent = `${listaCanciones.length} canciones`;
    listarCanciones();
    if (listaCanciones.length > 0) {
      prepararCancion(indice);
    }
  } catch (error) {
    console.error("Error al cargar canciones:", error);
  }
}

function listarCanciones() {
  lista.innerHTML = "";
  listaCanciones.forEach((cancion, index) => {
    const li = document.createElement("li");
    li.className = `song-item ${index === indice ? "active" : ""}`;
    li.innerHTML = `
      <div class="song-info-group">
        <img src="${cancion.cover}" alt="Portada">
        <div>
          <p><strong>${cancion.name}</strong></p>
          <p style="color:#9ca3af; font-size:12px;">${cancion.cantante}</p>
        </div>
      </div>
      ${index === indice ? '<span class="playing-badge">► sonando</span>' : ""}
    `;
    li.addEventListener("click", () => {
      indice = index;
      reproducirCancion(indice);
    });
    lista.appendChild(li);
  });
}

function inicializarAudioNodes() {
  if (!lowFilter && Howler.ctx) {
    const ctx = Howler.ctx;

    // Filtros de Ecualización
    lowFilter = ctx.createBiquadFilter();
    lowFilter.type = "lowshelf";
    lowFilter.frequency.value = 320;

    midFilter = ctx.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.frequency.value = 1000;

    highFilter = ctx.createBiquadFilter();
    highFilter.type = "highshelf";
    highFilter.frequency.value = 3200;

    // Analizador para las Ondas de Audio
    analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Conectar nodos
    Howler.masterGain.disconnect();
    Howler.masterGain.connect(lowFilter);
    lowFilter.connect(midFilter);
    midFilter.connect(highFilter);
    highFilter.connect(analyser);
    analyser.connect(ctx.destination);

    dibujarOndas();
  }
}

function dibujarOndas() {
  animationFrameId = requestAnimationFrame(dibujarOndas);
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = "#0d111a";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / dataArray.length) * 1.5;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height;
    canvasCtx.fillStyle = "#8b5cf6";
    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
    x += barWidth;
  }
}

function prepararCancion(index) {
  if (sound) {
    sound.stop();
    sound.unload();
  }
  clearInterval(timerId);

  const cancion = listaCanciones[index];

  sound = new Howl({
    src: [cancion.cancion],
    html5: false, // Requerido 'false' para Web Audio API (Ecualizador/Ondas)
    onload: () => {
      timeTotal.textContent = formatearTiempo(sound.duration());
      progress.max = sound.duration();
    },
    onplay: () => {
      inicializarAudioNodes();
      iniciarProgreso();
      btnPlayToggle.textContent = "⏸";
    },
    onpause: () => {
      btnPlayToggle.textContent = "▶";
    },
    onstop: () => {
      btnPlayToggle.textContent = "▶";
    },
    onend: () => {
      siguienteCancion();
    }
  });

  // Actualizar Interfaces
  cardCover.src = cancion.cover;
  cardTitle.textContent = cancion.name;
  cardArtist.textContent = cancion.cantante;
  cardGenre.textContent = cancion.genero || "Música";

  barCover.src = cancion.cover;
  barTitle.textContent = cancion.name;
  barArtist.textContent = cancion.cantante;

  listarCanciones();
}

function reproducirCancion(index) {
  prepararCancion(index);
  sound.play();
}

function iniciarProgreso() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (sound && sound.playing()) {
      const seek = sound.seek() || 0;
      progress.value = seek;
      timeCurrent.textContent = formatearTiempo(seek);
    }
  }, 250);
}

function formatearTiempo(seg) {
  const min = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${min}:${s < 10 ? "0" : ""}${s}`;
}

function siguienteCancion() {
  if (listaCanciones.length === 0) return;
  indice = (indice + 1) % listaCanciones.length;
  reproducirCancion(indice);
}

// BOTÓN DINÁMICO PLAY / PAUSA
btnPlayToggle.addEventListener("click", () => {
  if (!sound) return;
  if (sound.playing()) {
    sound.pause();
  } else {
    sound.play();
  }
});

// BOTÓN DINÁMICO MUTE / UNMUTE
btnMuteToggle.addEventListener("click", () => {
  if (!sound) return;
  const muted = sound.mute();
  sound.mute(!muted);
  btnMuteToggle.textContent = !muted ? "🔇" : "🔊";
});

// NAVEGACIÓN
btnPrev.addEventListener("click", () => {
  if (listaCanciones.length === 0) return;
  indice = (indice - 1 + listaCanciones.length) % listaCanciones.length;
  reproducirCancion(indice);
});

btnNext.addEventListener("click", siguienteCancion);

// CONTROL BARRA DE PROGRESO
progress.addEventListener("input", () => {
  if (sound) {
    sound.seek(progress.value);
    timeCurrent.textContent = formatearTiempo(progress.value);
  }
});

// CONTROL VOLUMEN
volume.addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  Howler.volume(val);
  volumeVal.textContent = `${Math.round(val * 100)}%`;
});

// CONTROLES DE ECUALIZADOR (DESLIZADORES VERTICALES)
document.getElementById("eq-low").addEventListener("input", (e) => {
  if (lowFilter) lowFilter.gain.value = parseFloat(e.target.value);
  document.getElementById("val-low").textContent = `${e.target.value} dB`;
});

document.getElementById("eq-mid").addEventListener("input", (e) => {
  if (midFilter) midFilter.gain.value = parseFloat(e.target.value);
  document.getElementById("val-mid").textContent = `${e.target.value} dB`;
});

document.getElementById("eq-high").addEventListener("input", (e) => {
  if (highFilter) highFilter.gain.value = parseFloat(e.target.value);
  document.getElementById("val-high").textContent = `${e.target.value} dB`;
});

// BOTÓN RESTABLECER ECUALIZADOR
document.getElementById("reset-eq").addEventListener("click", () => {
  ["eq-low", "eq-mid", "eq-high"].forEach((id) => {
    document.getElementById(id).value = 0;
  });
  ["val-low", "val-mid", "val-high"].forEach((id) => {
    document.getElementById(id).textContent = "0 dB";
  });
  if (lowFilter) lowFilter.gain.value = 0;
  if (midFilter) midFilter.gain.value = 0;
  if (highFilter) highFilter.gain.value = 0;
});

cargarInfo();
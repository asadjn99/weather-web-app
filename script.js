
/* ---- CONFIG ---- */
const API_KEY = "5db5e57975bf026842b992ad6d878001"; // <<--- put your API key here

/* ---- DOM ---- */
const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const statusEl = document.getElementById("status");
const card = document.getElementById("card");
const cityNameEl = document.getElementById("cityName");
const descEl = document.getElementById("desc");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const metaEl = document.getElementById("meta");

/* ---- Helpers ---- */
function setStatus(text, kind = "info") {
  statusEl.textContent = text;
  statusEl.className = {
    info: "text-sm text-slate-500 mb-4",
    loading: "text-sm text-sky-600 mb-4",
    error: "text-sm text-red-600 mb-4"
  }[kind] || "text-sm text-slate-500 mb-4";
}

function showCard(show = true) {
  card.classList.toggle("hidden", !show);
}

/* ---- Fetch weather ---- */
async function fetchWeather(city) {
  if (!API_KEY || API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
    throw new Error("Please set your OpenWeatherMap API key in the script (API_KEY).");
  }

  // OpenWeatherMap Current Weather endpoint, units=metric gives Celsius
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  setStatus("Loading weather...", "loading");
  showCard(false);

  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Weather API error: ${res.status} ${res.statusText} — ${errText}`);
  }
  const data = await res.json();
  return data;
}

/* ---- Render ---- */
function renderWeather(data) {
  const name = `${data.name}${data.sys && data.sys.country ? ", " + data.sys.country : ""}`;
  const description = data.weather && data.weather[0] ? capitalize(data.weather[0].description) : "N/A";
  const iconCode = data.weather && data.weather[0] ? data.weather[0].icon : null;
  const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : "";

  cityNameEl.textContent = name;
  descEl.textContent = description;
  iconEl.src = iconUrl;
  iconEl.alt = description;

  tempEl.textContent = Math.round(data.main.temp) + "°C";
  feelsEl.textContent = Math.round(data.main.feels_like) + "°C";
  humidityEl.textContent = data.main.humidity + "%";
  windEl.textContent = (data.wind.speed ?? 0) + " m/s";
  metaEl.textContent = `Last updated: ${new Date(data.dt * 1000).toLocaleString()}`;

  setStatus("Weather loaded.", "info");
  showCard(true);
}

/* ---- Utilities ---- */
function capitalize(s) {
  if (!s) return s;
  return s.split(" ").map(p => p[0].toUpperCase() + p.slice(1)).join(" ");
}

/* ---- Form submit handler ---- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  try {
    const data = await fetchWeather(city);
    renderWeather(data);
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Failed to fetch weather", "error");
    showCard(false);
  }
});

/* ---- Optional: show a sample city on load ---- */
window.addEventListener("DOMContentLoaded", () => {
  // Uncomment to auto-search a default city at startup
  // cityInput.value = "Karachi";
  // form.dispatchEvent(new Event("submit"));
});

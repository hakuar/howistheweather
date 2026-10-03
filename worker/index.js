// Cloudflare Worker version of application/flask_app.py.
// Location comes from Cloudflare's own request.cf data, so no IP lookup API is needed here.
// Weather comes from Open-Meteo, which needs no API key.

import WEATHER_CODES from "../application/weather_codes.json";

const FORECAST_DAYS = 5;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function describe(code) {
  return WEATHER_CODES[code]?.description ?? "Unknown";
}

// Picks the body background class; the CSS falls back to img/air.jpg if that image is missing.
function background(code) {
  return WEATHER_CODES[code]?.background ?? "default";
}

async function getWeather(lat, lon) {
  // Today plus the forecast days; timezone=auto returns times in the location's local time.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + "&current=temperature_2m,weather_code"
    + "&daily=weather_code,temperature_2m_max,temperature_2m_min"
    + `&timezone=auto&forecast_days=${FORECAST_DAYS + 1}`;
  // If the API is down the page still renders with placeholders.
  try {
    const response = await fetch(url);
    return response.ok ? await response.json() : {};
  } catch {
    return {};
  }
}

// Open-Meteo times are local wall-clock strings ("2026-10-03T14:15"), so format them as UTC to keep them as-is.
function getDate(weather) {
  if (!weather.current?.time) {
    const now = new Date();
    return `${formatTime(now)} ${formatDay(now)} (UTC)`;
  }
  const date = new Date(`${weather.current.time}Z`);
  return `${formatTime(date)} ${formatDay(date)} (${weather.timezone_abbreviation})`;
}

function formatTime(date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function formatDay(date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

function getForecast(weather) {
  const daily = weather.daily;
  if (!daily?.time) return [];
  // Index 0 is today, which the current weather already covers.
  return daily.time.slice(1, FORECAST_DAYS + 1).map((day, i) => ({
    day: new Date(`${day}T00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }),
    description: describe(daily.weather_code[i + 1]),
    max: Math.round(daily.temperature_2m_max[i + 1]),
    min: Math.round(daily.temperature_2m_min[i + 1]),
  }));
}

function renderForecast(forecast) {
  if (!forecast.length) return "";
  const rows = forecast.map((f) => `
          <tr>
            <td class="forecast-day">${escapeHtml(f.day)}</td>
            <td>${escapeHtml(f.description)}</td>
            <td class="forecast-temp">${escapeHtml(f.max)}° / ${escapeHtml(f.min)}°</td>
          </tr>`).join("");
  return `
    <hr class="style2">
    <div id="forecast">
      <h2 id="forecast-title">${FORECAST_DAYS}-Day Forecast</h2>
      <table>
        <tbody>${rows}
        </tbody>
      </table>
    </div>`;
}

function render({ info, location, warning, remoteIp, weather, latitude, longitude }) {
  const current = weather.current ?? {};
  const temp = current.temperature_2m ?? "-";
  const description = current.weather_code === undefined ? "currently unavailable" : describe(current.weather_code);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>How Is The Weather?</title>
  <link rel="stylesheet" type="text/css" href="/static/style.css">
  <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins">
</head>
<body class="bg-${escapeHtml(background(current.weather_code))}">
  <div id="main-container" class="container">
      <h1 id="info" class="text-center">${escapeHtml(info)}</h1>
      <h1 id="city" class="text-center">${escapeHtml(location)}</h1>
      <h1 id="warning" class="text-center">${escapeHtml(warning)}</h1>
      <hr class="style2">
      <div id="border" class="col-xs-12 valign" align="center">
        <h1 id="ip">YOUR IP ADDRESS: ${escapeHtml(remoteIp)}</h1>
        <hr class="style1">
        ${latitude ? `<h1 id="lat-lon">Location --> Latitude:${escapeHtml(latitude)}  ,  Longitude:${escapeHtml(longitude)}</h1>` : ""}
      </div>
      <div id="current-weather" class="container">
      <div class="row">
        <div class="col-xs-12 valign" align="center">
          <h1 id="temp">${escapeHtml(temp)} °C</h1>
          <h1 id="description"> Weather : ${escapeHtml(description)}</h1>
        </div>
      </div>
    </div>
    <hr class="style2">
     <div class="col-xs-12 valign" align="center">
      <h1 id="date">${escapeHtml(getDate(weather))}</h1>
      </div>${renderForecast(getForecast(weather))}
   </div>
<footer>
  <details id="attribution-panel">
    <summary>APIs Used</summary>
    <ul>
      <li>Weather: <a href="https://open-meteo.com/">Open-Meteo.com</a> (CC BY 4.0)</li>
      <li>Location: <a href="https://www.cloudflare.com/">Cloudflare</a></li>
    </ul>
  </details>
  <p> Copyright &copy; 2019 hakuar </p>
</footer>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Static files live in application/static and are shared with the Flask version.
    if (url.pathname.startsWith("/static/")) {
      url.pathname = url.pathname.slice("/static".length);
      return env.ASSETS.fetch(new Request(url, request));
    }
    if (url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    const cf = request.cf ?? {};
    const remoteIp = request.headers.get("CF-Connecting-IP") ?? "";
    const { city, latitude, longitude } = cf;
    const found = Boolean(latitude && longitude);

    // Without a location there is nothing to ask Open-Meteo, so the page only shows a notice.
    const weather = found ? await getWeather(latitude, longitude) : {};
    const location = found ? city || "" : "";
    const info = !found ? "Location Not Found" : location ? "Your Location:" : "Unidentified Location:";
    const warning = found ? "" : "(Your location could not be detected from your IP address, so the weather can't be shown.)";

    const html = render({ info, location, warning, remoteIp, weather, latitude: found ? latitude : "", longitude: found ? longitude : "" });
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  },
};

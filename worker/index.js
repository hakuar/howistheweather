// Cloudflare Worker version of application/flask_app.py.
// Location comes from Cloudflare's own request.cf data, so ipstack isn't needed here.

const FALLBACK = { city: "Ankara", latitude: "39.9199", longitude: "32.8543" };

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

async function getWeather(lat, lon, apiKey) {
  // Without a key (or if the API is down) the page still renders with placeholders.
  if (!apiKey) return {};
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=en&APPID=${apiKey}`;
  try {
    const response = await fetch(url);
    return response.ok ? await response.json() : {};
  } catch {
    return {};
  }
}

function getDate(weather) {
  if (!weather.dt) return "Date could not be determined";
  const date = new Date(weather.dt * 1000);
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
  return `${time} ${day} (UTC)`;
}

function render({ info, location, warning, remoteIp, weather, date, latitude, longitude }) {
  const lat = weather.coord?.lat ?? latitude;
  const lon = weather.coord?.lon ?? longitude;
  const temp = weather.main?.temp ?? "-";
  const description = weather.weather?.[0]?.description ?? "currently unavailable";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>How Is The Weather?</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
  <link rel="stylesheet" type="text/css" href="/static/style.css">
  <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Poppins">
</head>
<body>
  <div id="main-container" class="container">
      <h1 id="info" class="text-center">${escapeHtml(info)}</h1>
      <h1 id="city" class="text-center">${escapeHtml(location)}</h1>
      <h1 id="warning" class="text-center">${escapeHtml(warning)}</h1>
      <hr class="style2">
      <div id="border" class="col-xs-12 valign" align="center">
        <h1 id="ip">YOUR IP ADDRESS: ${escapeHtml(remoteIp)}</h1>
        <hr class="style1">
        <h1 id="lat-lon">Location --> Latitude:${escapeHtml(lat)}  ,  Longitude:${escapeHtml(lon)}</h1>
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
      <h1 id="date">${escapeHtml(date)}</h1>
      </div>
   </div>
  <script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
<footer>
  <div id="attribution-panel" class="container">
    <div class="panel-group">
      <div class="panel panel-default">
        <div id="panel-heading" class="panel-heading">
          <h4 class="panel-title" style="font-size: 12px">
            <a data-toggle="collapse" href="#collapse1">APIs Used</a>
          </h4>
        </div>
        <div id="collapse1" class="panel-collapse collapse">
          <ul class="list-group" style="font-size: 10px">
            <li class="list-group-item">Weather: <a href="https://openweathermap.org/">OpenWeatherMap API</a></li>
            <li class="list-group-item">Location: <a href="https://www.cloudflare.com/">Cloudflare</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
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
    let warning = "";
    let { city, latitude, longitude } = cf;
    if (!latitude || !longitude) {
      ({ city, latitude, longitude } = FALLBACK);
      warning = "(Your IP address could not be detected, so your location was set to 'Ankara'.)";
    }

    const weather = await getWeather(latitude, longitude, env.WEATHER_API_KEY);
    const location = city || weather.name || "";
    const info = location ? "Your Location:" : "Unidentified Location:";

    const html = render({ info, location, warning, remoteIp, weather, date: getDate(weather), latitude, longitude });
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  },
};

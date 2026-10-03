# WEATHER FORECAST APPLICATION

This is a web app where it shows the following informations with the users IP information.

* Location 
* IP Adress
* Latitude and Longitude
* Current Temperature
* Weather Condition (the background changes with it)
* Local Date and Time
* 5-Day Forecast

Note: The web app language is English.


## Demonstration

You can reach the web-app demo from --> [HowIsTheWeather](https://weather.hakuar.com/)

## Built With

* [Cloudflare Workers](https://workers.cloudflare.com/) - Used to deploy the Web App (location comes from Cloudflare's request data)
* [Open-Meteo](https://open-meteo.com/) - Weather API (free, no API key needed)
* [Flask](http://flask.pocoo.org/) - Microframework for Python (alternative PythonAnywhere setup)
* [ipapi.co](https://ipapi.co/) - IP location API, no key needed (alternative PythonAnywhere setup)

## Deploying to Cloudflare (current setup)

The Worker lives in `worker/index.js` and serves the files in `application/static`.

No API keys are needed: Open-Meteo is free to use without a key, and Cloudflare already
provides the visitor's location (city, latitude, longitude) with each request.

1. `npx wrangler login`
2. `npx wrangler deploy`

You can also connect the GitHub repository from the Cloudflare dashboard
(Workers & Pages → Create application → Import a repository) so every push deploys automatically.

### Before deploying your own copy

`wrangler.jsonc` is set up for `weather.hakuar.com`, with the `*.workers.dev` address turned off.
You need to change it before deploying:

**If you have your own domain** (its zone must be on your Cloudflare account), replace the domain:

```jsonc
"routes": [
  { "pattern": "weather.your-domain.com", "custom_domain": true }
]
```

**If you don't have a domain**, you can host it for free on a `*.workers.dev` address.
Delete the `routes` block and turn `workers_dev` on:

```jsonc
"workers_dev": true,
```

The app will then be served at `https://howistheweather.<your-subdomain>.workers.dev`.

For local development run `npx wrangler dev`.

## Weather backgrounds

The page background follows the current weather. Weather codes are grouped in
`application/weather_codes.json`, and each group uses an image in `application/static/img/`:

| Group | Image |
| --- | --- |
| Clear sky | `clear.jpg` |
| Cloudy | `cloudy.jpg` |
| Fog | `fog.jpg` |
| Rain / drizzle | `rain.jpg` |
| Snow | `snow.jpg` |
| Thunderstorm | `storm.jpg` |

If an image is missing, `air.jpg` is shown instead.

## Alternative: Deploying to PythonAnywhere (previous setup)

The app was originally hosted on [pythonanywhere](https://www.pythonanywhere.com/),
which gives you a free subdomain if you don't have your own domain. The Flask version is still in `application/`:

1. Create a Flask web app on PythonAnywhere and upload/clone this repository.
2. Install the requirements: `pip install -r requirements.txt`
3. Point the WSGI file to `application/flask_app.py` (`from flask_app import app as application`) and reload the web app.

No API keys or config files are needed: ipapi.co and Open-Meteo both work without a key.
Free PythonAnywhere accounts can only reach sites on their
[allowlist](https://www.pythonanywhere.com/whitelist/), so check that `ipapi.co` and `api.open-meteo.com` are on it.

## Changelog

### v2.0 (October 2026)

This version is not a redesign. The goal was to keep the app working and keep the original 2019 look:
the layout, colors and fonts are the same, and the new parts (forecast, weather backgrounds) follow the same style.

* Moved hosting from PythonAnywhere to Cloudflare Workers, served on [weather.hakuar.com](https://weather.hakuar.com/)
* Switched the weather API from OpenWeatherMap to Open-Meteo, so no API key is needed
* Location comes from Cloudflare on the Worker, and from ipapi.co instead of ipstack on the Flask version
* Added a 5-day forecast
* Shows the local date and time of the visitor's location
* The background changes with the current weather
* Translated the web app from Turkish to English

### v1.0 (February 2019)

* First version: Flask app on PythonAnywhere, using OpenWeatherMap and ipstack, in Turkish

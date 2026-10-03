# WEATHER FORECAST APPLICATION

This is a web app where it shows the following informations with the users IP information.

* Location 
* IP Adress
* Latitude and Longitude
* Weather Forecast Temp.
* Weather Condition
* Weather Calculation Date and Time

Note:The web app language is  Turkish.


## Demonstration

You can reach the web-app demo from --> [HowIsTheWeather](https://weather.hakuar.com/)

## Built With

* [Cloudflare Workers](https://workers.cloudflare.com/) - Used to deploy the Web App (location comes from Cloudflare's request data)
* [OpenWeatherMap](https://openweathermap.org/) Weather API
* [Flask](http://flask.pocoo.org/) - Microframework for Python (alternative PythonAnywhere setup)
* [ipstack](https://ipstack.com/) - IP API (alternative PythonAnywhere setup)

## Deploying to Cloudflare (current setup)

The Worker lives in `worker/index.js` and serves the files in `application/static`.

You only need an OpenWeatherMap API key here. No ipstack key is needed, because Cloudflare already
provides the visitor's location (city, latitude, longitude) with each request.

1. `npx wrangler login`
2. `npx wrangler secret put WEATHER_API_KEY` (your OpenWeatherMap key)
3. `npx wrangler deploy`

The custom domain is set in `wrangler.jsonc` (`weather.hakuar.com`); the domain's zone must be on your
Cloudflare account. If you don't have a domain, remove the `routes` block and the app will be served on
a free `*.workers.dev` address.

For local development put `WEATHER_API_KEY=...` into a `.dev.vars` file and run `npx wrangler dev`.

## Alternative: Deploying to PythonAnywhere (previous setup)

The app was originally hosted on [pythonanywhere](https://www.pythonanywhere.com/),
which gives you a free subdomain if you don't have your own domain. The Flask version is still in `application/`:

1. Create a Flask web app on PythonAnywhere and upload/clone this repository.
2. Install the requirements: `pip install -r requirements.txt`
3. Fill `config/prod.cfg` with your keys:
   ```
   IP_API_KEY = "your-ipstack-key"
   WEATHER_API_KEY = "your-openweathermap-key"
   ```
4. Point the WSGI file to `application/flask_app.py` (`from flask_app import app as application`) and reload the web app.

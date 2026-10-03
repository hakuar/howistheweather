from requests import get
from flask import request,Flask,render_template
from datetime import datetime, timezone
import json
import logging
import os

app = Flask(__name__)

FORECAST_DAYS = 5

with open(os.path.join(os.path.dirname(__file__), "weather_codes.json")) as codes_file:
    WEATHER_CODES = json.load(codes_file)

def get_location(ip_address):
    # ipapi.co needs no API key.
    location_api_url = get('https://ipapi.co/{}/json/'.format(ip_address), headers={"User-Agent": "howistheweather"})
    place = location_api_url.json()
    location = {"city": place.get("city") or place["region"], "latitude": place["latitude"], "longitude": place["longitude"]}
    logging.info(f"The website is used for the weather in {location['city']}")
    return location


def get_weather(location):
    # Today plus the forecast days; timezone=auto returns times in the location's local time.
    try:
        weather_api_url = get('https://api.open-meteo.com/v1/forecast', params={
            "latitude": location["latitude"],
            "longitude": location["longitude"],
            "current": "temperature_2m,weather_code",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min",
            "timezone": "auto",
            "forecast_days": FORECAST_DAYS + 1,
        })
        weather_api_url.raise_for_status()
        return weather_api_url.json()
    except Exception:
        logging.warning("weather could not be reached")
        return {}

def describe(code):
    return WEATHER_CODES.get(str(code), {}).get("description", "Unknown")

# Picks the body background class; the CSS falls back to img/air.jpg if that image is missing.
def background(code):
    return WEATHER_CODES.get(str(code), {}).get("background", "default")

def location_check(location):
    if location is None:
        return "Location Not Found"
    if not location["city"]:
        logging.info("Undefined Location!")
        return "Unidentified Location:"
    return "Your Location:"

def get_date(my_weather):
    try:
        current_date = datetime.fromisoformat(my_weather["current"]["time"])
        return current_date.strftime('%H:%M %d %B %Y') + " ({})".format(my_weather["timezone_abbreviation"])
    except KeyError:
        logging.warning("date could not be reached, using server time")
        return datetime.now(timezone.utc).strftime('%H:%M %d %B %Y (UTC)')

def get_current(my_weather):
    current = my_weather.get("current")
    if not current:
        return {"temp": "-", "description": "currently unavailable", "background": "default"}
    return {"temp": current["temperature_2m"], "description": describe(current["weather_code"]),
            "background": background(current["weather_code"])}

def get_forecast(my_weather):
    daily = my_weather.get("daily")
    if not daily:
        return []
    # Index 0 is today, which the current weather already covers.
    return [{
        "day": datetime.fromisoformat(daily["time"][i]).strftime('%a %d %b'),
        "description": describe(daily["weather_code"][i]),
        "max": round(daily["temperature_2m_max"][i]),
        "min": round(daily["temperature_2m_min"][i]),
    } for i in range(1, min(FORECAST_DAYS + 1, len(daily["time"])))]

@app.route("/")
def index_page():

    logging.basicConfig(filename="logs.log", level=logging.INFO, format="%(asctime)s:%(levelname)s:%(message)s")
    remote_ip=request.headers.get('X-Real-IP', "-")
    loc_warning=""
    try:
        my_location = get_location(remote_ip)
    except Exception:
        logging.warning("IP location could not be reached")
        loc_warning="(Your location could not be detected from your IP address, so the weather can't be shown.)"
        my_location = None

    # Without a location there is nothing to ask Open-Meteo, so the page only shows a notice.
    my_weather = get_weather(my_location) if my_location else {}
    location_info = location_check(my_location)
    current_date=get_date(my_weather)
    return render_template('index.html',remote_ip=remote_ip,location=my_location, current=get_current(my_weather),
                           forecast=get_forecast(my_weather), forecast_days=FORECAST_DAYS,
                           date=current_date,warning=loc_warning,info=location_info)

if __name__ == '__main__':

    app.run(debug=True)

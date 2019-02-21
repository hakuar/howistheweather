import random
from requests import get
from flask import request,Flask,render_template
import time
import locale
import logging


app = Flask(__name__)


def get_location(ip_address):
    location_api_url = get(
        'http://api.ipstack.com/{}?access_key=a6a9b682e244ddaa4fda5ae42712935a&fields=region_name&output=json'.format(ip_address))
    place = location_api_url.json()
    city = place["region_name"]
    logging.info(f"The website is used for the weather in {city}")
    return city


def get_weather(city):
    current_weather_api_url = get('https://api.openweathermap.org/data/2.5/weather?q={}&units=metric&lang=tr&APPID=e4a89b6254d4d382147b4717fb7465a8'.format(city))
    current = current_weather_api_url.json()
    logging.info(f"The weather-api response for current weather is{current}")
    return current

def get_date(my_weather):
    try:
        current_dt = my_weather["dt"]
        current_date_struct = time.gmtime(current_dt)
        locale.setlocale(locale.LC_TIME, "tr_TR.utf8")
        current_date = time.strftime('%H:%M %d %B %Y (UTC)', current_date_struct)
        return current_date
    except KeyError:
        current_date ="Tarihi belirleyemedik"
        return current_date
        logging.warning("date could not be reached")

@app.route("/")
def index_page():
    logging.basicConfig(filename="logs.log", level=logging.DEBUG, format="%(asctime)s:%(levelname)s:%(message)s")
    try:
        remote_ip=request.headers['X-Real-IP']
    except KeyError:
        remote_ip="85.110.71.229"
        logging.warning("IP could not be reached")
        loc_warning="(IP adresiniz tespit edilemediğinden konumunuz 'Ankara' olarak alınmıştır.)"

    my_location = get_location(remote_ip)
    my_weather = get_weather(my_location)
    current_date=get_date(my_weather)
    return render_template('index.html',remote_ip=remote_ip,location=my_location, weather=my_weather ,date=current_date,warning=loc_warning)

if __name__ == '__main__':

    app.run(debug=True)















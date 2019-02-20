import random
from requests import get
from flask import request,Flask,render_template
import time
import locale
#import calendar

app = Flask(__name__)


def get_location(ip_address):
    location_api_url = get(
        'http://api.ipstack.com/{}?access_key=a6a9b682e244ddaa4fda5ae42712935a&fields=region_name&output=json'.format(ip_address))
    place = location_api_url.json()
    city = place["region_name"]
    print(city)
    return city

def get_weather(city):
    current_weather_api_url = get('https://api.openweathermap.org/data/2.5/weather?q={}&units=metric&lang=tr&APPID=e4a89b6254d4d382147b4717fb7465a8'.format(city))
    current = current_weather_api_url.json()
    print(current)
    return current



@app.route("/")
def index_page():
    remote_ip=request.remote_addr
    #remote_ip = ".".join(map(str, (random.randint(0, 255) for _ in range(4))))
    my_location = get_location(remote_ip)
    my_weather = get_weather(my_location)
    current_dt = my_weather["dt"]
    current_date_struct = time.gmtime(current_dt)
    locale.setlocale(locale.LC_TIME, "tr_TR.utf8")
    current_date=time.strftime('%H:%M %d %B %Y (UTC)',current_date_struct)
    print(current_date)


    return render_template('index.html',remote_ip=remote_ip,location=my_location, weather=my_weather ,date=current_date)

if __name__ == '__main__':

    app.run(debug=True)















from requests import get
from flask import request,Flask,render_template
import time
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




    # main = current["main"]
    # current_temp = main["temp"]
    # print(current_time)
    # print(current_temp)
    #
    # # get description
    # weather = current["weather"]
    # description = weather[0]["description"]
    # print(description)
@app.route("/")
def index_page():
    remote_ip_address=request.remote_addr
    my_location = get_location(remote_ip_address)
    my_weather = get_weather(my_location)


    return "{}<br>{}".format(my_location,my_weather)

    #return render_template('index.html' )




if __name__ == '__main__':
    app.run(debug=True)
    # my_location=get_location("144.122.166.65")
    # my_weather=get_weather(my_location)
    # print(my_weather)
    # current_date = my_weather["dt"]
    # current_time = time.gmtime(current_date)
    # print(time.strftime('%H:%M %d %B %Y (UTC)', current_time))












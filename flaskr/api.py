from requests import get
import time
import calendar

#get location from the ip of the user
locationapiurl=get('http://api.ipstack.com/check?access_key=a6a9b682e244ddaa4fda5ae42712935a&fields=region_name&output=json')
place=locationapiurl.json()
sehir=place["region_name"]
print(sehir)

#current weather data call
currentweatherapiurl=get('https://api.openweathermap.org/data/2.5/weather?q={}&units=metric&lang=tr&APPID=e4a89b6254d4d382147b4717fb7465a8'.format(sehir))
current=currentweatherapiurl.json()

#get temperature
main=current["main"]
CurrentTemp=main["temp"]
print(CurrentTemp)

#get description
weather=current["weather"]
description=weather[0]["description"]
print(description)

# weather forecast for 5d(12am) data
forecastweatherapiurl=get('https://api.openweathermap.org/data/2.5/forecast?q={}&units=metric&lang=tr&APPID=e4a89b6254d4d382147b4717fb7465a8'.format(sehir))
forecast=forecastweatherapiurl.json()
print(forecast)
list=forecast["list"]




#set the time for the forecasts to 12.00 am
for i in [3,11,19,27,35]:
    list12=list[i]
    dt=list12["dt"]
    mainf=list12["main"]
    ForecastTemp=mainf["temp"]
    date=time.gmtime(dt)
    weekday =["Pazartesi","Salı","Çarşamba","Perşembe", "Cuma","Cumartesi","Pazar"] #to find day of the week
    day=calendar.weekday(date[0],date[1],date[2]) #calendar.weekday(year,month,day)
    print(weekday[day])

    dayArray=[]  #to store days
    tempArray=[] #to store temps






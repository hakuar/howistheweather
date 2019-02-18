$(document).ready(function getLocation() {

  sehir=region_name;
  let locationapiurl = "http://api.ipstack.com/178.233.209.10?access_key=a6a9b682e244ddaa4fda5ae42712935a& fields = region_name & output = json";
    $.getJSON(locationapiurl,function(place) {
      $("#city").html("Bu gün"+place.sehir+"için hava sıcaklığı")
    });//end getJSON


getLocation(sehir);


// current weather data call
function getLocation(city){
  let currentweatherapiurl = "api.openweathermap.org/data/2.5/weather?q="+city+"&cnt=7&units=metric&lang=tr&callback=test&APPID=e4a89b6254d4d382147b4717fb7465a8";
    $.getJSON(currentweatherapiurl, function(currentdata){
      let CurrentTemp=Math.round(currentdata.main.temp)
      $("#current-weather").html(CurrentTemp+"°C");
      $("#weather-description").html(currentdata.weather.description);
    });//end  getJSON current weather

  // weather forecast for 5d(12am) data
  let forecastweatherapiurl = "api.openweathermap.org/data/2.5/forecast?q="+city+"&units=metric&lang=tr&callback=test&APPID=e4a89b6254d4d382147b4717fb7465a8";
    $.getJSON(forecastweatherapiurl, function(forecastdata){

      //convert future dates (given in API by seconds since Jan 1 1970) to day of the week
      let weekday = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe", "Cuma","Cumartesi"]; //to find day of the week
      let dayArray=[];//to store days
      let tempArray= []; //to store temps

      //first, create function to get all the information
      function weatherInfo() {
        let date = new Date(day.dt * 1000);
        day = weekday[date.getDay()];
        dayArray.push(day);
        let ForecastTemp = forecastdata.list[i].main.temp ;
        tempArray.push(ForecastTemp);
      };

      //set the time for the forecast to 12.00 am
      var now = new Date(day.dt * 1000);
      var hour = now.getHours();
      if(hour==12){
        weatherInfo();}

      weatherInfo();

      //put weekdays into html
      $("#day1").html(dayArray[0]);
      $("#day2").html(dayArray[1]);
      $("#day3").html(dayArray[2]);
      $("#day4").html(dayArray[3]);
      $("#day5").html(dayArray[4]);
      //put temperatures into html
      $("#forecastday1").html(Math.round(tempArray[0])+"°C");
      $("#forecastday2").html(Math.round(tempArray[1])+"°C");
      $("#forecastday3").html(Math.round(tempArray[2])+"°C");
      $("#forecastday4").html(Math.round(tempArray[3])+"°C");
      $("#forecastday5").html(Math.round(tempArray[4])+"°C");


        });//end getJSON forecast
      };

});//end ready
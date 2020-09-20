//input
//today results
//  name date icon
//  temp
//  humidity
//  windspeed
//  uv-index
//cards
//  date
//  icon
//  temp
//  humidity

//element references
const searchForm = $("#search-form");
const cityInput = $("#city");
const todayResults = $("#result-today");
const forecastCards = $("#forecast-cards .card");

const MS_IN_DAY = 86400000;

const init = () => {
    
}

const getResults = (city) => {
    const api = '432919c539be1e9eaadf34617ce6b063';
    queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api}`
    let test = `https://geocode.xyz/${city}?json=1`

    $.ajax({
        url: test,
        method: 'GET'
    }).done(function(response) {
        //TODO remove this
        console.log(response);
        //return;
        const lat = response.latt;
        const lon = response.longt;
        queryURL2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=imperial&appid=${api}`;
        $.ajax({
            url: queryURL2,
            method: 'GET'
        }).done(function(response) {
            //TODO remove this
            console.log(response);
            loadTodayResult(response);
            loadForecastResult(response);
        }).fail(function(error) {
            console.log(error.responseText);
        });
        
    }).fail(function(error) {
        console.log(error.responseText);
    });
}

const loadTodayResult = response => {
    //header
    let today = new Date();
    const header = todayResults.children("#today-header");
    header.children("#city-name").text(cityInput.val());
    header.children("#today-date").text(`(${today.toLocaleDateString()})`);
    header.children("#today-icon").text("icon");

    todayResults.children("#today-temp").text(`Temperature: ${response.current.temp} °F`);
    todayResults.children("#today-humidity").text(`Humidity: ${response.current.humidity}%`);
    todayResults.children("#today-wind").text(`Wind Speed:  ${response.current.wind_speed} MPH`);
    todayResults.children("#today-uv").text(`UV Index: ${response.current.uvi}`);
}

const loadForecastResult = (response) => {
    let day = 0;
    let tomorrow = new Date();
    tomorrow.setTime(tomorrow.getTime() + MS_IN_DAY);
    forecastCards.each(function() {
        $(this).find(".card-title").text(tomorrow.toLocaleDateString());
        $(this).find("#forecast-icon").text("NYI");
        $(this).find("#forecast-temp").text(`Temp: ${response.daily[day].temp.day} °F`);
        $(this).find("#forecast-humidity").text(`Humidity: ${response.daily[day].humidity}%`);
        day++;
        tomorrow.setTime(tomorrow.getTime() + MS_IN_DAY);
    });    
}

searchForm.on("submit", function(e) {
    e.preventDefault();
    getResults(cityInput.val());
})

init();
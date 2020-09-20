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

const init = () => {
    
}

const getResults = (city) => {
    const api = '432919c539be1e9eaadf34617ce6b063';
    queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api}`
    

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response) {
        console.log(response);
        const lat = response.coord.lat;
        const lon = response.coord.lon;
        queryURL2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=imperial&appid=${api}`;
        $.ajax({
            url: queryURL2,
            method: 'GET'
        }).done(function(response) {
            console.log(response);
            loadTodayResult(response);
        }).fail(function(error) {
            console.log(error.responseText);
        });
        
    }).fail(function(error) {
        console.log(error.responseText);
    });
}

const loadTodayResult = response => {
    //header
    const header = todayResults.children("#today-header");
    header.children("#city-name").text(cityInput.val());
    header.children("#today-date").text(`(today's date)`);
    header.children("#today-icon").text("icon");

    todayResults.children("#today-temp").text(response.current.temp);
    todayResults.children("#today-humidity").text(response.current.humidity);
    todayResults.children("#today-wind").text(response.current.wind_speed);
    todayResults.children("#today-uv").text(response.current.uvi);
}

searchForm.on("submit", function(e) {
    e.preventDefault();
    getResults(cityInput.val());
})

init();
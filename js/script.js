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
    }).then(function(response) {
        console.log(response);
    }).err(function(error) {
        console.log(error);
    })
}

init();
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
        
    }).fail(function(error) {
        console.log(error.responseText);
    })
}

searchForm.on("submit", function(e) {
    e.preventDefault();
    getResults(cityInput.val());
})

init();
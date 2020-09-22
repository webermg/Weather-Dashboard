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
const loadingBar = $("#loading-bar");
const forecastCards = $("#forecast-cards .card");

const MS_IN_DAY = 86400000;

let history = [];

//loads the history from localstorage and displays it upon document load
//also takes care of initial page display housekeeping
$(document).ready(() => {
    loadingBar.hide();
    history = localStorage.getItem("history") != null ? JSON.parse(localStorage.getItem("history")) : [];
    refreshHistory();
    console.log(history.length);
    if(history.length > 0) getResults(history[0]);
    $('.collapsible').collapsible();
    forecastCards.each(function() {
        $(this).hide();
    })
});

//saves the existing search history to localstorage on document unload
$(window).on("unload", function() {
    localStorage.setItem("history", JSON.stringify(history));
})

//makes the api calls
const getResults = (city) => {
    const api = '432919c539be1e9eaadf34617ce6b063';
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api}`;
    loadingBar.show();

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response) {
        //TODO remove this
        console.log(response);
        const lat = response.coord.lat;
        const lon = response.coord.lon;
        queryURL2 = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=imperial&appid=${api}`;
        $.ajax({
            url: queryURL2,
            method: 'GET'
        }).done(function(response) {
            //TODO remove this
            console.log(response);
            addToHistory(city);
            refreshHistory();
            loadTodayResult(response, city);
            loadForecastResult(response);
        }).fail(function(error) {
            let text = JSON.parse(error.responseText);
            console.log(error.responseText);
            M.toast({html: `Error: ${text.message}`});
        });
        
    }).fail(function(error) {
        let text = JSON.parse(error.responseText);
        console.log(error.responseText);
        M.toast({html: `Error: ${text.message}`});

    }).always(() => {
        loadingBar.hide();
    });
}

//loads weather data for today
const loadTodayResult = (response, city) => {
    const todayResults = $("#result-today");
    const moreTodayResults = $("#result-today-more");
    //header
    let today = new Date();
    const header = $("#today-header");
    header.children("#city-name").text(city.toUpperCase());
    header.children("#today-date").text(`(${today.toLocaleDateString()})`);
    
    //weather image
    $("#today-icon").html(`<img src="http://openweathermap.org/img/wn/${response.current.weather[0].icon}@2x.png">`);

    //first panel
    todayResults.children("#today-temp").text(`Temperature: ${response.current.temp.toFixed(1)} °F`);
    todayResults.children("#today-humidity").text(`Humidity: ${response.current.humidity}%`);
    todayResults.children("#today-wind").text(`Wind Speed:  ${response.current.wind_speed} MPH`);
    todayResults.find("#uv-value").text(` ${response.current.uvi} `);
    todayResults.find("#uv-value").removeClass("green yellow orange red purple black-text white-text");
    //select uvi scale color
    switch(Math.floor(response.current.uvi)) {
        case 1:
        case 2:
            todayResults.find("#uv-value").addClass("green white-text");
            break;
        case 3:
        case 4:
        case 5:
            todayResults.find("#uv-value").addClass("yellow black-text");
            break;
        case 6:
        case 7:
            todayResults.find("#uv-value").addClass("orange white-text");
            break;
        case 8:
        case 9:
        case 10:
            todayResults.find("#uv-value").addClass("red white-text");
            break;
        default:
            todayResults.find("#uv-value").addClass("purple white-text");
    }

    //more panel
    moreTodayResults.children("#today-temp-feels").text(`Feels like: ${response.current.feels_like.toFixed(1)} °F`);
    moreTodayResults.children("#today-vis").text(`Visibility: ${response.current.visibility / 1000}Km`);
    moreTodayResults.children("#today-pressure").text(`Pressure: ${(response.current.pressure / 33.86).toFixed(2)} inHg`);
    moreTodayResults.children("#today-precip").text(`Chance of Precipitation: ${response.daily[0].pop * 100}%`);


}

//loads the data into the future forecast cards
const loadForecastResult = response => {
    let day = 1;
    let date = new Date();
    date.setTime(date.getTime() + MS_IN_DAY);
    forecastCards.each(function() {
        $(this).find(".card-title").text(date.toLocaleDateString(undefined,{ month: 'numeric', day: 'numeric' }));
        $(this).find("#forecast-icon").html(`<img src="http://openweathermap.org/img/wn/${response.daily[day].weather[0].icon}.png">`);
        $(this).find("#forecast-hi").text(`Hi: ${response.daily[day].temp.max.toFixed(0)}°F`);
        $(this).find("#forecast-lo").text(`Lo: ${response.daily[day].temp.min.toFixed(0)}°F`);
        $(this).find("#forecast-humidity").text(`Hum: ${response.daily[day].humidity}%`);
        $(this).show();
        day++;
        date.setTime(date.getTime() + MS_IN_DAY);
    });    
}

//history functions

//push an item in the history to the front of the list
const bubbleUp = item => {
    if(history.indexOf(item) === -1) return;
    let ind = history.indexOf(item);
    while(ind > 0) {
        const temp = history[ind-1];
        history[ind-1] = history[ind];
        history[ind] = temp;
        ind--;
    }
}

//adds an item to the history
//moves it to the front of the list if it is already present
const addToHistory = item => {
    if(history.indexOf(item) != -1) {
        bubbleUp(item);
    }
    else {
        if(history.length === 10) {
            history[9] = item;
            bubbleUp(item);
        }
        else history.unshift(item);
    }
}

//generates html and appends to history display area
const refreshHistory = () => {
    $("#input-history").empty();
    let historySection = $("#input-history");
    for (const item of history) {
        let row = $("<div>").addClass("row mb10");
        let col = $("<div>").addClass("col s12").html(`<a class="waves-effect waves-light btn-small stretch" data-city="${item}">${item}</a>`);
        historySection.append(row.append(col));
    }
}

//tests that the input isn't empty and hands it off if it is valid
$("#search-form").on("submit", function(e) {
    e.preventDefault();
    const cityInput = $("#city");
    let input = cityInput.val().toLowerCase().trim();
    cityInput.val("");
    if(input.length > 0) {
        getResults(input);
        $("#search-form").find("#submit-btn").addClass("disabled");
        setTimeout(() => {
            $("#search-form").find("#submit-btn").removeClass("disabled");
        }, 1000);
    }
})

//handles the history button clicks
$("#input-history").on("click", function(e) {
    bubbleUp($(e.target).attr("data-city"));
    refreshHistory();
    getResults($(e.target).attr("data-city"));
});

$("#clear-history").on("click", () => {
    history = [];
    refreshHistory();
})
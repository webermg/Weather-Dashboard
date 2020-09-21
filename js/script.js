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

let history = [];

$(document).ready(() => {
    //load from localstorage
    history = localStorage.getItem("history") != null ? JSON.parse(localStorage.getItem("history")) : [];
    
    refreshHistory();
});

$(window).on("unload", function() {
    //write to localstorage
    localStorage.setItem("history", JSON.stringify(history));
})


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
            loadTodayResult(response, city);
            loadForecastResult(response);
        }).fail(function(error) {
            console.log(error.responseText);
        });
        
    }).fail(function(error) {
        console.log(error.responseText);
    });
}

const loadTodayResult = (response, city) => {
    //header
    let today = new Date();
    const header = todayResults.children("#today-header");
    header.children("#city-name").text(city.toUpperCase());
    header.children("#today-date").text(`(${today.toLocaleDateString()})`);
    header.children("#today-icon").html(`<img src="http://openweathermap.org/img/wn/${response.current.weather[0].icon}.png">`);

    todayResults.children("#today-temp").text(`Temperature: ${response.current.temp} °F`);
    todayResults.children("#today-humidity").text(`Humidity: ${response.current.humidity}%`);
    todayResults.children("#today-wind").text(`Wind Speed:  ${response.current.wind_speed} MPH`);
    todayResults.children("#today-uv").text(`UV Index: ${response.current.uvi}`);
}

const loadForecastResult = response => {
    let day = 0;
    let tomorrow = new Date();
    tomorrow.setTime(tomorrow.getTime() + MS_IN_DAY);
    forecastCards.each(function() {
        $(this).find(".card-title").text(tomorrow.toLocaleDateString());
        $(this).find("#forecast-icon").html(`<img src="http://openweathermap.org/img/wn/${response.daily[day].weather[0].icon}.png">`);
        $(this).find("#forecast-temp").text(`Temp: ${response.daily[day].temp.day} °F`);
        $(this).find("#forecast-humidity").text(`Humidity: ${response.daily[day].humidity}%`);
        day++;
        tomorrow.setTime(tomorrow.getTime() + MS_IN_DAY);
    });    
}

searchForm.on("submit", function(e) {
    e.preventDefault();
    let input = cityInput.val().toLowerCase();
    //load into history
    //  check history for duplicate
    //  if duplicate then reorder history to put duplicate on top
    //  else drop least recent and add to history
    addToHistory(input);
    
    refreshHistory();
    getResults(cityInput.val());
})

//history functions
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
        let row = $("<div>").addClass("row");
        let col = $("<div>").addClass("col s12").html(`<a class="waves-effect waves-light btn-large">${item}</a>`);
        historySection.append(row.append(col));
    }
}

$("#input-history").on("click", function(e) {
    bubbleUp($(e.target).text());
    refreshHistory();
    getResults($(e.target).text());
});
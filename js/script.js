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
const loadingBar = $("#loading-bar");
const todayResults = $("#result-today");
const forecastCards = $("#forecast-cards .card");

const MS_IN_DAY = 86400000;

let history = [];

$(document).ready(() => {
    //load from localstorage
    loadingBar.hide();
    history = localStorage.getItem("history") != null ? JSON.parse(localStorage.getItem("history")) : [];
    
    refreshHistory();
});

$(window).on("unload", function() {
    //write to localstorage
    localStorage.setItem("history", JSON.stringify(history));
})


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
    todayResults.find("#uv-value").text(` ${response.current.uvi} `);
    todayResults.find("#uv-value").removeClass("green yellow orange red purple");
    //select uvi scale color
    switch(Math.floor(response.current.uvi)) {
        case 1:
        case 2:
            todayResults.find("#uv-value").addClass("green");
            break;
        case 3:
        case 4:
        case 5:
            todayResults.find("#uv-value").addClass("yellow");
            break;
        case 6:
        case 7:
            todayResults.find("#uv-value").addClass("orange");
            break;
        case 8:
        case 9:
        case 10:
            todayResults.find("#uv-value").addClass("red");
            break;
        default:
            todayResults.find("#uv-value").addClass("purple");
    }
}

const loadForecastResult = response => {
    let day = 0;
    let date = new Date();
    date.setTime(date.getTime() + MS_IN_DAY);
    forecastCards.each(function() {
        $(this).find(".card-title").text(date.toLocaleDateString(undefined,{ month: 'numeric', day: 'numeric' }));
        $(this).find("#forecast-icon").html(`<img src="http://openweathermap.org/img/wn/${response.daily[day].weather[0].icon}.png">`);
        $(this).find("#forecast-temp").text(`Temp: ${response.daily[day].temp.day} °F`);
        $(this).find("#forecast-humidity").text(`Humidity: ${response.daily[day].humidity}%`);
        day++;
        date.setTime(date.getTime() + MS_IN_DAY);
    });    
}



searchForm.on("submit", function(e) {
    e.preventDefault();
    let input = cityInput.val().toLowerCase().trim();
    cityInput.val("");
    if(input.length > 0) {
        getResults(input);
        searchForm.find("#submit-btn").addClass("disabled");
        setTimeout(() => {
            searchForm.find("#submit-btn").removeClass("disabled");
        }, 1000);
    }
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
        let col = $("<div>").addClass("col s12").html(`<a class="waves-effect waves-light btn-small stretch">${item}</a>`);
        historySection.append(row.append(col));
    }
}

$("#input-history").on("click", function(e) {
    bubbleUp($(e.target).text());
    refreshHistory();
    getResults($(e.target).text());
});

$("#clear-history").on("click", () => {
    history = [];
    refreshHistory();
})
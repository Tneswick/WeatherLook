// DOM variables
var forecastContainerEl = document.getElementById("forecast-container");
var selectedTempEl = document.getElementById("temp");
var selectedWindEl = document.getElementById("wind");
var selectedHumidityEl = document.getElementById("humidity");
var selectedUviSpan = document.getElementById("uvi")
var selectedCityEl = document.getElementById("city");
var selectedCityIcon = document.getElementById("city-icon");
var cityHistoryEl = document.getElementById("city-history");
var inputFieldEl = document.getElementById("city-search");
var searchBtnEl = document.getElementById("search-btn");
var currentConditionsEl = document.getElementById("current-conditions");
var currentForecastEl = document.getElementById("current-forecast");

// empty array for cities storage

var getSearchCity = function () {
    if (inputFieldEl.value) {
        var searchCity = inputFieldEl.value;
        getCityGeo(searchCity);
    } else {
        alert("Please enter a city");
    }
}

// fetch function for lat/lon
var getCityGeo = function(city) {
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=916759247b8196a0b6fba752b7a3ccd9"
    fetch(apiUrl)
    .then(function (response) {
        // check for failure
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
                if(data.length > 0) {
                    inputFieldEl.value = "";
                    var city = data[0].name;
                    var cityLat = data[0].lat;
                    var cityLon = data[0].lon;
                    var state = data[0].state;
    
                    
                    if (city && !localStorage.getItem(city)){
                        localStorage.setItem(city, city)
                    };
                    if (!document.querySelector("[data-city='" + city + "'")) {
                        createHistoryButtons(city);
                    };
    
                    getWeather(cityLat, cityLon, city, state)
                } else {
                    alert("Unable to find that city");
                    inputFieldEl.value = "";
                }
            })
        } else {
            alert("There was a problem with your request")
        }
    })
}

// https://stackoverflow.com/questions/17745292/how-to-retrieve-all-localstorage-items-without-knowing-the-keys-in-advance
function allStorage() {

    var values =[ ],
        keys = Object.keys(localStorage),
        i = keys.length;

        
    while ( i-- ) {
        values.push(localStorage.getItem(keys[i]) );
    }

    return values;
}


var createHistoryButtons = function (addBtn) {
    if (addBtn) {
        var cityBtnNew = document.createElement("button");
        cityBtnNew.textContent = addBtn
        cityBtnNew.classList.add("btn", "btn-dark", "col-11", "m-2");
        cityBtnNew.setAttribute("data-city", addBtn)
        cityHistoryEl.prepend(cityBtnNew);
    } else {

        if (allStorage() != []) {
    
            for (let i = 0; i < allStorage().length; i++) {
                var city = allStorage()[i];
                var cityBtn = document.createElement("button");
                cityBtn.textContent = city;
                cityBtn.classList.add("btn", "btn-dark", "col-11", "m-2");
                cityBtn.setAttribute("data-city", city)
                cityHistoryEl.prepend(cityBtn);
            }
        }
    }
}

var getWeather = function (lat, lon, city, state) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=916759247b8196a0b6fba752b7a3ccd9";
    console.log(apiUrl);
    fetch(apiUrl)
    .then(function (response) {
        // check for failure
        if (response.ok) {
            response.json().then(function (data) {
                // if it is a state, include it
                if (state) {
                    selectedCityEl.innerHTML = city + ", " + state + "<image src='http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png'></image>"; 
                } else {
                    // do not include state
                    selectedCityEl.innerHTML = city + "<image src='http://openweathermap.org/img/wn/" + data.current.weather[0].icon + ".png'></image>";
                }
                // fill out html
                selectedTempEl.textContent = "Temp: " + data.current.temp + "°F";
                selectedWindEl.textContent = "Wind: " + data.current.wind_speed + " MPH";
                selectedHumidityEl.textContent = "Humidity: " + data.current.humidity + "%";
                selectedUviSpan.textContent = data.current.uvi;
                console.log(data.current.uvi);

                // remove uvi backgrounds
                selectedUviSpan.classList.remove("bg-success", "bg-warning", "bg-danger");

                // uvi color coding
                if (data.current.uvi <= 2.99 || data.current.uvi === 0) {
                    selectedUviSpan.classList.add("bg-success");
                } else if (data.current.uvi >= 3 && data.current.uvi <= 5.99) {
                    selectedUviSpan.classList.add("bg-warning");
                } else if (data.current.uvi >= 6) {
                    selectedUviSpan.classList.add("bg-danger");
                }

                // unhide elements
                currentConditionsEl.classList.remove("invisible");
                currentForecastEl.classList.remove("invisible");

                // check if cards already exist
                // https://attacomsian.com/blog/javascript-dom-check-if-an-element-has-children#:~:text=To%20check%20if%20an%20HTML,any%20child%20nodes%2C%20otherwise%20false%20.&text=Whitespace%20and%20comments%20inside%20a,as%20text%20and%20comment%20nodes.
                if (!forecastContainerEl.hasChildNodes){

                    // for loop to build out 5 day forecast
                    for (var i = 1; i < 6; i++) {
                        var dateUnix = data.daily[i].dt;
                        var dateMilliseconds = dateUnix * 1000;
                        var dateObject = new Date(dateMilliseconds);
                        var humanDateFormat = dateObject.toLocaleDateString('en-US');
    
                        // create DOM elements
                        var outerDiv = document.createElement("div");
                        outerDiv.classList.add("col");
    
                        var innerDiv = document.createElement("div");
                        innerDiv.classList.add("bg-primary", "border", "border-light", "shadow", "p-2");
                        // append to first div
                        outerDiv.appendChild(innerDiv);
    
                        var cardTitle = document.createElement("h4");
                        cardTitle.classList.add("text-light", "fs-5", "fw-bold", "border-bottom", "pb-2");
                        cardTitle.innerHTML = humanDateFormat + "<image src='http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png'></image>";
                        // append to innerDiv
                        innerDiv.appendChild(cardTitle);
    
                        var cardParagraph = document.createElement("p");
                        cardParagraph.classList.add("text-light", "bg-info", "p-2", "lh-lg", "fs-5")
                        cardParagraph.innerHTML = "Temp: " + data.daily[i].temp.max + "°F<br />Wind: " + data.daily[i].wind_speed + " MPH<br />Humidity: " + data.daily[i].humidity + "%";
                        // append to innerDiv
                        innerDiv.appendChild(cardParagraph);
                        // append to forecast container
                        forecastContainerEl.appendChild(outerDiv);

                    }
                } else {
                    // clear out old cards
                    forecastContainerEl.innerHTML = "";

                    // run same for loop with fresh html
                    for (var i = 1; i < 6; i++) {
                        var dateUnix = data.daily[i].dt;
                        var dateMilliseconds = dateUnix * 1000;
                        var dateObject = new Date(dateMilliseconds);
                        var humanDateFormat = dateObject.toLocaleDateString('en-US');
    
                        // create DOM elements
                        var outerDiv = document.createElement("div");
                        outerDiv.classList.add("col");
    
                        var innerDiv = document.createElement("div");
                        innerDiv.classList.add("bg-info", "border", "border-light", "shadow", "p-2");
                        // append to first div
                        outerDiv.appendChild(innerDiv);
    
                        var cardTitle = document.createElement("h4");
                        cardTitle.classList.add("text-light", "fs-5", "fw-bold", "border-bottom", "pb-2");
                        cardTitle.innerHTML = humanDateFormat + "<image src='http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + ".png'></image>";
                        // append to innerDiv
                        innerDiv.appendChild(cardTitle);
    
                        var cardParagraph = document.createElement("p");
                        cardParagraph.classList.add("text-light", "lh-lg", "fs-5")
                        cardParagraph.innerHTML = "Temp: " + data.daily[i].temp.max + "°F<br />Wind: " + data.daily[i].wind_speed + " MPH<br />Humidity: " + data.daily[i].humidity + "%";
                        // append to innerDiv
                        innerDiv.appendChild(cardParagraph);
                        // append to forecast container
                        forecastContainerEl.appendChild(outerDiv);
                    }
                }
            })
        }
    })
}

// event listeners
searchBtnEl.addEventListener("click", getSearchCity);
inputFieldEl.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.key === "Enter") {
        getSearchCity();
    }
})

cityHistoryEl.addEventListener("click", function(event) {
    if (event.target) {
        var city = event.target.textContent;
        getCityGeo(city);
    }
})

// call on 
createHistoryButtons();
// create a weather forecast site using the weather API from the previous lesson
// be able to search for a specific location
// toggle displaying the data in Fahrenheit or Celsius
//You should change the look of the page based on the data, maybe by changing the color of the background or by adding images that describe the weather
// API key as env

let mainContainer = document.querySelector('.main-container');

// user inputs city name and clicks on the magnifiing glass or clicks enter
function addSearchInputEvents() {
  let formSubmitButton = mainContainer.querySelector('#form-submit-button');
  let searchInputField = mainContainer.querySelector('#location-input-field');

  formSubmitButton.addEventListener('click', function (event) {
    event.preventDefault();
    matchInputWithLocation(searchInputField.value);
  });
}
addSearchInputEvents();

async function matchInputWithLocation(input) {
  let citiesMatchingInput = await getCityCoordinates(input);

  // here is where the popup should go to choose from multiple locations
  clearCurrentForecast();
  populateWeeklyForecastCards(
    await groupWeeklyForecastByDay(getForecast(citiesMatchingInput[0]))
  );
  populateCurrentWeather(await getCurrentWeather(citiesMatchingInput[0]));
}

// all cities with that name are fetched

// in case there are multiple matches a popup appears where the user selects which city they meant

// or an error is returned if there are no matches

// after choosing a city the forecast is fetched
async function getCurrentWeather(city) {
  const apiKey = '483131751bb051878db079cb43de989d';
  const lat = city.lat;
  const lon = city.lon;

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  const weather = await response.json();

  return weather;
}

async function getCityCoordinates(userInput) {
  const apiKey = '483131751bb051878db079cb43de989d';
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${userInput}&limit=5&appid=${apiKey}`
  );
  const cityCoordinates = await response.json();

  return cityCoordinates;
}

async function getForecast(city) {
  const apiKey = '483131751bb051878db079cb43de989d';
  const lat = city.lat;
  const lon = city.lon;

  const response = await fetch(
    `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  const forecast = await response.json();

  return forecast;
}

// forecast is grouped by day
async function groupWeeklyForecastByDay(forecast) {
  let functionForecast = await forecast;
  let dateString = await forecast;
  dateString = clearDateOfTime(dateString.list[0].dt_txt);

  let weekForecast = {
    dayOne: [],
    dayTwo: [],
    dayThree: [],
    dayFour: [],
    dayFive: [],
  };

  let dateObject = new Date(dateString);

  let weekday = weekdays[dateObject.getDay()];
  weekForecast.dayOne.push(weekday);
  let dayCounter = 1;

  functionForecast.list.forEach((entry, i) => {
    let entryDate = clearDateOfTime(entry.dt_txt);

    if (entryDate == dateString) {
      if (dayCounter == 1) {
        weekForecast.dayOne.push(entry);
      }
      if (dayCounter == 2) {
        weekForecast.dayTwo.push(entry);
      }
      if (dayCounter == 3) {
        weekForecast.dayThree.push(entry);
      }
      if (dayCounter == 4) {
        weekForecast.dayFour.push(entry);
      }
      if (dayCounter == 5) {
        weekForecast.dayFive.push(entry);
      }
    }

    if (entryDate != dateString) {
      dayCounter++;
      dateString = clearDateOfTime(functionForecast.list[i].dt_txt);
      dateObject = new Date(dateString);
      weekday = weekdays[dateObject.getDay()];

      if (dayCounter == 2) {
        weekForecast.dayTwo.push(weekday);
        weekForecast.dayTwo.push(entry);
      }
      if (dayCounter == 3) {
        weekForecast.dayThree.push(weekday);
        weekForecast.dayThree.push(entry);
      }
      if (dayCounter == 4) {
        weekForecast.dayFour.push(weekday);
        weekForecast.dayFour.push(entry);
      }
      if (dayCounter == 5) {
        weekForecast.dayFive.push(weekday);
        weekForecast.dayFive.push(entry);
      }
    }

    // set date of first element to var
    // if date of next element is the same push to same array
    // if date is different change date var and move on
  });

  return weekForecast;
}

// populating functions
function populateWeeklyForecastCards(forecast) {
  const forecastContainer = mainContainer.querySelector(
    '.week-forecast-container'
  );

  for (const key in forecast) {
    const currentDailyForecast = forecast[key];
    const forecastLength = currentDailyForecast.length;
    let approximatedDailyForecast;

    // checking if entry is equal or longer than 6, if it is we can take the noon forecast as the dayily value, if not the latest for that day
    if (forecastLength >= 6) {
      approximatedDailyForecast = currentDailyForecast[5];
    } else {
      approximatedDailyForecast = currentDailyForecast[forecastLength - 1];
    }

    let weatherIcon = approximatedDailyForecast.weather[0].icon;

    // removes the need for nightly forecast icons
    if (weatherIcon.includes('n')) {
      weatherIcon = weatherIcon.replace('n', 'd');
    }

    const temperature = Math.round(approximatedDailyForecast.main.temp);
    const humidity = Math.round(approximatedDailyForecast.main.humidity);

    let forecastCard = document.createElement('div');
    forecastCard.classList.add('weekday-forecast');
    forecastCard.innerHTML = `<p class="weekday-forecast-day-title">${currentDailyForecast[0]}</p>
            <img
              src="/assets/weather/${weatherIcon}.png"
              class="weather-icon"
            />
            <div class="secondary-weather-forecast">
              <div class="weekday-temperature-container">
                <p class="weather-indicator">t:</p>
                <p class="temperature">${temperature}°C</p>
              </div>
              <div class="weekday-humidity-container">
                <p class="weather-indicator">h:</p>
                <p class="humidity">${humidity}%</p>
              </div>
            </div>`;
    forecastContainer.appendChild(forecastCard);
  }
}

function populateCurrentWeather(forecast) {
  const currentWeatherContainer = mainContainer.querySelector(
    '.current-weather-container'
  );

  let weatherIcon = forecast.weather[0].icon;

  // removes the need for nightly forecast icons
  if (weatherIcon.includes('n')) {
    weatherIcon = weatherIcon.replace('n', 'd');
  }

  const temperature = Math.round(forecast.main.temp);
  const humidity = Math.round(forecast.main.humidity);
  const pressure = Math.round(forecast.main.pressure);
  const windspeed = Math.round(forecast.wind.speed);

  let currentForecastElement = document.createElement('div');
  currentForecastElement.innerHTML = `<p class="current-title">current weather</p>
        <div class="current-details-container">
          <img
            src="/assets/weather/${weatherIcon}.png"
            id="todays-forecast-icon"
          />
          <div class="current-details">
            <div class="temperature">
              <p class="temperature-title">temperature:</p>
              <p id="temperature">${temperature}°C</p>
            </div>
            <div class="humidity">
              <p class="humidity-title">humidity:</p>
              <p id="humidity">${humidity}%</p>
            </div>
            <div class="pressure">
              <p class="pressure-title">pressure:</p>
              <p id="pressure">${pressure}kPa</p>
            </div>
            <div class="wind">
              <p class="wind-title">wind speed:</p>
              <p id="wind">${windspeed}km/h</p>
            </div>
          </div>
        </div>`;
  currentWeatherContainer.appendChild(currentForecastElement);
}

async function populateFirstLoad() {
  let city = await getCityCoordinates('Pula');
  populateWeeklyForecastCards(
    await groupWeeklyForecastByDay(getForecast(city[0]))
  );
  populateCurrentWeather(await getCurrentWeather(city[0]));
}
//populateFirstLoad();

// delete/clearing functions
function clearCurrentForecast() {
  const currentWeatherContainer = mainContainer.querySelector(
    '.current-weather-container'
  );

  const forecastContainer = mainContainer.querySelector(
    '.week-forecast-container'
  );

  currentWeatherContainer.innerHTML = '';
  forecastContainer.innerHTML = '';
}

// after inputting a new city the page clears to show new data

// random helper shit
function clearDateOfTime(date) {
  date = date.split(' ');
  return date[0];
}

const weekdays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

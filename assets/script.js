const apiKey = '72b627719ba5269e98be25402bec2f3c'; // OpenWeatherMap API key
const weatherContainer = document.getElementById('weatherContainer'); // Store current weather item
const forecastContainer = document.getElementById('forecastContainer'); // Store forecast items
const searchHistoryContainer = document.getElementById('searchHistory'); // Store search history items
const searchHistorySet = new Set(); // Store unique search history items

document.getElementById('searchButton').addEventListener('click', searchWeather); // Add event listener to search button
document.getElementById('searchButton').addEventListener('touchstart', searchWeather); // Add event listener to search button

// Add event listener to enter key
document.addEventListener('keydown', event => {
    if (event.key === "Enter") searchWeather();
});

// Initial search
function searchWeather() {
    const cityInput = document.getElementById('cityInput').value.trim().toLowerCase();

    // Check if city input is empty
    if (!searchHistorySet.has(cityInput)) {
        searchHistorySet.add(cityInput);
        addHistoryItem(cityInput);
    }

    // Fetch weather data and display it to the user
    fetchWeatherData(cityInput).then(({currentData, forecastData}) => {
        displayWeather(currentData, forecastData);
        toggleErrorMessage(false);
    }).catch(error => {
        console.error('Error fetching weather data:', error);
        toggleErrorMessage(true);
    });
}

// Fetch weather data from OpenWeatherMap API using city name and API key
async function fetchWeatherData(city) {
    const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`);
    const currentData = await currentResponse.json();
    currentData.main.temp = kelvinToFahrenheit(currentData.main.temp);

    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${apiKey}`);
    const forecastData = await forecastResponse.json();
    forecastData.list.forEach(item => item.main.temp = kelvinToFahrenheit(item.main.temp));

    return {currentData, forecastData};
}

// Display current weather and forecast data to the user
function displayWeather(currentData, forecastData) {
    displayCurrentWeather(currentData);
    displayForecast(forecastData);
}

// Display current weather data to the user in a card format with city name, date, temperature, humidity, wind speed, and weather icon
function displayCurrentWeather(data) {
    weatherContainer.innerHTML = `<div class="bg-white rounded-lg p-4 mb-4 text-center font-bold">
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>Date: ${new Date(data.dt * 1000).toLocaleDateString()}</p>
        <p>Temperature: ${Math.floor(data.main.temp)}°F</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}">
    </div>`;
}

// Display forecast data to the user in a card format with date, temperature, humidity, wind speed, and weather icon
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    data.list.filter(item => new Date(item.dt * 1000).toLocaleDateString() !== new Date().toLocaleDateString())
        .slice(0, 4).forEach(item => {
        forecastContainer.innerHTML += `<div class="bg-white rounded-lg p-4 mb-4">
            <h3>${new Date(item.dt * 1000).toLocaleDateString()}</h3>
            <p>Temperature: ${Math.floor(item.main.temp)}°F</p>
            <p>Humidity: ${item.main.humidity}%</p>
            <p>Wind Speed: ${item.wind.speed} m/s</p>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
        </div>`;
    });
}

// Add search history item to the search history container
function addHistoryItem(city) {
    const item = document.createElement('div');
    item.textContent = city;
    item.classList.add('bg-white', 'rounded-lg', 'p-2', 'mb-2', 'cursor-pointer');
    item.onclick = () => { document.getElementById('cityInput').value = city; searchWeather(); };
    searchHistoryContainer.appendChild(item);
}

// Convert Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin) {
    return (kelvin - 273.15) * 9/5 + 32;
}

// Toggle error message
function toggleErrorMessage(show) {
    document.getElementById('errorMessage').classList.toggle('hidden', !show);
}
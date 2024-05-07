const apiKey = '72b627719ba5269e98be25402bec2f3c';
const weatherContainer = document.getElementById('weatherContainer');
const forecastContainer = document.getElementById('forecastContainer');
const searchHistoryContainer = document.getElementById('searchHistory');
const searchHistorySet = new Set(); // Store unique search history items

document.getElementById('searchButton').addEventListener('click', searchWeather);
document.getElementById('searchButton').addEventListener('touchstart', searchWeather);

document.addEventListener('keydown', event => {
    if (event.key === "Enter") searchWeather();
});

function searchWeather() {
    const cityInput = document.getElementById('cityInput').value.trim().toLowerCase();
    if (searchHistorySet.has(cityInput)) return;

    fetchWeatherData(cityInput).then(({currentData, forecastData}) => {
        displayWeather(currentData, forecastData);
        searchHistorySet.add(cityInput);
        addHistoryItem(cityInput);
        toggleErrorMessage(false);
    }).catch(error => {
        console.error('Error fetching weather data:', error);
        toggleErrorMessage(true);
    });
}

async function fetchWeatherData(city) {
    const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`);
    const currentData = await currentResponse.json();
    currentData.main.temp = kelvinToFahrenheit(currentData.main.temp);

    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${apiKey}`);
    const forecastData = await forecastResponse.json();
    forecastData.list.forEach(item => item.main.temp = kelvinToFahrenheit(item.main.temp));

    return {currentData, forecastData};
}

function displayWeather(currentData, forecastData) {
    displayCurrentWeather(currentData);
    displayForecast(forecastData);
}

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

function addHistoryItem(city) {
    const item = document.createElement('div');
    item.textContent = city;
    item.classList.add('bg-white', 'rounded-lg', 'p-2', 'mb-2', 'cursor-pointer');
    item.onclick = () => { document.getElementById('cityInput').value = city; searchWeather(); };
    searchHistoryContainer.appendChild(item);
}

function kelvinToFahrenheit(kelvin) {
    return (kelvin - 273.15) * 9/5 + 32;
}

function toggleErrorMessage(show) {
    document.getElementById('errorMessage').classList.toggle('hidden', !show);
}

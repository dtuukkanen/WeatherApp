// Get API Keys from api_keys.js
const openWeatherMapApiKey = apiKeys.OPEN_WEATHER_MAP;

const locationSearch = document.getElementById("location-search");
const searchResults = document.getElementById("location-list");
const geolocation = document.getElementById("geolocation");
const fahrenheitCelsius = document.getElementById("fahrenheit-celsius");
const currentWeather = document.getElementById("weather-currently");
const body = document.querySelector("body");

let temperatureUnitInUse = "°C";
let latestWeatherData = null;

getOpenWeatherMapData = async (latitude, longitude) => {
    const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    console.log(data);
    latestWeatherData = data;
    showWeatherOfTheDay(data);
};

getLocationInformation = async () => {
    const location = locationSearch.value;
    if (!location) {
        searchResults.innerHTML = "";
        searchResults.classList.remove("show");
        return;
    }
    const response = await fetch(
        "http://api.openweathermap.org/geo/1.0/direct?q=" + location + "&limit=5&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    console.log(data);
    updateDropdown(data);
};

const updateDropdown = (locations) => {
    searchResults.innerHTML = "";
    if (!Array.isArray(locations) || locations.length === 0) {
        searchResults.classList.remove("show");
        return;
    }
    locations.forEach((location) => {
        const li = document.createElement("li");
        li.classList.add('dropdown-item');
        li.textContent = `${location.name}, ${location.country}`;
        li.addEventListener("click", () => {
            locationSearch.value = `${location.name}, ${location.country}`;
            getOpenWeatherMapData(location.lat, location.lon);
            searchResults.classList.remove("show");
        });
        searchResults.appendChild(li);
    });
    searchResults.classList.add("show");
};

const getGeolocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        getOpenWeatherMapData(position.coords.latitude, position.coords.longitude);
    });
}

const temperatureToggle = () => {
    temperatureUnitInUse = temperatureUnitInUse === "°C" ? "°F" : "°C";
    fahrenheitCelsius.textContent = temperatureUnitInUse;
    if (latestWeatherData) {
        showWeatherOfTheDay(latestWeatherData);
    }
}

const showWeatherOfTheDay = (data) => {
    // Clear the weather of the day div
    currentWeather.innerHTML = "";

    // Get current weather information
    const city = data.name;
    const weatherIcon = data.weather[0].icon;
    const temperature = convertTemperature(data.main.temp);
    const temperaturemin = convertTemperature(data.main.temp_min);
    const temperaturemax = convertTemperature(data.main.temp_max);
    const feelsLike = convertTemperature(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const windDirection = data.wind.deg;

    // Create elements to display weather information
    const cityElement = document.createElement("h1");
    const img = document.createElement("img");
    const temperatureElement = document.createElement("p");
    const temperatureMinMaxElement = document.createElement("p");
    const feelsLikeElement = document.createElement("p");
    const humidityElement = document.createElement("p");
    const windElement = document.createElement("p");

    // Set background color based on temperature
    const kelvins = data.main.temp;
    if (kelvins < 253.15) { // -20°C
        body.style.backgroundColor = "purple";
    } else if (kelvins < 263.15) { // -10°C
        body.style.backgroundColor = "blue";
    } else if (kelvins < 273.15) { // 0°C
        body.style.backgroundColor = "cyan";
    } else if (kelvins < 283.15) { // 10°C
        body.style.backgroundColor = "lightblue";
    } else if (kelvins < 293.15) { // 20°C
        body.style.backgroundColor = "green";
    } else if (kelvins < 303.15) { // 30°C
        body.style.backgroundColor = "yellow";
    } else { // 30°C+
        body.style.backgroundColor = "red";
    }

    // Set the text content of the elements
    cityElement.textContent = "Weather in " + city;
    img.src = getIconSource(weatherIcon);
    img.alt = data.weather[0].description;
    temperatureElement.textContent = `Temperature: ${temperature}${temperatureUnitInUse}`;
    temperatureMinMaxElement.textContent = `Min: ${temperaturemin}${temperatureUnitInUse}, Max: ${temperaturemax}${temperatureUnitInUse}`;
    feelsLikeElement.textContent = `Feels like: ${feelsLike}${temperatureUnitInUse}`;
    humidityElement.textContent = `Humidity: ${humidity}%`;
    windElement.textContent = `Wind: ${windSpeed} m/s at ${windDirection}˚`;

    // Append elements to the weather of the day div
    currentWeather.appendChild(cityElement);
    currentWeather.appendChild(img);
    currentWeather.appendChild(temperatureElement);
    currentWeather.appendChild(temperatureMinMaxElement);
    currentWeather.appendChild(feelsLikeElement);
    currentWeather.appendChild(humidityElement);
    currentWeather.appendChild(windElement);
}

const getIconSource = (icon) => {
    return `http://openweathermap.org/img/wn/${icon}.png`;
}

const convertTemperature = (temperature) => {
    let convertedTemp;
    if (temperatureUnitInUse === "°C") {
        convertedTemp = temperature - 273.15;
    } else {
        convertedTemp = (temperature - 273.15) * 9 / 5 + 32;
    }
    return parseFloat(convertedTemp).toFixed(1);
}

locationSearch.addEventListener("input", getLocationInformation);
geolocation.addEventListener("click", getGeolocation);
fahrenheitCelsius.addEventListener("click", temperatureToggle);
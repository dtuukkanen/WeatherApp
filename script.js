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

const getOpenWeatherMapData = async (latitude, longitude) => {
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
    const kelvins = data.main.temp;
    const temperature = convertTemperature(data.main.temp);
    const temperaturemin = convertTemperature(data.main.temp_min);
    const temperaturemax = convertTemperature(data.main.temp_max);
    const feelsLike = convertTemperature(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const windDirection = data.wind.deg;
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const currentTime = new Date();

    // Log the times for debugging
    console.log("Current Time:", currentTime);
    console.log("Sunrise:", sunrise);
    console.log("Sunset:", sunset);

    // Create elements to display weather information
    const cityElement = document.createElement("h1");
    const img = document.createElement("img");
    const temperatureElement = document.createElement("p");
    const temperatureMinMaxElement = document.createElement("p");
    const feelsLikeElement = document.createElement("p");
    const humidityElement = document.createElement("p");
    const windElement = document.createElement("p");

    console.log(currentTime);

    // Set background color based on temperature
    let backgroundColor;
    if (kelvins < 253.15) { // -20°C
        backgroundColor = "#800080"; // purple
    } else if (kelvins < 263.15) { // -10°C
        backgroundColor = "#0000FF"; // blue
    } else if (kelvins < 273.15) { // 0°C
        backgroundColor = "#00FFFF"; // cyan
    } else if (kelvins < 283.15) { // 10°C
        backgroundColor = "#ADD8E6"; // lightblue
    } else if (kelvins < 293.15) { // 20°C
        backgroundColor = "#008000"; // green
    } else if (kelvins < 303.15) { // 30°C
        backgroundColor = "#FFFF00"; // yellow
    } else { // 30°C+
        backgroundColor = "#FF0000"; // red
    }

    // Set background color based on time of day
    const isNight = currentTime < sunrise || currentTime > sunset;
    console.log("Is it night?", isNight);

    if (isNight) {
        // Apply a dimming effect by adjusting the alpha channel
        body.style.backgroundColor = adjustBrightness(backgroundColor, 0.3);
        body.style.color = "white"; // Set text color to white for better contrast
    } else {
        body.style.backgroundColor = backgroundColor;
        body.style.color = "black"; // Set text color to black for better contrast
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

// Function to adjust brightness of a hex color
function adjustBrightness(hex, factor) {
    const r = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * factor)));
    const g = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * factor)));
    const b = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * factor)));
    return `rgb(${r}, ${g}, ${b})`;
}

locationSearch.addEventListener("input", getLocationInformation);
geolocation.addEventListener("click", getGeolocation);
fahrenheitCelsius.addEventListener("click", temperatureToggle);
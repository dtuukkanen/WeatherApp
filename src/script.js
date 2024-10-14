// Get API Keys from api_keys.js
const openWeatherMapApiKey = apiKeys.OPEN_WEATHER_MAP;

const locationSearch = document.getElementById("location-search");
const searchResults = document.getElementById("location-list");
const geolocation = document.getElementById("geolocation");
const fahrenheitCelsius = document.getElementById("fahrenheit-celsius");
const currentWeather = document.getElementById("weather-currently");
const weatherHourly = document.getElementById("weather-hourly");
const weather5Days = document.getElementById("weather-5days");
const body = document.querySelector("body");

let temperatureUnitInUse = "°C";
let latestCurrentWeatherData = null;
let latest24HourWeatherData = null;
let latest5DayWeatherData = null;
let favorites = [];

const fetchCurrentWeather = async (latitude, longitude) => {
    const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    //console.log(data);
    latestCurrentWeatherData = data;
    showWeatherOfTheDay(data);
};

const fetch24HourWeather = async (latitude, longitude) => {
    const response = await fetch(
        "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&cnt=8&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    //console.log(data);
    latest24HourWeatherData = data;
    showWeatherOf24Hours(data);
}

const fetch5DayWeather = async (latitude, longitude) => {
    const response = await fetch(
        "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    //console.log(data);
    latest5DayWeatherData = data;
    showWeatherOf5Days(data);
}

const getLocationInformation = async () => {
    const location = locationSearch.value;
    if (!location) {
        searchResults.innerHTML = "";
        searchResults.classList.remove("show");
        return;
    }
    const response = await fetch(
        "https://api.openweathermap.org/geo/1.0/direct?q=" + location + "&limit=5&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    //console.log(data);
    updateDropdown(data);
};

const addFavorite = (location) => {
    const favoriteIndex = favorites.findIndex(favorite => favorite.name === location.name && favorite.country === location.country);
    if (favoriteIndex === -1) {
        favorites.push(location);
        //console.log("Added to favorites:", location);
    } else {
        favorites.splice(favoriteIndex, 1);
        //console.log("Removed from favorites:", location);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateDropdown([]); // Refresh the dropdown to show the updated favorites
};

const updateDropdown = (locations) => {
    searchResults.innerHTML = "";

    // Add favorites to the dropdown
    if (favorites.length > 0) {
        const favoritesHeader = document.createElement("li");
        favoritesHeader.classList.add('dropdown-header');
        favoritesHeader.textContent = "Favorites";
        searchResults.appendChild(favoritesHeader);

        favorites.forEach((favorite) => {
            const li = document.createElement("li");
            li.classList.add('dropdown-item');
            li.textContent = `${favorite.name}, ${favorite.country}`;
            li.addEventListener("click", () => {
                locationSearch.value = `${favorite.name}, ${favorite.country}`;
                fetchCurrentWeather(favorite.lat, favorite.lon);
                fetch24HourWeather(favorite.lat, favorite.lon);
                fetch5DayWeather(favorite.lat, favorite.lon);
                searchResults.classList.remove("show");
            });

            // Add a button to remove from favorites
            const unstarButton = document.createElement("button");
            unstarButton.textContent = "☆";
            unstarButton.style.marginLeft = "10px"; // Add some margin to separate the button from the text
            unstarButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Stop the click event from propagating to the parent li
                addFavorite(favorite); // This will remove the favorite
            });
            li.appendChild(unstarButton);
    
            searchResults.appendChild(li);
        });


        const divider = document.createElement("li");
        divider.classList.add('dropdown-divider');
        searchResults.appendChild(divider);
    }

    // Add search results to the dropdown
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
            fetchCurrentWeather(location.lat, location.lon);
            fetch24HourWeather(location.lat, location.lon);
            fetch5DayWeather(location.lat, location.lon);
            searchResults.classList.remove("show");
        });

        // Add a button to add to favorites
        const favoriteButton = document.createElement("button");
        favoriteButton.textContent = "⭐️";
        favoriteButton.style.marginLeft = "10px"; // Add some margin to separate the button from the text
        favoriteButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Stop the click event from propagating to the parent li
            // console.log("Favorite button clicked for:", location);
            addFavorite(location);
            updateDropdown(locations); // Refresh the dropdown to show the updated favorites
        });
        li.appendChild(favoriteButton);

        searchResults.appendChild(li);
    });
    searchResults.classList.add("show");
};

const getGeolocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
        fetchCurrentWeather(position.coords.latitude, position.coords.longitude);
        fetch24HourWeather(position.coords.latitude, position.coords.longitude);
        fetch5DayWeather(position.coords.latitude, position.coords.longitude);
    });
}

const temperatureToggle = () => {
    temperatureUnitInUse = temperatureUnitInUse === "°C" ? "°F" : "°C";
    fahrenheitCelsius.textContent = temperatureUnitInUse;
    if (latestCurrentWeatherData) {
        showWeatherOfTheDay(latestCurrentWeatherData);
    }
    if (latest24HourWeatherData) {
        showWeatherOf24Hours(latest24HourWeatherData);
    }
    if (latest5DayWeatherData) {
        showWeatherOf5Days(latest5DayWeatherData);
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

    // Create elements to display weather information
    const cityElement = document.createElement("h1");
    const img = document.createElement("img");
    const temperatureElement = document.createElement("p");
    const temperatureMinMaxElement = document.createElement("p");
    const feelsLikeElement = document.createElement("p");
    const humidityElement = document.createElement("p");
    const windElement = document.createElement("p");

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

const showWeatherOf24Hours = (data) => {
    // Clear the weather of the day div
    weatherHourly.innerHTML = "";

    // Create a header for the hourly weather information
    const header = document.createElement("h1");
    header.textContent = "24 Hour Forecast";
    weatherHourly.appendChild(header);

    // Create a table
    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-bordered", "table-responsive");

    // Create table header
    const thead = document.createElement("thead");
    thead.classList.add("table-dark");

    const headerRow = document.createElement("tr");
    const headers = ["Time", "Icon", "Temperature", "Feels Like", "Weather", "Humidity", "Wind Speed"];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement("tbody");
    data.list.forEach(item => {
        const row = document.createElement("tr");

        // Time
        const timeCell = document.createElement("td");
        timeCell.textContent = new Date(item.dt * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        row.appendChild(timeCell);

        // Icon
        const iconCell = document.createElement("td");
        const img = document.createElement("img");
        img.src = getIconSource(item.weather[0].icon);
        img.alt = item.weather[0].description;
        iconCell.appendChild(img);
        row.appendChild(iconCell);

        // Temperature
        const tempCell = document.createElement("td");
        tempCell.textContent = convertTemperature(item.main.temp) + temperatureUnitInUse;
        row.appendChild(tempCell);

        // Feels Like
        const feelsLikeCell = document.createElement("td");
        feelsLikeCell.textContent = convertTemperature(item.main.feels_like) + temperatureUnitInUse;
        row.appendChild(feelsLikeCell);

        // Weather
        const weatherCell = document.createElement("td");
        weatherCell.textContent = item.weather[0].description;
        row.appendChild(weatherCell);

        // Humidity
        const humidityCell = document.createElement("td");
        humidityCell.textContent = item.main.humidity + " %";
        row.appendChild(humidityCell);

        // Wind Speed
        const windSpeedCell = document.createElement("td");
        windSpeedCell.textContent = item.wind.speed + " m/s at " + item.wind.deg + "°";
        row.appendChild(windSpeedCell);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Append the table to the weatherHourly div
    weatherHourly.appendChild(table);
}

const showWeatherOf5Days = (data) => {
    // Clear the weather of the week div
    weather5Days.innerHTML = "";

    // Create a header for the weekly weather information
    const header = document.createElement("h1");
    header.textContent = "5 Day Forecast";
    weather5Days.appendChild(header);

    // Get weekly weather information
    const weeklyWeather = data.list;
    const weeklyWeatherByDay = {};

    weeklyWeather.forEach((weather) => {
        const date = new Date(weather.dt * 1000);
        const day = date.toDateString().slice(0, 3);
        const hour = date.getHours();

        if (!weeklyWeatherByDay[day]) {
            weeklyWeatherByDay[day] = {
                minTemp: weather.main.temp_min,
                maxTemp: weather.main.temp_max,
                weather: weather,
                humidity: weather.main.humidity,
                windSpeed: weather.wind.speed,
                windDirection: weather.wind.deg,
                icon: null,
                description: null,
                middayWeather: null
            };
        } else {
            weeklyWeatherByDay[day].minTemp = Math.min(weeklyWeatherByDay[day].minTemp, weather.main.temp_min);
            weeklyWeatherByDay[day].maxTemp = Math.max(weeklyWeatherByDay[day].maxTemp, weather.main.temp_max);
        }

        if (hour === 12 || !weeklyWeatherByDay[day].icon) {
            weeklyWeatherByDay[day].icon = weather.weather[0].icon;
            weeklyWeatherByDay[day].description = weather.weather[0].description;
            weeklyWeatherByDay[day].middayWeather = weather;
        }
    });

    // Create a table to display weekly weather information
    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-bordered", "table-responsive");

    // Create table header
    const thead = document.createElement("thead");
    thead.classList.add("table-dark");

    // Create table body
    const tbody = document.createElement("tbody");

    // Create table headers
    const headers = ["Day", "Icon", "Temperature", "Min/Max Temperature", "Humidity", "Wind"];
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create table rows for each day's weather
    for (const day in weeklyWeatherByDay) {
        const weather = weeklyWeatherByDay[day];
        const row = document.createElement("tr");

        const dayCell = document.createElement("td");
        const iconCell = document.createElement("td");
        const temperatureCell = document.createElement("td");
        const temperatureMinMaxCell = document.createElement("td");
        const humidityCell = document.createElement("td");
        const windCell = document.createElement("td");

        const img = document.createElement("img");
        img.src = getIconSource(weather.icon);
        img.alt = weather.description;

        dayCell.textContent = day;
        iconCell.appendChild(img);
        temperatureCell.textContent = `${convertTemperature(weather.weather.main.temp)}${temperatureUnitInUse}`;
        temperatureMinMaxCell.textContent = `Min: ${convertTemperature(weather.minTemp)}${temperatureUnitInUse}, Max: ${convertTemperature(weather.maxTemp)}${temperatureUnitInUse}`;
        humidityCell.textContent = `${weather.humidity}%`;
        windCell.textContent = `${weather.windSpeed} m/s at ${weather.windDirection}˚`;

        row.appendChild(dayCell);
        row.appendChild(iconCell);
        row.appendChild(temperatureCell);
        row.appendChild(temperatureMinMaxCell);
        row.appendChild(humidityCell);
        row.appendChild(windCell);

        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    weather5Days.appendChild(table);
}

const getIconSource = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}.png`;
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

document.addEventListener("DOMContentLoaded", () => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
    }
});
locationSearch.addEventListener("input", getLocationInformation);
geolocation.addEventListener("click", getGeolocation);
fahrenheitCelsius.addEventListener("click", temperatureToggle);

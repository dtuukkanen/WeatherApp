
const geolocation = document.getElementById("geolocation");
const fahrenheitCelsius = document.getElementById("fahrenheit-celsius");

let temperatureUnitInUse = "°C";
let latestCurrentWeatherData = null;
let latest24HourWeatherData = null;
let latest5DayWeatherData = null;
let favorites = [];

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
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
    }
});
locationSearch.addEventListener("input", getLocationInformation);
geolocation.addEventListener("click", getGeolocation);
fahrenheitCelsius.addEventListener("click", temperatureToggle);

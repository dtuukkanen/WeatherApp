// Get API Keys from api_keys.js
const openWeatherMapApiKey = apiKeys.OPEN_WEATHER_MAP;

const locationSearch = document.getElementById("location-search");
const searchResults = document.getElementById("location-list");

getOpenWeatherMapData = async (latitude, longitude) => {
    const response = await fetch(
        "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    console.log(data);
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

locationSearch.addEventListener("input", getLocationInformation);
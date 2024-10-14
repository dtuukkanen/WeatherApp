// Get API Keys from api_keys.js
const openWeatherMapApiKey = apiKeys.OPEN_WEATHER_MAP;
const locationSearch = document.getElementById("location-search");

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
};

const fetch5DayWeather = async (latitude, longitude) => {
    const response = await fetch(
        "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=" + openWeatherMapApiKey
    );
    const data = await response.json();
    //console.log(data);
    latest5DayWeatherData = data;
    showWeatherOf5Days(data);
};

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

const getIconSource = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}.png`;
};

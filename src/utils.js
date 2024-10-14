const convertTemperature = (temperature) => {
    let convertedTemp;
    if (temperatureUnitInUse === "°C") {
        convertedTemp = temperature - 273.15;
    } else {
        convertedTemp = (temperature - 273.15) * 9 / 5 + 32;
    }
    return parseFloat(convertedTemp).toFixed(1);
};


// Function to adjust brightness of a hex color
function adjustBrightness(hex, factor) {
    const r = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(1, 3), 16) * factor)));
    const g = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(3, 5), 16) * factor)));
    const b = Math.max(0, Math.min(255, Math.floor(parseInt(hex.slice(5, 7), 16) * factor)));
    return `rgb(${r}, ${g}, ${b})`;
};

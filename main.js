const getUserCity = async () => {
    const response = await fetch('https://ipapi.co/json');
    const data = await response.json();
    return data.city;
}

const getUserCoords = async city => {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
    const data = await response.json();
    const result = data.results[0];
    return { 
        latitude: result.latitude, 
        longitude: result.longitude
    }
}

const getUserWeather = async (latitude, longitude) => {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
    const data = await response.json();
    return data;
}



(async () => {
    const { latitude, longitude } = await getUserCoords(await getUserCity());
    console.log(await getUserWeather(latitude, longitude));
})();


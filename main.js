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

const getUserWeather = async (latitude, longitude, options="current_weather=true") => {
    let URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`;
    if (options) {
        URL += `&${options}`
    }
    const response = await fetch(URL)
    const data = await response.json();
    return data;
}

const getWeeklyWeather = async (latitude, longitude) => {
    const result = await getUserWeather(latitude, longitude, 'daily=temperature_2m_min,temperature_2m_max');
    return result    
}
const days = document.querySelector('.days-of-the-week').children;
const renderDayOfTheWeek = (minTemp, maxTemp, dateISO, dayCount) => {
    const dayElem = days[dayCount];
    const date = (new Date(dateISO));

    const day = date.getDate();
    const dayElement = dayElem.querySelector('.day-number');    
    dayElement.textContent = day;

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekday = weekdays[date.getDay()];
    const weekdayElement = dayElem.querySelector('.day')
    weekdayElement.textContent = weekday;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = months[date.getMonth()];
    const monthElem = dayElem.querySelector('.month');
    monthElem.textContent = month;

    const minTempElement = dayElem.querySelector('.min-temp-count');
    minTempElement.textContent = minTemp;


    const maxTempElement = dayElem.querySelector('.max-temp-count');
    maxTempElement.textContent = maxTemp;
}

const renderEveryThreeHours = data => {
    
    const table = document.querySelector('.current-day');
    for (let i = 0; i < 3; i++) {
        const row = document.createElement('tr');
        table.append(row);
    }
    const rows = table.querySelectorAll('tr');
    
    
       for (let j = 0; j < 7; j++) {
        const elem = document.createElement('td');
        elem.textContent = (new Date(data.time[j])).getHours()
        rows[0].append(elem);
       }
       for (let j = 0; j < 7; j++) {
        const elem = document.createElement('td');
        elem.textContent = data.temperature_2m[j]
        rows[1].append(elem);
       }

       for (let j = 0; j < 7; j++) {
        const elem = document.createElement('td');
        elem.textContent = data.wind_speed_10m[j]
        rows[2].append(elem);
       }

    
    
}

(async () => {
    const { latitude, longitude } = await getUserCoords(await getUserCity());
    const { current_weather, current_weather_units } = await getUserWeather(latitude, longitude);
    const res = await getWeeklyWeather(latitude, longitude);
    for (let i = 0; i < 7; i++) {
        const minTemp = res.daily.temperature_2m_min[i];
        const maxTemp = res.daily.temperature_2m_max[i];
        const date = res.daily.time[i];
        renderDayOfTheWeek(minTemp, maxTemp, date, i)
    }

    const result = await getUserWeather(latitude,longitude, 'hourly=temperature_2m,wind_speed_10m');
    const arr = result;
    let data = arr.hourly
    let obj = {};
    Object.entries(data).forEach(([key, value]) => {
        obj[key] = value.filter((_, idx) => idx % 3 === 0 && idx <= 23)
    });
    
    renderEveryThreeHours(obj);
    
    
})();


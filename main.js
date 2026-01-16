const handleError = errorMsg => {
    console.error(errorMsg);
}

const getUserCity = async () => {
    try {
        const response = await fetch('https://ipapi.co/json');
        const data = await response.json();
        return data.city;
    } catch (error) {
        handleError('Error message');
        return {
            error: 'Error message'
        }
    }
}

const getUserCoords = async city => {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
        const data = await response.json();
        const result = data.results[0];
        return { 
            latitude: result.latitude, 
            longitude: result.longitude
        }
    } catch (error) {
        handleError('Error message');
        return {
            error: 'Error message'
        }
    }
}

const getUserWeather = async (latitude, longitude, options="current_weather=true") => {
    let URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`;
    if (options) {
        URL += `&${options}`
    }
    try {
        const response = await fetch(URL)
        const data = await response.json();
        return data;
    } catch (error) {
        handleError('Error message');
        return {
            error: 'Error message'
        }
    }
}

const getWeeklyWeather = async (latitude, longitude) => {
    try {
        const result = await getUserWeather(latitude, longitude, 'daily=temperature_2m_min,temperature_2m_max');
        return result    
    } catch (error) {
        handleError('Error message');
        return {
            error: 'Error message'
        }
    }
}

const renderDayOfTheWeek = (daysDOM, minTemp, maxTemp, dateISO, dayCount) => {
    const dayElem = daysDOM[dayCount];
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

const renderRow = (row, rowTitle, cellText) => {
    let elem = document.createElement('td');
    elem.textContent = rowTitle
    row.append(elem);
    for (let j = 0; j < 7; j++) {
        const elem = document.createElement('td');
        elem.textContent = cellText[j]
        row.append(elem);
    }
}

const renderEveryThreeHours = (data, table) => {
    for (let i = 0; i < 3; i++) {
        const row = document.createElement('tr');
        table.append(row);
    }

    const rows = table.querySelectorAll('tr');
    
    renderRow(rows[0], 'Hour', data.time)
    renderRow(rows[1], 'Temp', data.temperature)
    renderRow(rows[2], 'Wind', data.wind_speed_10m)
}

const renderWeeklyWeather = (data, daysDOM) => {
    for (let i = 0; i < 7; i++) {
        const minTemp = data.daily.temperature_2m_min[i];
        const maxTemp = data.daily.temperature_2m_max[i];
        const date = data.daily.time[i];
        renderDayOfTheWeek(daysDOM, minTemp, maxTemp, date, i)
    }
}

const transformTodayWeatherData = (data, units) => {
    let obj = {};
    Object.entries(data.hourly).forEach(([key, value]) => {
        obj[key] = value.filter((_, idx) => idx % 3 === 0 && idx <= 23)
    });

    let transformedData = {
        time: obj.time.map(date => (new Date(date)).getHours() + ':00'),
        temperature: obj.temperature_2m.map(temp => temp + units.temperature_2m),
        wind_speed_10m: obj.wind_speed_10m.map(wind => wind + units.wind_speed_10m)
    }
    return transformedData;
}

(async () => {
    try {
        const { latitude, longitude } = await getUserCoords(await getUserCity());
        const { current_weather, current_weather_units } = await getUserWeather(latitude, longitude);

        const res = await getWeeklyWeather(latitude, longitude);
        const days = document.querySelector('.days-of-the-week').children;
        renderWeeklyWeather(res, days)

        const result = await getUserWeather(latitude,longitude, 'hourly=temperature_2m,wind_speed_10m');
    
        const todayWeather = transformTodayWeatherData(result, result.hourly_units);
        
        const table = document.querySelector('.current-day');
        renderEveryThreeHours(todayWeather, table);
    } catch (error) {

    }
})();


const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const weatherInfo = document.querySelector('.weather-info');
const errorMessage = document.querySelector('.error-message');
const weatherIcon = document.querySelector('.weather-icon');
const temperatureElement = document.querySelector('.temperature');
const descriptionElement = document.querySelector('.description');
const locationElement = document.querySelector('.location');
const loadingSpinner = document.querySelector('.loading-spinner');
const apiKey = '82005d27a116c2880c8f0fcb866998a0';


const weatherIcons = {
    Clear: '01d.png',
    Clouds: '04d.png',
    Rain: '09d.png',
    Drizzle: '10d.png',
    Thunderstorm: '11d.png',
    Snow: '13d.png',
    Mist: '50d.png',
    Smoke: '10n.png',
    Haze: '02d.png',
    Fog: '09n.png',
    Sand: '02n.png',
    Ash: '03d.png',
    Squall: 'unknown.png',
};

function WeatherDetails() {
    const weatherDetailsContainer = document.querySelector('.weather-details');

    const details = [
        { icon: 'fa-solid fa-wind', label: 'Wind Speed', value: '--' },
        { icon: 'icons/icons8-humidity-48.png', label: 'Humidity', value: '--', isImage: true },
        { icon: 'icons/hot.png', label: 'Feels Like', value: '--', isImage: true },
        { icon: 'icons/pressure.png', label: 'Pressure', value: '--', isImage: true },
    ];

    const valueContainers = {};

    details.forEach(detail => {
        const detailContainer = document.createElement('div');
        detailContainer.classList.add('weather-detail');

        const iconContainer = document.createElement('div');
        iconContainer.classList.add('detail-icon');

        if (detail.isImage) {
            const iconImage = document.createElement('img');
            iconImage.src = detail.icon;
            iconImage.alt = detail.label;
            iconContainer.appendChild(iconImage);
        } else {
            const iconElement = document.createElement('i');
            iconElement.className = detail.icon;
            iconContainer.appendChild(iconElement);
        }

        const valueContainer = document.createElement('div');
        valueContainer.classList.add('detail-value');
        valueContainer.textContent = detail.value;

        const labelContainer = document.createElement('div');
        labelContainer.classList.add('detail-label');
        labelContainer.textContent = detail.label;

        detailContainer.appendChild(iconContainer);
        detailContainer.appendChild(valueContainer);
        detailContainer.appendChild(labelContainer);

        weatherDetailsContainer.appendChild(detailContainer);

        valueContainers[detail.label.toLowerCase().replace(' ', '')] = valueContainer;
    });

    return valueContainers;
}

const detailValueElements = WeatherDetails();


function displayWeatherData(data) {
    errorMessage.style.display = 'none';
    weatherInfo.style.display = 'block';
    temperatureElement.textContent = `${Math.round(data.main.temp)}°c`;
    descriptionElement.textContent = data.weather[0].description;
    locationElement.textContent = `${data.name}, ${data.sys.country}`;

    detailValueElements.windspeed.textContent = `${data.wind.speed} m/s`;
    detailValueElements.humidity.textContent = `${data.main.humidity}%`;
    detailValueElements.feelslike.textContent = `${Math.round(data.main.feels_like)}°C`;
    detailValueElements.pressure.textContent = `${data.main.pressure} hPa`;
   
    const weatherCondition = data.weather[0].main;
    const iconFilename = weatherIcons[weatherCondition] || 'default.png';
    weatherIcon.src = `icons/${iconFilename}`;
    weatherIcon.alt = weatherCondition;

    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const now = new Date();


    if (now >= sunrise && now <= sunset) {
        document.body.style.backgroundImage = "url('https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHN1bnJpc2V8ZW58MHx8MHx8fDA%3D')";
        document.body.style.backgroundSize = "cover";
    } else {
        document.body.style.backgroundImage = "url('https://media.istockphoto.com/id/162515751/photo/moon-over-mountains.webp?a=1&b=1&s=612x612&w=0&k=20&c=Xp_CfaVfyn9yJvTZtXzRBdIABemq-dztHBUZ5ZYmqtU=')";
        document.body.style.backgroundSize = "cover";
    }
}

searchButton.addEventListener('click', function () {
    const city = searchInput.value;

    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';

    if (city.trim() === '') {
        errorMessage.textContent = ' Enter a city name.';
        errorMessage.style.display = 'block';
        return;
    }

    loadingSpinner.style.display = 'block';

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            loadingSpinner.style.display = 'none';
        })

        .catch((error) => {
            console.error('Error fetching weather data:', error);
            errorMessage.textContent = 'city not found.';
            errorMessage.style.display = 'block';
            loadingSpinner.style.display = 'none';
        });     
});


searchInput.addEventListener('keypress' , (e)=>{
    if(e.key==='Enter'){
        searchButton.click();
    }
})


function fetchWeatherByCoordinates(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })

        .then(data => {
            displayWeatherData(data);
        })
        .catch(error => {
            console.error('Error fetching weather data by coordinates:', error);
            errorMessage.textContent = 'Unable to fetch weather data. Please try again later.';
            errorMessage.style.display = 'block';
        });
}


function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log('Current position:', lat, lon);
            fetchWeatherByCoordinates(lat, lon);
        }, function (error) {
            console.error('Error getting geolocation:', error);
            errorMessage.textContent = 'Unable to retrieve your location. Please try again or enter a city Name.';
            errorMessage.style.display = 'block';
        });
    } else {
        errorMessage.textContent = 'Geolocation is not supported by this browser.';
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
    }
}


window.onload = function () {
    getCurrentLocationWeather();
};



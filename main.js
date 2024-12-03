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

const BASE_URL = `https://api.openweathermap.org`;

function weatherInformation() {
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


    function setupForecastModal() {
        const forecastButton = document.createElement('button');
        forecastButton.textContent = 'Forecast';
        forecastButton.classList.add('forecast-button');
        weatherDetailsContainer.appendChild(forecastButton);
        const forecastModal = document.querySelector('.forecast-modal');
        const modalBackdrop = document.querySelector('#modalBackdrop');

        if (forecastButton && forecastModal && modalBackdrop) {
            forecastButton.addEventListener('click', function () {
                errorMessage.style.display = 'none';
                loadingSpinner.style.display = 'block';

                const city = searchInput.value.trim();
                if (city) {
                    fetchHourlyForecast(city);
                } else {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            console.log('Current position:', lat, lon);

                            fetchHourlyForecastByCoordinates(lat, lon);
                        }, function (error) {
                            console.error('Error getting geolocation:', error);
                            errorMessage.textContent = 'Unable to retrieve your location. Please try again.';
                            errorMessage.style.display = 'block';
                        });
                    } else {
                        errorMessage.textContent = 'Geolocation is not supported by this browser.';
                        errorMessage.style.display = 'block';
                    }
                }

                loadingSpinner.style.display = 'none';  // Hide loading spinner after fetching
                forecastModal.style.display = 'block';  // Show forecast modal
                modalBackdrop.style.display = 'block';  // Show modal backdrop
            });

            modalBackdrop.addEventListener('click', function () {
                forecastModal.style.display = 'none';
                modalBackdrop.style.display = 'none';
            });
        }
    }


    setupForecastModal();
    return valueContainers;
}

const detailValueElements = weatherInformation();

function displayWeatherData(data) {
    errorMessage.style.display = 'none';
    weatherInfo.style.display = 'block';
    if (data.main && data.weather && data.weather[0]) {
        temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
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
        } else {
            document.body.style.backgroundImage = "url('https://media.istockphoto.com/id/162515751/photo/moon-over-mountains.webp?a=1&b=1&s=612x612&w=0&k=20&c=Xp_CfaVfyn9yJvTZtXzRBdIABemq-dztHBUZ5ZYmqtU=')";
        }
        document.body.style.backgroundSize = "cover";
    } else {
        console.error('Incomplete weather data:', data);
        errorMessage.textContent = 'Weather data is missing or incomplete.';
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
    }
}


searchButton.addEventListener('click', function () {
    const city = searchInput.value;

    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';

    loadingSpinner.style.display = 'block';
    if (city.trim() === '') {
        errorMessage.textContent = ' Enter a city name.';
        errorMessage.style.display = 'block';
        loadingSpinner.style.display = 'none';
        return;
    }

    loadingSpinner.style.display = 'block';
    fetchData('weather', city);

});

function fetchData(endPoint, city) {
    fetch(`${BASE_URL}/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`)

        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            console.log(data);
            loadingSpinner.style.display = 'none';
        })

        .catch((error) => {
            console.error('Error fetching weather data:', error);
            errorMessage.textContent = 'city not found.';
            errorMessage.style.display = 'block';
            loadingSpinner.style.display = 'none';
        });
}

function fetchHourlyForecast(city) {
    const url = `${BASE_URL}/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            errorMessage.textContent = 'Unable to fetch forecast data. Please try again later.';
            errorMessage.style.display = 'block';
        });
}

function fetchHourlyForecastByCoordinates(lat, lon) {
    const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data by coordinates:', error);
            errorMessage.textContent = 'Unable to fetch forecast data. Please try again later.';
            errorMessage.style.display = 'block';
        });
}

function displayHourlyForecast(data) {
    const forecastModal = document.getElementById('forecastModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const chartCanvas = document.getElementById('hourlyForecastChart');
    const tableBody = document.getElementById('forecastTableBody');

    tableBody.innerHTML = '';

    if (window.hourlyForecastChart && typeof window.hourlyForecastChart.destroy === 'function') {
        window.hourlyForecastChart.destroy();
        window.hourlyForecastChart = null;
    }

    // Check if the canvas element exists
    if (!chartCanvas) {
        console.error("Chart canvas element not found.");
        return;
    }


    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);  // Clear the canvas

    // Get the hourly data (next 8 hours)
    const hourlyData = data.list.slice(0, 8);
    const hourlyWindSpeeds = hourlyData.map(item => Math.round(item.wind.speed));
    const hourlyLabels = hourlyData.map(item => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit' });
    });

    const hourlyTemps = hourlyData.map(item => Math.round(item.main.temp));

    window.hourlyForecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourlyWindSpeeds,
            datasets: [{
                label: 'Temperature (°C)',
                data: hourlyTemps,
                borderColor: 'red',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
                pointRadius: 1,
                yAxisID: 'y',
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    position: 'bottom',
                    grid: {
                        drawOnChartArea: false,
                        drawTicks: true,
                    },
                    ticks: {
                        callback: function (index) {
                            return hourlyWindSpeeds[index] + ' m/s';
                        }
                    }
                },
                x1: {
                    position: 'top',
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            return hourlyLabels[index];
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 10,
                    max: 30,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        stepSize: 5,
                        callback: function (value) {
                            return value + ' °C';
                        },
                        color: 'red'
                    }
                },
            },
        },
    });

    // Prepare Table Data (Daily Forecast)
    const forecastDays = {};
    let dayCount = 0;

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        if (dayCount < 8 && !forecastDays[dayString]) {
            forecastDays[dayString] = {
                temp: Math.round(item.main.temp),
                icon: weatherIcons[item.weather[0].main] || 'default.png',
                description: item.weather[0].description || "No description available"
            };
            dayCount++;
        }
    });

    // Add forecast data to the table
    Object.keys(forecastDays).forEach(day => {
        const dayData = forecastDays[day];
        console.log(dayData);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day}</td>
            <td class="forecast-icon"><img src="icons/${dayData.icon}" alt="Weather icon" >${dayData.temp}°C</td>
            <td>${dayData.description}</td>
        `;
        tableBody.appendChild(row);
    });

    if (forecastModal && modalBackdrop) {
        forecastModal.style.display = 'block';
        modalBackdrop.style.display = 'block';
    } else {
        console.error("Modal or backdrop not found.");
    }

    modalBackdrop.addEventListener('click', () => {
        forecastModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
    });
}

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
})

function fetchWeatherByCoordinates(lat, lon) {
    fetch(`${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.main && data.weather && data.weather[0]) {
                displayWeatherData(data);
            } else {
                console.error('Weather data is missing or incomplete:', data);
                errorMessage.textContent = 'Weather data is missing or incomplete.';
                errorMessage.style.display = 'block';
                loadingSpinner.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching weather data by coordinates:', error);
            errorMessage.textContent = 'Unable to fetch weather data. Please try again later.';
            errorMessage.style.display = 'block';
            loadingSpinner.style.display = 'none';
        });
}


function getCoordinates() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log('Current position:', lat, lon);
                    resolve({ lat, lon });
                },
                error => {
                    console.error('Error getting geolocation:', error);
                    reject(new Error('Unable to retrieve your location. Please try again or enter a city name.'));
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

function getCurrentLocationWeather() {
    loadingSpinner.style.display = 'block';
    getCoordinates()
        .then(({ lat, lon }) => {
            fetchWeatherByCoordinates(lat, lon);
        })
        .catch(error => {
            console.error(error.message);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        })
        .finally(() => {
            loadingSpinner.style.display = 'none';
        });
}

window.onload = function () {
    getCurrentLocationWeather();
};




// Initialize Telegram WebApp
const webapp = window.Telegram.WebApp;
webapp.ready();

// Set theme
document.body.style.visibility = '';
webapp.expand();

// Get DOM elements
const lotteryNumberElement = document.getElementById('lotteryNumber');
const generateButton = document.getElementById('generateBtn');
const countdownElement = document.getElementById('countdown');

// Add countdown variable
let secondsLeft = 10;

// Function to generate random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate lottery number
function generateLotteryNumber() {
    const numbers = [];
    for (let i = 0; i < 6; i++) {
        let num = getRandomNumber(1, 49);
        // Ensure no duplicate numbers
        while (numbers.includes(num)) {
            num = getRandomNumber(1, 49);
        }
        numbers.push(num);
    }
    
    // Sort numbers and format them with leading zeros
    return numbers
        .sort((a, b) => a - b)
        .map(num => num.toString().padStart(2, '0'))
        .join('-');
}

// Function to update the countdown display
function updateCountdown() {
    countdownElement.textContent = `Next draw in: ${secondsLeft}s`;
}

// Function to update the display
function updateDisplay() {
    lotteryNumberElement.textContent = generateLotteryNumber();
    // Reset countdown
    secondsLeft = 10;
    updateCountdown();
}

// Set up countdown timer
setInterval(() => {
    secondsLeft--;
    if (secondsLeft < 0) {
        secondsLeft = 10;
    }
    updateCountdown();
}, 1000);

// Initial generation
updateDisplay();

// Set up automatic generation every 10 seconds
setInterval(updateDisplay, 10000);

// Manual generation when button is clicked
generateButton.addEventListener('click', updateDisplay); 
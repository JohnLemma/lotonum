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

// Add these variables at the top with other declarations
let userBalance = 0;
const balanceElement = document.getElementById('userBalance');
const depositBtn = document.getElementById('depositBtn');

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

// Add payment functionality
async function initializePayment(amount) {
    try {
        const response = await fetch('/api/initialize-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                amount,
                isDeposit: amount >= 100 // To differentiate between ticket purchase and deposit
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Payment error:', error);
        throw error;
    }
}

// Add deposit functionality
async function handleDeposit() {
    const depositAmount = 100; // Fixed deposit amount of 100 ETB
    try {
        const response = await initializePayment(depositAmount);
        if (response.status === 'success') {
            // The actual balance update should happen after payment verification
            window.location.href = response.data.checkout_url;
        }
    } catch (error) {
        console.error('Deposit error:', error);
        alert('Deposit failed');
    }
}

// Update balance display
function updateBalance(amount) {
    userBalance = amount;
    balanceElement.textContent = userBalance;
}

// Add event listener for deposit button
depositBtn.addEventListener('click', handleDeposit);

// Update the ticket purchase function
const buyButton = document.createElement('button');
buyButton.textContent = 'Buy Ticket (10 ETB)';
buyButton.className = 'buy-button';
buyButton.addEventListener('click', async () => {
    const ticketPrice = 10;
    if (userBalance >= ticketPrice) {
        updateBalance(userBalance - ticketPrice);
        // Generate new number...
        updateDisplay();
    } else {
        alert('Insufficient balance. Please deposit more funds.');
    }
});

// Add button to container
document.querySelector('.container').appendChild(buyButton); 
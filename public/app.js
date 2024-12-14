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
                'X-CHAPA-PK': 'CHAPUBK_TEST-XAOSeQNcSJ1yPu0Vkw0H8oKfAbMFD1g4'
            },
            body: JSON.stringify({ 
                amount: Number(amount),
                isDeposit: amount >= 20
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data.tx_ref) {
            // Store tx_ref before redirect
            localStorage.setItem('pending_tx_ref', data.data.tx_ref);
            console.log('Stored tx_ref:', data.data.tx_ref);
            window.location.href = data.data.checkout_url;
        } else {
            throw new Error(data.message || 'Payment initialization failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert(error.message || 'Payment initialization failed');
        throw error;
    }
}

// Update deposit functionality
async function handleDeposit() {
    try {
        await initializePayment(20);
    } catch (error) {
        console.error('Deposit error:', error);
        alert('Deposit failed: ' + (error.message || 'Unknown error'));
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

// Add this function to check payment status
async function checkPaymentStatus(tx_ref) {
    try {
        console.log('Checking payment status for tx_ref:', tx_ref); // Debug log
        const response = await fetch(`/api/verify-payment?tx_ref=${tx_ref}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update balance
            const newBalance = userBalance + Number(data.amount);
            updateBalance(newBalance);
            alert('Deposit successful! Your balance has been updated.');
        } else {
            console.error('Payment verification failed:', data);
            alert('Payment verification failed. Please try again.');
        }
    } catch (error) {
        console.error('Error checking payment:', error);
        alert('Error checking payment status');
    }
}

// Add this to check payment status when page loads
window.addEventListener('load', () => {
    const pendingTxRef = localStorage.getItem('pending_tx_ref');
    if (pendingTxRef) {
        checkPaymentStatus(pendingTxRef);
        localStorage.removeItem('pending_tx_ref');
    }
}); 
const express = require('express');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { CHAPA_SECRET_KEY, CHAPA_URL, CHAPA_HEADERS } = require('./config/chapa');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Payment initialization endpoint
app.post('/api/initialize-payment', async (req, res) => {
    try {
        const { amount, isDeposit } = req.body;
        const tx_ref = `tx-${uuidv4()}`;

        // Create the request payload
        const payload = {
            amount: amount.toString(),
            currency: 'ETB',
            tx_ref,
            callback_url: 'https://lotonum.onrender.com/api/verify-payment',
            return_url: 'https://lotonum.onrender.com/deposit-success',
            first_name: 'John',
            last_name: 'Lemma',
            email: 'yohanneslemma100@gmail.com',
            title: 'Lottery Deposit',
            description: 'Deposit to lottery wallet'
        };

        // Log the request details
        console.log('Chapa Request:', {
            url: CHAPA_URL,
            headers: CHAPA_HEADERS,
            payload
        });

        // Make the request to Chapa
        const response = await axios({
            method: 'POST',
            url: CHAPA_URL,
            headers: {
                'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            data: payload
        });

        // Log the response
        console.log('Chapa Response:', response.data);

        // Send back the response
        res.json(response.data);
    } catch (error) {
        // Log the full error
        console.error('Payment initialization error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
        });

        // Send back error details
        res.status(500).json({ 
            error: 'Payment initialization failed',
            details: error.response?.data || error.message
        });
    }
});

// Payment verification endpoint
app.get('/api/verify-payment', async (req, res) => {
    const { tx_ref } = req.query;
    
    if (!tx_ref) {
        return res.status(400).json({ 
            status: 'failed', 
            error: 'Transaction reference is required' 
        });
    }

    try {
        const response = await axios.get(
            `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            {
                headers: CHAPA_HEADERS
            }
        );

        if (response.data.status === 'success') {
            const amount = Number(response.data.data.amount);
            res.json({ 
                status: 'success',
                amount: amount
            });
        } else {
            res.json({ status: 'failed' });
        }
    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        res.status(500).json({ 
            status: 'failed', 
            error: 'Payment verification failed',
            details: error.response?.data || error.message
        });
    }
});

// Add a success route handler
app.get('/deposit-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
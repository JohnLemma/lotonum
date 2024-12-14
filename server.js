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

        const payload = {
            amount: amount.toString(),
            currency: 'ETB',
            tx_ref,
            callback_url: `${req.protocol}://${req.get('host')}/api/verify-payment`,
            return_url: `${req.protocol}://${req.get('host')}/${isDeposit ? 'deposit' : 'ticket'}-success`,
            first_name: 'John',
            last_name: 'Lemma',
            email: 'yohanneslemma100@gmail.com',
            title: isDeposit ? 'Wallet Deposit' : 'Lottery Ticket Purchase',
            description: isDeposit ? 'Deposit to wallet' : 'Lottery ticket purchase'
        };

        const response = await axios.post(
            CHAPA_URL,
            payload,
            { headers: CHAPA_HEADERS }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Payment initialization error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Payment initialization failed',
            details: error.response?.data || error.message
        });
    }
});

// Payment verification endpoint
app.get('/api/verify-payment', async (req, res) => {
    const { tx_ref } = req.query;
    try {
        const response = await axios.get(
            `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            {
                headers: {
                    'Authorization': `Bearer ${CHAPA_SECRET_KEY}`
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
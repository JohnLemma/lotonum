const express = require('express');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { CHAPA_SECRET_KEY, CHAPA_URL, CHAPA_HEADERS } = require('./config/chapa');
const { 
    TELEBIRR_APP_ID, 
    TELEBIRR_APP_KEY, 
    TELEBIRR_SHORT_CODE,
    TELEBIRR_PUBLIC_KEY,
    TELEBIRR_URL,
    TELEBIRR_BASE_URL
} = require('./config/telebirr');
const crypto = require('crypto');
const tools = require('./utils/tools');

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

// Add TeleBirr fabric token endpoint
app.post('/api/telebirr/token', async (req, res) => {
    try {
        const response = await axios.post(
            `${TELEBIRR_BASE_URL}/payment/v1/token`,
            {
                appSecret: config.appSecret,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-APP-Key': config.fabricAppId,
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Fabric token error:', error);
        res.status(500).json({ error: 'Failed to get fabric token' });
    }
});

// Add TeleBirr payment initialization endpoint
app.post('/api/telebirr/initialize', async (req, res) => {
    try {
        const { amount } = req.body;
        const timestamp = Date.now().toString();
        const outTradeNo = `TB-${timestamp}`;

        // Get fabric token
        const tokenResponse = await axios.post(
            `${config.baseUrl}/payment/v1/token`,
            {
                appSecret: config.appSecret,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-APP-Key': config.fabricAppId,
                }
            }
        );

        const fabricToken = tokenResponse.data.token;
        console.log('Fabric Token:', fabricToken);

        // Create order
        const payload = {
            timestamp: tools.createTimeStamp(),
            nonce_str: tools.createNonceStr(),
            method: "payment.preorder",
            version: "1.0",
            biz_content: {
                notify_url: "https://lotonum.onrender.com/api/telebirr/notify",
                trade_type: "InApp",
                appid: config.merchantAppId,
                merch_code: config.merchantCode,
                merch_order_id: outTradeNo,
                title: "Lottery Deposit",
                total_amount: amount.toString(),
                trans_currency: "ETB",
                timeout_express: "30m",
            }
        };

        console.log('Payload:', payload);

        const response = await axios.post(
            `${config.baseUrl}/payment/v1/merchant/preOrder`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-APP-Key': config.fabricAppId,
                    'Authorization': fabricToken
                }
            }
        );

        console.log('TeleBirr Response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('TeleBirr Error:', error.response?.data || error);
        res.status(500).json({ 
            error: 'TeleBirr payment failed',
            details: error.response?.data || error.message
        });
    }
});

// Add TeleBirr notification endpoint
app.post('/api/telebirr/notify', async (req, res) => {
    try {
        const notification = req.body;
        console.log('TeleBirr notification received:', notification);

        // Verify signature
        // TODO: Implement signature verification

        if (notification.trade_status === 'Completed') {
            // Update user balance
            // TODO: Implement balance update
            
            // Store transaction details
            // TODO: Implement transaction storage
        }

        res.status(200).json({ message: 'Notification processed' });
    } catch (error) {
        console.error('TeleBirr notification error:', error);
        res.status(500).json({ error: 'Failed to process notification' });
    }
});

// Add TeleBirr verification endpoint
app.get('/api/telebirr/verify', async (req, res) => {
    const { tx_ref } = req.query;
    
    if (!tx_ref) {
        return res.status(400).json({ 
            status: 'failed', 
            error: 'Transaction reference is required' 
        });
    }

    try {
        // Get fabric token first
        const tokenResponse = await axios.post(
            `${TELEBIRR_BASE_URL}/payment/v1/token`,
            {
                appSecret: config.appSecret,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-APP-Key': config.fabricAppId,
                }
            }
        );
        const fabricToken = tokenResponse.data.token;

        // Query transaction status
        const response = await axios.get(
            `${TELEBIRR_BASE_URL}/payment/v1/merchant/query`,
            {
                params: {
                    merch_order_id: tx_ref
                },
                headers: {
                    'Content-Type': 'application/json',
                    'X-APP-Key': config.fabricAppId,
                    'Authorization': fabricToken
                }
            }
        );

        if (response.data.trade_status === 'Completed') {
            res.json({ 
                status: 'success',
                amount: Number(response.data.total_amount)
            });
        } else {
            res.json({ status: 'failed' });
        }
    } catch (error) {
        console.error('TeleBirr verification error:', error.response?.data || error.message);
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
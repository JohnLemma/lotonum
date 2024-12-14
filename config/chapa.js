const CHAPA_PUBLIC_KEY = 'CHAPUBK_TEST-XAOSeQNcSJ1yPu0Vkw0H8oKfAbMFD1g4';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_URL = 'https://api.chapa.co/v1/transaction/initialize';
const CHAPA_ENCRYPTION_KEY = 'ocsCVDYz9jTc0vDsMP5FH1za';

const CHAPA_HEADERS = {
    'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json',
    'X-CHAPA-ENCRYPTION-KEY': CHAPA_ENCRYPTION_KEY
};

module.exports = {
    CHAPA_PUBLIC_KEY,
    CHAPA_SECRET_KEY,
    CHAPA_URL,
    CHAPA_HEADERS,
    CHAPA_ENCRYPTION_KEY
}; 
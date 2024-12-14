const CHAPA_SECRET_KEY = 'CHASECK_TEST-y6jP6iIZBDCHeflfP9fuOow6Zzu9IkIY';
const CHAPA_URL = 'https://api.chapa.co/v1/transaction/initialize';

const CHAPA_HEADERS = {
    'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json'
};

module.exports = {
    CHAPA_SECRET_KEY,
    CHAPA_URL,
    CHAPA_HEADERS
}; 
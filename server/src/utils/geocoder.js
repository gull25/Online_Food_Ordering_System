const axios = require('axios');

/**
 * Geocodes an address string using OpenStreetMap Nominatim
 * @param {string} address - Full address string
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
const geocodeAddress = async (address) => {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'Foodora-MERN-App (gulr8@example.com)'
            }
        });

        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return {
                lat: parseFloat(lat),
                lng: parseFloat(lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
};

module.exports = { geocodeAddress };

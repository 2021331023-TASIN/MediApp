const axios = require('axios'); // node_modules must be installed

const API_URL = 'http://localhost:5000/api';

async function testVitals() {
    try {
        const email = `test_vital_${Date.now()}@example.com`;
        const password = 'password123';
        const name = 'Vital Tester';

        console.log(`1. Registering user: ${email}`);
        const regRes = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        const token = regRes.data.token;
        console.log('   Registration successful. Token received.');

        console.log('2. Adding Vital...');
        const vitalData = { type: 'weight', value: '75', date: new Date().toISOString() };
        await axios.post(`${API_URL}/vitals`, vitalData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Vital Added.');

        console.log('3. Fetching Vitals...');
        const getRes = await axios.get(`${API_URL}/vitals`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Vitals fetched:', getRes.data);

        if (getRes.data.length > 0 && getRes.data[0].value === '75') {
            console.log('SUCCESS: Vital saved and retrieved!');
        } else {
            console.error('FAILURE: Vital not found in response.');
        }

        console.log('4. Testing Direct Route...');
        try {
            const directRes = await axios.post(`${API_URL}/vitals_test`, {});
            console.log('   Direct Route Response:', directRes.data);
        } catch (err) {
            console.error('   Direct Route Failed:', err.message);
        }

    } catch (error) {
        console.error('TEST FAILED:', error.response ? error.response.data : error.message);
    }
}

testVitals();

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
};

const apiService = {
    // Auth
    login: (credentials) => fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    }).then(handleResponse),

    register: (userData) => fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    }).then(handleResponse),

    // Prescriptions
    getPrescriptions: () => fetch(`${API_BASE_URL}/prescriptions`, {
        headers: getAuthHeader()
    }).then(handleResponse),

    addPrescription: (data) => fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
    }).then(handleResponse),

    deletePrescription: (id) => fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    }).then(handleResponse),

    getDashboardStats: () => fetch(`${API_BASE_URL}/prescriptions/stats`, {
        headers: getAuthHeader()
    }).then(handleResponse),

    getHistory: () => fetch(`${API_BASE_URL}/prescriptions/history`, {
        headers: getAuthHeader()
    }).then(handleResponse),

    getTodaySchedules: () => fetch(`${API_BASE_URL}/prescriptions/today`, {
        headers: getAuthHeader()
    }).then(handleResponse),

    markDoseTaken: (prescriptionId, scheduleTime) => fetch(`${API_BASE_URL}/prescriptions/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ prescriptionId, scheduleTime })
    }).then(handleResponse),

    // Vitals
    getVitals: () => fetch(`${API_BASE_URL}/vitals`, {
        headers: getAuthHeader()
    }).then(handleResponse),

    addVital: (vitalData) => fetch(`${API_BASE_URL}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(vitalData)
    }).then(handleResponse),

    // External APIs
    searchMedicine: (query) => fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=1`)
        .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Medicine not found');
            }
            return data;
        })
};


export default apiService;

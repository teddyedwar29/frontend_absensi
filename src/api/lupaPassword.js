import axios from "axios";

// Fungsi untuk request lupa password
export const lupaPassword = async (email) => {
    try {
        const response = await axios.post(
            "http://localhost:5000/forgot-password", // endpoint sesuai backend Flask kamu
            { email }
        );
        return response.data?.message || response.data;
    } catch (error) {
        throw error.response?.data?.message || error.response?.data || error;
    }
};

// Fungsi untuk request reset password (jika ada endpointnya)
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post(
            "http://localhost:5000/reset-password", // sesuaikan jika ada endpoint di backend
            { token: token,
              password: newPassword,}
        );
        return response.data?.message || response.data;
    } catch (error) {
        throw error.response?.data?.message || error.response?.data || error;
    }
}
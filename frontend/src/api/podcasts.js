import axios from 'axios';

const API_URL = process.env.SV_API_URL;

export const fetchPodcastData = async (params = {}) => {
    try {
        const response = await axios.get(API_URL, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Error fetching podcast data';
    }
}
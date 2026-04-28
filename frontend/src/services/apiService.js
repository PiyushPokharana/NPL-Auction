import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getPlayers = async () => {
  try {
    const response = await api.get('/players');
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

export const getAvailablePlayers = async () => {
  try {
    const response = await api.get('/players/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available players:', error);
    throw error;
  }
};

export const getTeams = async () => {
  try {
    const response = await api.get('/teams');
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export default {
  getPlayers,
  getAvailablePlayers,
  getTeams,
};

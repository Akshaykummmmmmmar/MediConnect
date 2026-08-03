import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export default instance;

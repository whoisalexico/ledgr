import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export default {
  login: async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

import axios from "axios"

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  params: {
    lng: localStorage.getItem("lang"),
  },
})

export default api

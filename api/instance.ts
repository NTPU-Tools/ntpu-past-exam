import { getCookie } from "@/utils/cookie";
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ORIGIN,
  headers: {
    "Content-Type": "application/json",
    timeout: 1000,
    authorization: `Bearer ${getCookie("ntpu-past-exam-access-token")}`,
  },
  withCredentials: true,
});

export default instance;

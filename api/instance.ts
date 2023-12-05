/* eslint-disable no-unused-vars */
import { getCookie } from "@/utils/cookie";
import axios, { AxiosRequestConfig } from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ORIGIN,
  headers: {
    "Content-Type": "application/json",
    timeout: 1000,
    authorization: `Bearer ${getCookie("ntpu-past-exam-access-token")}`,
  },
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response.data as any,
  (error) =>
    // Do something with response error
    Promise.reject(error),
);

declare module "axios" {
  export interface AxiosInstance {
    // request<T = any>(config: AxiosRequestConfig): Promise<T>;
    postForm<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<T>;
    putForm<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig,
    ): Promise<T>;

    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    // delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    // head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    // post<T = any>(
    //   url: string,
    //   data?: any,
    //   config?: AxiosRequestConfig,
    // ): Promise<T>;
    // put<T = any>(
    //   url: string,
    //   data?: any,
    //   config?: AxiosRequestConfig,
    // ): Promise<T>;
    // patch<T = any>(
    //   url: string,
    //   data?: any,
    //   config?: AxiosRequestConfig,
    // ): Promise<T>;
  }
}

export default instance;

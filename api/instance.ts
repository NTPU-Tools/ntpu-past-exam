/* eslint-disable no-unused-vars */
import { eraseCookie, getCookie, setCookie } from "@/utils/cookie";
import axios, { AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_ORIGIN;

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    timeout: 1000,
    authorization: `Bearer ${getCookie("ntpu-past-exam-access-token")}`,
  },
  // @ts-ignore
  isTokenRefreshing: false,
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response.data as any,
  (error) => {
    const exceptApiRouteArray = ["login", "verify-token"];
    if (
      !exceptApiRouteArray.some((route) =>
        error.response!.config.url!.includes(route),
      )
    ) {
      if (
        error.response.status === 401 &&
        error.response.data.detail === "Credentials Expired"
      ) {
        // @ts-ignore
        if (!instance.defaults.isTokenRefreshing) {
          // @ts-ignore
          instance.defaults.isTokenRefreshing = true;
          // Refresh token
          return axios
            .post(`${baseURL}/refresh`, undefined, {
              headers: {
                Authorization: `Bearer ${getCookie(
                  "ntpu-past-exam-refresh-token",
                )}`,
              },
            })
            .then(async (res) => {
              const { access_token } = res.data;
              setCookie("ntpu-past-exam-access-token", access_token, 30);
              instance.defaults.headers.Authorization = `Bearer ${access_token}`;
            })
            .catch(() => {
              // Logout when refresh token api is unauthorized
              eraseCookie("ntpu-past-exam-access-token");
              window.location.href = "/login";
            })
            .finally(() => {
              // @ts-ignore
              instance.defaults.isTokenRefreshing = false;
            });
        }
      }
    }

    return Promise.reject(error);
  },
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

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from 'axios'
import { ElMessage } from 'element-plus'

const axiosInstance: AxiosInstance = axios.create({
    timeout: 3000,
    // baseURL: "http://127.0.0.1:3000/",
})

axiosInstance.interceptors.request.use((config) => {
    return { ...config }
}, (error) => {
    return Promise.reject(error);
})
axiosInstance.interceptors.response.use((response) => {
    if (response?.config?.responseType === 'blob' || response?.config?.responseType === 'arraybuffer') {
        return response
    } else if (response.data.isSuccess) {
        return response.data.data
    } else {
        ElMessage.error(response.data.message)
    }
}, (error) => {
    return Promise.reject(error);
})

export interface RequestConfig<T = any> extends AxiosRequestConfig<T> {
}

export const request = (config: RequestConfig) => {
    return new Promise((resolve, reject) => {
        axiosInstance
            .request(config)
            .then((res) => {
                resolve(res)
            })
            .catch((err: any) => {
                reject(err)
            })
    })
}
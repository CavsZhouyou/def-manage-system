/*
 * @Author: zhouyou@werun
 * @Descriptions: axios 封装文件
 * @TodoList: 无
 * @Date: 2020-03-09 16:56:41
 * @Last Modified by: zhouyou@werun
 * @Last Modified time: 2020-03-09 19:27:39
 */
import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BaseResponse } from './types';

// 接口前缀
const BASE_URL: string =
  process.env.NODE_ENV === 'development'
    ? 'https://www.fastmock.site/mock/f42b77e2190835b914b35b55eed12bcf'
    : '';

// axios 配置实例
const getAxiosInstance = (): AxiosInstance => {
  const instance: AxiosInstance = Axios.create({
    baseURL: `${BASE_URL}`
  });
  instance.interceptors.request.use(config => ({
    ...config,
    params: {
      // 此处注意，你的`params`应该是个对象，不能是其他数据类型
      ...(config.params || {}),
      _: +new Date()
    }
  }));

  instance.interceptors.response.use(
    response => {
      if (response && response.data) {
        return Promise.resolve(response);
      } else {
        return Promise.reject('response 不存在');
      }
    },
    error => {
      console.log('-- error --');
      console.log(error);
      console.log('-- error --');
      return Promise.resolve({
        data: {
          success: false,
          msg: typeof error === 'string' ? error : error.message
        }
      });
    }
  );
  return instance;
};

// 基本 Ajax 格式
interface BaseAjax {
  get: <T>(url: string, config?: object) => Promise<BaseResponse<T>>;
  delete: <T>(url: string, config?: object) => Promise<BaseResponse<T>>;
  head: <T>(url: string, config?: object) => Promise<BaseResponse<T>>;
  options: <T>(url: string, config?: object) => Promise<BaseResponse<T>>;
  post: <T>(
    url: string,
    data?: object,
    config?: object
  ) => Promise<BaseResponse<T>>;
  put: <T>(
    url: string,
    data?: object,
    config?: object
  ) => Promise<BaseResponse<T>>;
  patch: <T>(
    url: string,
    data?: object,
    config?: object
  ) => Promise<BaseResponse<T>>;
}

// 获取一个 Ajax 实例
const GetAxios = (): BaseAjax => {
  const instance: AxiosInstance = getAxiosInstance();
  const request = <T>(config: AxiosRequestConfig): Promise<BaseResponse<T>> => {
    return new Promise((resolve, reject) => {
      instance.request<BaseResponse<T>>(config).then(data => {
        const __data = data.data;
        if (__data.success) {
          resolve(__data);
        } else {
          console.log(__data.message);
          reject(__data);
        }
      });
    });
  };

  // Ajax 实体
  const Ajax: BaseAjax = {
    get: function<T>(
      url: string,
      config: object = {}
    ): Promise<BaseResponse<T>> {
      return request<T>(
        Object.assign({}, config, {
          method: 'GET',
          url: url
        })
      );
    },
    delete: function<T>(
      url: string,
      config: object = {}
    ): Promise<BaseResponse<T>> {
      return request<T>(
        Object.assign({}, config, {
          method: 'DELETE',
          url: url
        })
      );
    },
    head: function<T>(
      url: string,
      config: object = {}
    ): Promise<BaseResponse<T>> {
      return request<T>(
        Object.assign({}, config, {
          method: 'HEAD',
          url: url
        })
      );
    },
    options: function<T>(
      url: string,
      config: object = {}
    ): Promise<BaseResponse<T>> {
      return request<T>(
        Object.assign({}, config, {
          method: 'OPTIONS',
          url: url
        })
      );
    },
    post: function<T>(
      url: string,
      data: object = {},
      config: object = {}
    ): Promise<BaseResponse<T>> {
      return request<T>(
        Object.assign({}, config, {
          method: 'POST',
          url: url,
          data: data
        })
      );
    },
    put: function<T>(
      url: string,
      data: object = {},
      config: object = {}
    ): Promise<BaseResponse<T>> {
      return request<T>(
        Object.assign({}, config, {
          method: 'PUT',
          url: url,
          data: data
        })
      );
    },
    patch: function<T>(
      url: string,
      data: object = {},
      config: object = {}
    ): Promise<BaseResponse<T>> {
      return request<T>(
        Object.assign({}, config, {
          method: 'PATCH',
          url: url,
          data: data
        })
      );
    }
  };

  return Ajax;
};

export default GetAxios();
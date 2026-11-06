import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { messageHolder as message } from '@/utils/message-holder';
import { tokenStorage } from '@/utils/token-storage';
import type { LoginResponse } from '@/utils/token-storage';

/**
 * HTTP请求配置
 *
 * <p>功能说明：</p>
 * <ul>
 *   <li>统一配置axios实例</li>
 *   <li>请求拦截：自动添加Token、处理加密</li>
 *   <li>响应拦截：统一处理响应数据、错误处理</li>
 *   <li>Token刷新：自动刷新过期Token</li>
 * </ul>
 *
 * @author birdger
 * @since 1.0.0
 */

// 扩展AxiosRequestConfig类型，添加自定义配置选项
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  // 是否跳过Token验证
  skipAuth?: boolean;
  // 是否跳过错误提示
  skipErrorToast?: boolean;
  // 是否显示加载动画
  showLoading?: boolean;
  // 下载模式：返回完整 AxiosResponse 以便读取 Content-Disposition 等响应头
  _download?: boolean;
}

/**
 * 创建axios实例
 *
 * <p>配置说明：</p>
 * <ul>
 *   <li>withCredentials: false - 不依赖Cookie自动携带</li>
 *   <li>Token通过Authorization Header传递（推荐方式）</li>
 *   <li>开发环境可以通过浏览器插件手动设置Cookie进行测试</li>
 * </ul>
 */
const request: AxiosInstance = axios.create({
  baseURL: '/api', // 使用代理路径，避免CORS问题
  timeout: 120000, // 2分钟，支持长耗时操作如文档导入
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json;charset=UTF-8',
  },
  withCredentials: false, // 不自动携带Cookie，使用Authorization Header
});

/**
 * 是否正在刷新Token
 */
let isRefreshing = false;

/**
 * 等待队列（Token刷新期间暂停的请求）
 */
let requests: Array<(token: string) => void> = [];

/**
 * 请求拦截器
 *
 * <p>主要功能：</p>
 * <ol>
 *   <li>自动添加Authorization Header</li>
 *   <li>添加CSRF Token</li>
 *   <li>添加请求追踪ID</li>
 *   <li>开发环境日志输出</li>
 * </ol>
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as CustomAxiosRequestConfig;

    // 如果不是跳过认证的请求，添加Token
    if (!customConfig.skipAuth) {
      const authHeader = tokenStorage.getAuthorizationHeader();

      // 调试日志：显示Token获取情况（默认关闭）
      if (import.meta.env.DEV && false) {  // 设置为false以关闭调试日志
        console.log('🔐 Token获取情况:');
        console.log('  - authHeader:', authHeader ? authHeader.substring(0, 50) + '...' : '无');
        console.log('  - Cookie:', document.cookie.split('; ').find(c => c.startsWith('access_token='))?.substring(0, 50) + '...' || '无');
      }

      if (authHeader && config.headers) {
        config.headers.Authorization = authHeader;
      } else if (import.meta.env.DEV) {
        console.warn('⚠️ Token未找到，请求可能失败');
      }
    }

    // 添加CSRF Token（如果存在）
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // 添加请求追踪ID（用于日志追踪）
    if (config.headers) {
      config.headers['X-Request-ID'] = generateRequestId();
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    // 开发环境下添加调试信息（默认关闭，减少控制台输出）
    if (import.meta.env.DEV && false) {  // 设置为false以关闭调试日志
      console.log('🔵 Request:', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
      console.log('🔵 Headers:', config.headers);
      console.log('🔵 Data:', config.data);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 *
 * <p>主要功能：</p>
 * <ol>
 *   <li>统一处理响应数据结构</li>
 *   <li>处理业务错误码</li>
 *   <li>自动刷新Token</li>
 *   <li>统一错误处理</li>
 * </ol>
 */
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, config } = response;
    const customConfig = config as CustomAxiosRequestConfig;

    // 下载请求：直接返回完整的 AxiosResponse，以便读取 Content-Disposition 等响应头
    if (customConfig._download) {
      return response;
    }

    // 开发环境下添加调试信息（默认关闭，减少控制台输出）
    if (import.meta.env.DEV && false) {  // 设置为false以关闭调试日志
      console.log('🟢 Response:', response.config.method?.toUpperCase(), response.config.url);
      console.log('🟢 Status:', response.status);
      console.log('🟢 Data:', data);
    }

    // 根据后端响应结构处理
    // 后端统一返回格式：{ code, message, data, timestamp }
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200) {
        // 成功响应，返回data字段
        return data.data;
      }

      // 401未授权：清除Token并跳转登录页
      if (data.code === 401) {
        if (!customConfig.skipAuth) {
          handleUnauthorized();
        }
        return Promise.reject(new Error(data.message || '未授权，请重新登录'));
      }

      // 其他业务错误
      const errorMessage = data.message || '请求失败';
      if (!customConfig.skipErrorToast) {
        message.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }

    // 非标准响应格式，直接返回
    return data;
  },
  (error: AxiosError) => {
    const { config, response } = error;
    const customConfig = config as CustomAxiosRequestConfig;

    // 开发环境下添加调试信息（默认关闭，减少控制台输出）
    if (import.meta.env.DEV && false) {  // 设置为false以关闭调试日志
      console.error('🔴 Response Error:', error);
      console.error('🔴 Config:', error.config);
      console.error('🔴 Response:', error.response);
    }

    // 处理401未授权错误
    if (response?.status === 401) {
      // 如果不是跳过认证的请求，尝试刷新Token
      if (!customConfig?.skipAuth && !isRefreshing) {
        // Token过期或无效
        return handleTokenExpired(error);
      } else {
        // 跳过认证或正在刷新，直接跳转登录
        handleUnauthorized();
        return Promise.reject(new Error('未授权，请重新登录'));
      }
    }

    // 处理其他错误
    return handleRequestError(error, customConfig);
  }
);

/**
 * 处理Token过期
 *
 * @param error 原始错误
 * @returns Promise
 */
function handleTokenExpired(error: AxiosError): Promise<any> {
  // 如果正在刷新Token，将请求加入等待队列
  if (isRefreshing) {
    return new Promise((resolve) => {
      requests.push((token: string) => {
        const originalRequest = error.config;
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        resolve(request(originalRequest!));
      });
    });
  }

  isRefreshing = true;

  // 尝试刷新Token
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    // 没有刷新Token，直接跳转登录
    handleUnauthorized();
    isRefreshing = false;
    return Promise.reject(new Error('未授权，请重新登录'));
  }

  // 调用刷新Token接口
  return request
    .post<LoginResponse>('/auth/auth/refresh', null, {
      params: { refreshToken },
      skipAuth: true, // 刷新时不使用旧Token
    })
    .then((newTokenInfo) => {
      // 保存新Token
      tokenStorage.saveToken(newTokenInfo);

      // 执行等待队列中的请求
      requests.forEach((callback) => callback(newTokenInfo.accessToken));
      requests = [];

      // 重试当前请求
      const originalRequest = error.config;
      if (originalRequest?.headers) {
        originalRequest.headers.Authorization = `Bearer ${newTokenInfo.accessToken}`;
      }
      return request(originalRequest!);
    })
    .catch((refreshError) => {
      // 刷新失败，清除Token并跳转登录
      tokenStorage.clearToken();
      handleUnauthorized();
      return Promise.reject(new Error('Token刷新失败，请重新登录'));
    })
    .finally(() => {
      isRefreshing = false;
    });
}

/**
 * 处理未授权错误
 */
function handleUnauthorized(): void {
  // 清除Token
  tokenStorage.clearToken();

  // 清除用户信息及zustand持久化数据
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage');

  // 显示提示
  message.warning('登录已过期，请重新登录');

  // 延迟跳转，避免阻塞
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}

/**
 * 处理禁止访问错误（403）
 * 当接口返回403时，表示已登录但权限不足，不清除Token，不跳转登录页
 */
function handleForbidden(): void {
  // 显示提示
  message.error('权限不足，无法访问该资源');
}

/**
 * 处理请求错误
 *
 * @param error Axios错误对象
 * @param customConfig 自定义配置
 * @returns Promise
 */
function handleRequestError(
  error: AxiosError,
  customConfig: CustomAxiosRequestConfig
): Promise<any> {
  let errorMessage = '请求失败';

  if (error.response) {
    const { status, data, config } = error.response;
    const requestUrl = config?.url || '';

    switch (status) {
      case 400:
        errorMessage = (data as any)?.message || '请求参数错误';
        break;
      case 403:
        errorMessage = (data as any)?.message || '权限不足，无法访问';
        break;
      case 404:
        errorMessage = '请求资源不存在';
        break;
      case 500:
        errorMessage = '服务器错误，请稍后重试';
        break;
      case 502:
        errorMessage = '网关错误，请稍后重试';
        break;
      case 503:
        errorMessage = '服务暂时不可用，请稍后重试';
        break;
      default:
        errorMessage = (data as any)?.message || `请求失败 (${status})`;
    }
  } else if (error.request) {
    // 请求已发送但没有收到响应
    errorMessage = '网络错误，请检查网络连接';
  } else {
    // 请求配置错误
    errorMessage = error.message || '请求配置错误';
  }

  // 显示错误提示
  if (!customConfig?.skipErrorToast) {
    message.error(errorMessage);
  }

  return Promise.reject(new Error(errorMessage));
}

/**
 * 生成请求追踪ID
 *
 * @returns 追踪ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 封装常用请求方法
 */
export const http = {
  get: <T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T> => {
    return request.get(url, config);
  },

  post: <T = any>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig
  ): Promise<T> => {
    return request.post(url, data, config);
  },

  put: <T = any>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig
  ): Promise<T> => {
    return request.put(url, data, config);
  },

  delete: <T = any>(url: string, config?: CustomAxiosRequestConfig): Promise<T> => {
    return request.delete(url, config);
  },

  patch: <T = any>(
    url: string,
    data?: any,
    config?: CustomAxiosRequestConfig
  ): Promise<T> => {
    return request.patch(url, data, config);
  },

  /**
   * 表单提交（用于文件上传等）
   */
  postForm: <T = any>(url: string, data: FormData): Promise<T> => {
    return request.post(url, data, {
      headers: {
        // 不手动设置Content-Type，让浏览器自动设置（包括boundary）
        'Content-Type': undefined,
      },
    });
  },

  /**
   * 下载文件
   */
  download: (url: string, filename?: string): Promise<void> => {
    return request.get(url, {
      responseType: 'blob',
      _download: true,
    } as any).then((response: AxiosResponse) => {
      // 尝试从 Content-Disposition 响应头中提取文件名
      let finalFilename = filename || 'download.pdf';
      const contentDisposition = response.headers?.['content-disposition'];
      if (contentDisposition) {
        // 优先匹配 filename*=UTF-8''xxx 格式（RFC 5987）
        const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^"';]+)/);
        if (rfc5987Match) {
          try {
            finalFilename = decodeURIComponent(rfc5987Match[1]);
          } catch (e) {
            finalFilename = rfc5987Match[1];
          }
        } else {
          // 回退匹配 filename="xxx" 格式
          const standardMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (standardMatch) {
            finalFilename = standardMatch[1];
          }
        }
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  },

  /**
   * POST方式下载文件（用于批量导出等场景）
   */
  downloadPost: (url: string, data: any, filename?: string): Promise<void> => {
    return request.post(url, data, {
      responseType: 'blob',
    } as any).then((response: AxiosResponse) => {
      let finalFilename = filename || 'export.zip';
      const contentDisposition = response.headers?.['content-disposition'];
      if (contentDisposition) {
        const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^"';]+)/);
        if (rfc5987Match) {
          try {
            finalFilename = decodeURIComponent(rfc5987Match[1]);
          } catch (e) {
            finalFilename = rfc5987Match[1];
          }
        } else {
          const standardMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (standardMatch) {
            finalFilename = standardMatch[1];
          }
        }
      }

      const blob = new Blob([response.data], { type: 'application/zip' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  },
};

export default request;

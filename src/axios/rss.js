import axios from 'axios'
import store from '@/store'
import errorCode from '@/locales/errorCode'
const locale= (localStorage.getItem('locale') ||
  'en')
const errorText = errorCode[locale]

const formatError = (code) => {
  let res = ''
  try {
    // @ts-ignore
    res = errorText[code]
  } catch (e) {
    // @ts-ignore
    res = errorText.other
  }
  return res
}
const instance = axios.create({
  baseURL: (axios.defaults.baseURL =
    process.env.NODE_ENV === 'local' ? '' : process.env.VUE_APP_WEB_URL),
  timeout: 5000,
  headers: { 'Content-Type': 'multipart/form-data' },
})
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

// Response interceptors
instance.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 0) {
      // rss
      return response.data
    }
    if (res.code !== 0) {
      Promise.reject(response)
    }
  },
  async (error) => {
    if (error.message.includes('timeout')) {
      store.dispatch('Message', {
        isShow: true,
        msg: formatError('timeout'),
        type: 'warning',
      })
    } else {
      store.dispatch('Message', {
        isShow: true,
        msg: formatError('other'),
        type: 'warning',
      })
    }
    return Promise.reject(error)
  }
)

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params) {
  return new Promise((resolve, reject) => {
    instance
      .post(url, params)
      .then((res) => {
        // @ts-ignore
        if (res.code !== 0) {
          reject(res)
          return
        }
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
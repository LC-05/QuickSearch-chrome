import axios from 'axios'
import qs from 'qs' // 引入qs模块，用来序列化post类型的数据
// axios.defaults.baseURL = 'https://api.apiopen.top';
axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// axios.defaults.withCredentials=true
// axios.defaults.crossDomain=true
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // config.data = qs.stringify(config.data);
    config.headers = {
        'Content-Type':'application/x-www-form-urlencoded'
    };
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
  }, function (err) {
    // 对响应错误做点什么
    if (err && err.response) {
        switch (err.response.status) {
          case 400:
              console.log('错误请求')
            break;
          case 401:
              console.log('未授权，请重新登录')
            break;
          case 403:
            console.log('拒绝访问')
            break;
          case 404:
            console.log('请求错误,未找到该资源')
            break;
          case 405:
            console.log('请求方法未允许')
            break;
          case 408:
            console.log('请求超时')
            break;
          case 500:
            console.log('服务器端出错')
            break;
          case 501:
            console.log('网络未实现')
            break;
          case 502:
            console.log('网络错误')
            break;
          case 503:
            console.log('服务不可用')
            break;
          case 504:
            console.log('网络超时')
            break;
          case 505:
            console.log('http版本不支持该请求')
            break;
          default:
            console.log(`连接错误${err.response.status}`)
        }
      } else {
        console.log(err)
      }
    return Promise.reject(error);
  });
    //封装JSONP
    axios.jsonp = (url,callback) => {
        if(!url){
            console.error('Axios.JSONP 至少需要一个url参数!')
            return;
        }
        return new Promise((resolve,reject) => {
            window.jsonCallBack =(result) => {
              resolve(result)
            }
            var JSONP=document.createElement("script");
            JSONP.type="text/javascript";
            JSONP.src=`${url}&${callback}=jsonCallBack`;
            document.getElementsByTagName("head")[0].appendChild(JSONP);
            setTimeout(() => {
                document.getElementsByTagName("head")[0].removeChild(JSONP)
            },500)
        })
    }
    //封装get
    function get(url, params){  
        return new Promise((resolve, reject) =>{    
            axios.get(url, {            
                params: params    
            }).then(res => {
                resolve(res.data);
            }).catch(err =>{
                reject(err.data)        
        })    
    });}
    function post(url, params) {
        return new Promise((resolve, reject) => {
            axios.post(url, qs.stringify(params))
            .then(res => {
                resolve(res.data);
            })
            .catch(err =>{
                reject(err.data)
            })
        });
}
export default {axios,get,post}
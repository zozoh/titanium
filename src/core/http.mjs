//-----------------------------------
const RESP_TRANS = {
  arraybuffer(resp){
    throw "No implement yet!"
  },
  blob(resp){
    throw "No implement yet!"
  },
  document(resp){
    throw "No implement yet!"
  },
  xml(resp){
    throw "No implement yet!"
  },
  json(resp){
    return JSON.parse(resp.data)
  },
  text(resp){
    return resp.data
  }
}
//-----------------------------------
export const TiHttp = {
  async send(url, {
            method="get", 
            params,
            headers,
            as="text"}={}) {
    let resp = await axios({
      url, method,
      params, 
      headers,
      transformResponse : undefined
    })
    let fn =  RESP_TRANS[as]
    return fn(resp)
  },
  /***
   * Send HTTP GET
   */
  async get(url, config={}){
    return TiHttp.send(url, _.assign({}, config, {method:"get"}))
  },
  /***
   * Send HTTP post
   */
  async post(url, {params, headers}={}){
    return TiHttp.send(url, _.assign({}, config, {method:"post"}))
  }
}
//-----------------------------------
export default TiHttp

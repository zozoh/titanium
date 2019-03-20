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
  json(content){
    return JSON.parse(content)
  },
  text(content){
    return content
  }
}
//-----------------------------------
function ProcessResponseData($req, {as="text"}={}) {
  return Ti.InvokeBy(RESP_TRANS, as, [$req.responseText])
}
//-----------------------------------
export const TiHttp = {
  send(url, options={}) {
    // let resp = await axios({
    //   url, method,
    //   params, 
    //   headers,
    //   transformResponse : undefined
    // })
    if(Ti.IsInfo("TiHttp")) {
      console.log("TiHttp.send", url, options)
    }
    let {
      method="GET", 
      params={},
      headers={},
      readyStateChanged=_.identity
    } = options
    // normalize method
    method = _.upperCase(method)

    // Default header for POST
    let {urlToSend, sendData} = Ti.Invoke(({
      "GET" : ()=>{
        let sendData = TiHttp.encodeFormData(params)
        return {
          urlToSend : sendData 
                        ? (url + '?' + sendData) 
                        : url
        }
      },
      "POST" : ()=>{
        _.defaults(headers, {
          "Content-type": "application/x-www-form-urlencoded"
        })
        return {
          urlToSend : url,
          sendData  : TiHttp.encodeFormData(params)
        }
      }
    })[method]) || {urlToSend : url}
    
    // Prepare the Request Object
    let $req = new XMLHttpRequest()

    // Process sending
    return new Promise((resolve, reject)=>{
      // callback
      $req.onreadystatechange = ()=>{
        readyStateChanged($req, options)
        // Done
        if(4 == $req.readyState) {
          if(200 == $req.status) {
            resolve($req)
          } else {
            reject($req)
          }
        }
      }
      // Open connection
      $req.open(method, urlToSend)
      // Set headers
      _.forOwn(headers, (val, key)=>{
        $req.setRequestHeader(key, val)
      })
      // Send data
      $req.send(sendData)
    })
  },
  /***
   * @param options.method{String}="GET"
   * @param options.params{Object}={}
   * @param options.headers{Object}={}
   * @param options.readyStateChanged{Function}=_.identity
   * @param options.as{String}="text"
   */
  sendAndProcess(url, options={}) {
    return TiHttp.send(url, options)
      .then(($req)=>{
        return ProcessResponseData($req, options)
      })
  },
  /***
   * Send HTTP GET
   */
  get(url, options={}){
    return TiHttp.sendAndProcess(
      url, 
      _.assign({}, options, {
        method:"GET"
      }))
  },
  /***
   * Send HTTP post
   */
  post(url, options={}){
    return TiHttp.sendAndProcess(
      url, 
      _.assign({}, options, {
        method: "POST"
      }))
  },
  /***
   * encode form data
   */
  encodeFormData(params={}) {
    let list = []
    _.forOwn(params, (val, key)=>{
      list.push(`${key}=${encodeURIComponent(val)}`)
    })
    return list.join("&")
  }
}
//-----------------------------------
export default TiHttp

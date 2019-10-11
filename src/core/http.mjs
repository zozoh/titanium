//-----------------------------------
const RESP_TRANS = {
  arraybuffer($req){
    throw "No implement yet!"
  },
  blob($req){
    throw "No implement yet!"
  },
  document($req){
    throw "No implement yet!"
  },
  xml($req){
    throw "No implement yet!"
  },
  json($req){
    let content = $req.responseText
    let str = _.trim(content) || null
    try {
      return JSON.parse(str)
    }catch(E) {
      console.warn("fail to JSON.parse", str)
      throw E
    }
  },
  jsonOrText($req){
    let content = $req.responseText
    try{
      let str = _.trim(content) || null
      return JSON.parse(str)
    }catch(E){}
    return content
  },
  text($req){
    return $req.responseText
  }
}
//-----------------------------------
function ProcessResponseData($req, {as="text"}={}) {
  return Ti.InvokeBy(RESP_TRANS, as, [$req])
}
//-----------------------------------
export const TiHttp = {
  send(url, options={}) {
    if(Ti.IsInfo("TiHttp")) {
      console.log("TiHttp.send", url, options)
    }
    let {
      method="GET", 
      params={},
      body=null,    // POST BODY, then params -> query string
      file=null,
      headers={},
      progress=_.identity,
      created=_.identity,
      beforeSend=_.identity,
      finished=_.identity,
      readyStateChanged=_.identity
    } = options
    // normalize method
    method = _.upperCase(method)

    // Add the default header to identify the TiHttpClient
    _.defaults(headers, {
      "x-requested-with": "XMLHttpRequest"
    })

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
          "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
        })
        // Upload file, encode the params to query string
        if(file) {
          return {
            urlToSend : [url,TiHttp.encodeFormData(params)].join("?"),
            sendData  : file
          }
        } 
        // if declare body, the params -> query string
        // you can send XML/JSON by this branch
        else if(body) {
          return {
            urlToSend : [url,TiHttp.encodeFormData(params)].join("?"),
            sendData  : body
          }
        }
        // Normal form upload
        else {
          return {
            urlToSend : url,
            sendData  : TiHttp.encodeFormData(params)
          }
        }
      }
    })[method]) || {urlToSend : url}
    
    // Prepare the Request Object
    let $req = new XMLHttpRequest()

    // Check upload file supporting
    if(file) {
      if(!$req.upload) {
        throw Ti.Err.make("e.ti.http.upload.NoSupported")
      }
      $req.upload.addEventListener("progress", progress)
    }

    // Hooking
    created($req)

    // Process sending
    return new Promise((resolve, reject)=>{
      // callback
      $req.onreadystatechange = ()=>{
        readyStateChanged($req, options)
        // Done
        if(4 == $req.readyState) {
          // Hooking
          finished($req)
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
      // Hooking
      beforeSend($req)
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
      let str = Ti.Types.toStr(val)
      list.push(`${key}=${encodeURIComponent(str)}`)
    })
    return list.join("&")
  }
}
//-----------------------------------
export default TiHttp

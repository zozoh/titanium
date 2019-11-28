/////////////////////////////////////
export const TiWebSocket = {
  //---------------------------------
  /***
   * @param watchTo{Object} : The watch target like:
   *  `{method:"watch", user:"site0", match:{id:"45he..7r3b"}}`
   * @param watched{Function} : Avaliable when valid `watchTo`, 
   * callback after watched, the arguments like `(event="xxx", data={})`
   * @param received{Function} : Avaliable when valid `watchTo`, 
   * callback after data received, the arguments like `(event="xxx", data={})`
   * @param closed{Function} : callback for socket closed.
   * @param error{Function} : callback for socket error raised
   */
  listenRemote({
    watchTo = null,
    watched  = _.identity,
    received = _.identity,
    closed   = _.identity,
    error    = _.identity
  }={}) {
    //...............................
    // Get System Config
    let host = window.location.hostname
    let port = window.location.port
    let schm = ({"http:":"ws","https:":"wss"})[window.location.protocol]
    let hostAndPort = [host]
    if(port > 80) {
      hostAndPort.push(port)
    }
    //...............................
    // Prepare the URL
    var wsUrl = `${schm}://${hostAndPort.join(":")}/websocket`
    //...............................
    // Then Open websocket to watch
    var ws = new WebSocket(wsUrl);
    //...............................
    // Watch Message from remote (walnut)
    if(_.isPlainObject(watchTo)) {
      ws.onmessage = function(wse){
        var wsObj = JSON.parse(wse.data);

        // Hi
        if("hi" == wsObj.event) {
          let json = JSON.stringify(watchTo)
          this.send(json);
        }
        // watched
        else if("watched" == wsObj.event) {
          watched(wsObj)
        }
        // received
        else {
          received(wsObj)
        }

      }
    }
    //...............................
    ws.onclose = closed
    //...............................
    ws.onerror = error
    //...............................
    // return the object
    return ws
  }
  //---------------------------------
}
/////////////////////////////////////
export default TiWebSocket

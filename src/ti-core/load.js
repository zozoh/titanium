(function(){
///////////////////////
var loading = {
  script(url) {

  },
  css(url) {

  },
  json(url) {
    return new Promise((resolve, reject)=>{
      loading.text(url)
        .then(str => {
          let json = ti.json.from(str)
          resolve(json)
        })
        .catch(err => reject(err))
    });
  },
  text(url) {
    return new Promise((resolve, reject)=>{
      axios.get(url)
        .then(resp => {
          resolve(resp.data)
        })
        .catch(err => reject(err))
    })
  }
}
//.....................
ti.ns('ti.load', function(url, {mode="auto"}) {
  // auto mode
  if("auto" == mode) {
    mode = /^.+\.js$/.test(url)
            ? "script"
            : (/^.+\.css$/.test(url)
                ? "css"
                : (/^.+\.json$/.test(url)
                  ? "json"
                  : "text"))
  }

  // invoke
  return loading[mode](url)
})
///////////////////////
})();

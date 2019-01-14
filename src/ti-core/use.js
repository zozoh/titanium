(function(){
///////////////////////
const loading = {
  script(url) {
    return new Promise((resolve, reject)=>{
      let $script = ti.dom.find(`script[src="${url}"]`)
      if($script) {
        resolve($script)
      } else {
        $script = ti.dom.createElement({
          tagName : "script",
          prop : {
            charset : "stylesheet",
            type    : "text/javascript",
            src     : url,
            async   : true
          }
        })
        $script.addEventListener("load", function(event){
          resolve($script)
        }, {once:true})
        $script.addEventListener("error", function(event){
          reject(event)
        }, {once:true})
        ti.dom.appendToHead($script)
      }
    })  // ~ Promise
  },
  css(url) {
    return new Promise((resolve, reject)=>{
      let $link = ti.dom.find(`link[href="${url}"]`)
      if($link) {
        resolve($link)
      } else {
        $link = ti.dom.createElement({
          tagName : "link",
          prop : {
            rel : "stylesheet",
            type : "text/css",
            href : url
          }
        })
        $link.addEventListener("load", function(event){
          resolve($link)
        }, {once:true})
        $link.addEventListener("error", function(event){
          reject(event)
        }, {once:true})
        ti.dom.appendToHead($link)
      }
    })  // ~ Promise
  },
  json(url) {
    return new Promise((resolve, reject)=>{
      loading.text(url)
        .then(json => {
          let obj = _.isString(json)
                      ? JSON.parse(json)
                      : json
          resolve(obj)
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
ti.ns('ti.use', function(url, {mode}={mode:"auto"}) {
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

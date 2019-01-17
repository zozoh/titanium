import {ti} from "./ti.mjs"
import {importModule} from "./__dynamic-import-polyfill.mjs"
//---------------------------------------
const loading = {
  // normal js lib
  js(url) {
    return new Promise((resolve, reject)=>{
      console.log("Hasdfaadsfadsfadsfasd")
      let $script = ti.dom.find(`script[src="${url}"]`)
      if($script) {
        _.defer(resolve, $script)
      } else {
        $script = ti.dom.createElement({
          tagName : "script",
          props : {
            charset : "stylesheet",
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
  // official js module
  mjs(url) {
    // FF done suppor the import() yet by default 
    // return import(url).then(m => m.default)
    // use the polyfill method instead
    return importModule(url).then(m=>m.default)
  },
  // css file
  css(url) {
    return new Promise((resolve, reject)=>{
      let $link = ti.dom.find(`link[href="${url}"]`)
      if($link) {
        _.defer(resolve, $link)
      } else {
        $link = ti.dom.createElement({
          tagName : "link",
          props : {
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
  // json object
  json(url) {
    return loading.text(url)
        .then(json => {
          return _.isString(json)
                      ? JSON.parse(json)
                      : json
        })
  },
  // pure text
  text(url) {
    return axios.get(url, {
        // zozoh@2019-01-18: Avaoid bug of: axios/axios#907
        //responseType : "text",
        transformResponse : undefined
      }).then(resp => resp.data)
  }
}
//---------------------------------------
export const TiUse = function(url=[], {dynamicPrefix}={}) {
  // dynamic url 
  if(_.isFunction(url)) {
    let u2 = url();
    return TiUse(u2, {dynamicPrefix})
  }
  // multi urls
  if(_.isArray(url)) {
    let ps = []
    let result = []
    url.forEach((s, index)=>{
      ps.push(
        TiUse(s, {dynamicPrefix})
          .then(re => result[index] = re)
      )
    })
    return Promise.all(ps).then(()=>result)
  }

  // Must be a String
  if(!_.isString(url)) {
    throw ti.err.make("e.ti.use.url_must_string", url)
  }

  // url prefix indicate the type
  let type, m = /^(!(m?js|json|css|text):)?(.+)$/.exec(url)
  if(m) {
    type = m[2]
    url  = m[3]
  }

  // apply url prefix & alias
  url = ti.config.url(url, dynamicPrefix)

  // auto type by suffix
  if(!type) {
    m = /\.(m?js|css|json)$/.exec(url)
    type = m ? m[1] : "text"
  }

  // invoke
  return loading[type](url)
}
//-----------------------------------
export default TiUse

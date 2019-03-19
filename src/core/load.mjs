import {Ti} from "./ti.mjs"
import {importModule} from "./polyfill-dynamic-import.mjs"
//---------------------------------------
const loading = {
  // normal js lib
  js(url) {
    return new Promise((resolve, reject)=>{
      let $script = Ti.Dom.find(`script[src="${url}"]`)
      if($script) {
        _.defer(resolve, $script)
      } else {
        $script = Ti.Dom.createElement({
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
        Ti.Dom.appendToHead($script)
      }
    })  // ~ Promise
  },
  // official js module
  mjs(url) {
    // FF don't suppor the import() yet by default 
    // return import(url).then(m => m.default)
    // use the polyfill method instead
    return importModule(url).then(m=>m.default)
  },
  // css file
  css(url) {
    return new Promise((resolve, reject)=>{
      let $link = Ti.Dom.find(`link[href="${url}"]`)
      if($link) {
        _.defer(resolve, $link)
      } else {
        $link = Ti.Dom.createElement({
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
        Ti.Dom.appendToHead($link)
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
    return Ti.Http.get(url)
  }
}
//---------------------------------------
export const TiLoad = function(url=[], {dynamicPrefix, dynamicAlias}={}) {
  // dynamic url 
  if(_.isFunction(url)) {
    let u2 = url();
    return TiLoad(u2, {dynamicPrefix})
  }
  // multi urls
  if(_.isArray(url)) {
    let ps = []
    let result = []
    url.forEach((s, index)=>{
      ps.push(
        TiLoad(s, {dynamicPrefix, dynamicAlias})
          .then(re => result[index] = re)
      )
    })
    return Promise.all(ps).then(()=>result)
  }

  // Must be a String
  if(!_.isString(url)) {
    throw Ti.Err.make("e-ti-use-url_must_string", url)
  }

  // url prefix indicate the type
  let url2 = url
  let type, m = /^(!(m?js|json|css|text):)?(.+)$/.exec(url)
  if(m) {
    type = m[2]
    url2 = m[3]
  }

  // apply url prefix & alias
  let url3 = Ti.Config.url(url2, {dynamicPrefix, dynamicAlias})
  if(Ti.IsTrace()) {
    console.log("url：", url, 
                  "\n  ::", url2, 
                  "\n  ::", url3,
                  "\n  ::", dynamicPrefix,
                  "\n  ::", dynamicAlias)
  }

  // auto type by suffix
  if(!type) {
    m = /\.(m?js|css|json)$/.exec(url3)
    type = m ? m[1] : "text"
  }

  // invoke
  return loading[type](url3)
}
//-----------------------------------
export default TiLoad

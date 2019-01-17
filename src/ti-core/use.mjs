import {ti} from "./ti.mjs"
import { importModule } from "./importModule.mjs"
//---------------------------------------
const loading = {
  // normal js lib
  js(url) {
    return new Promise((resolve, reject)=>{
      let $script = ti.dom.find(`script[src="${url}"]`)
      if($script) {
        _.defer(resolve, $script)
      } else {
        $script = ti.dom.createElement({
          tagName : "script",
          props : {
            charset : "stylesheet",
            type    : "module",
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
  // pure text
  text(url) {
    return new Promise((resolve, reject)=>{
      axios.get(url)
        .then(resp => resolve(resp.data))
        .catch(err => reject(err))
    })
  }
}
//---------------------------------------
// url: /^(!($prefix):)?(.+)$/
//  - "/js/jquery.js"
//  - "!mjs:/js/jquery.js"
//  - "!css:/my/css.txt"
function autoType(url) {
  // url prefix indicate the type
  let m = /^(!(m?js|json|css|text):)?(.+)$/.exec(url)
  if(m[2])
    return {type:m[2],url:m[3]}
  
  // detect by suffix
  // for script, take it as module
  if(/^.+\.js$/.test(url)) {
    return {url, type:"js"}
  }

  if(/^.+\.mjs$/.test(url)) {
    return {url, type:"mjs"}
  }
  
  if(/^.+\.css$/.test(url))
    return {url, type:"css"}
  
  if(/^.+\.json$/.test(url))
    return {url, type:"json"}
  
  return {url, type:"text"}
}
//---------------------------------------
export const TiUse = function(url=[], {type="auto"}={}) {
  // dynamic url 
  if(_.isFunction(url)) {
    let u2 = url();
    return TiUse(u2, {type})
  }
  // multi urls
  if(_.isArray(url)) {
    let ps = []
    let result = []
    url.forEach((s, index)=>{
      ps.push(
        TiUse(s, {type})
          .then(re => result[index] = re)
      )
    })
    return Promise.all(ps).then(()=>result)
  }

  // Must be a String
  if(!_.isString(url)) {
    throw ti.err.make("e.ti.use.url_must_string", url)
  }

  // check auto mode
  let lo = ("auto" == type) 
              ? autoType(url)
              : {type, url}
  
  // apply url prefix & alias
  lo.url = ti.config.url(lo.url)

  // invoke
  return loading[lo.type](lo.url)
}
//-----------------------------------
export default TiUse

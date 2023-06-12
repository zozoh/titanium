import {importModule} from "./polyfill-dynamic-import.mjs"
/////////////////////////////////////////
// One resource load only once
class UnifyResourceLoading {
  //-------------------------------------
  constructor(doLoad=(url)=>url) {
    this.cached = {}
    this.loading = {}
    this.doLoad = doLoad
  }
  //-------------------------------------
  async tryLoad(url, whenDone) {
    // Is Loaded
    let re = this.cached[url]
    if(!_.isUndefined(re)) {
      whenDone(re)
      return
    }
    // Is Loading, just join it
    let ing = this.loading[url]
    if(_.isArray(ing) && ing.length>0) {
      ing.push(whenDone)
      return
    }

    // Load it
    this.loading[url] = [whenDone]

    let reo = await this.doLoad(url)

    // cache it
    this.cached[url] = reo

    // Callback
    let fns = this.loading[url]
    this.loading[url] = null
    for(let fn of fns) {
      fn(reo)
    }
  }
  //-------------------------------------
}
/////////////////////////////////////////
const MjsLoading = new UnifyResourceLoading(async (url)=>{
  // window.mjsII = window.mjsII || []
  // window.mjsII.push(url)
  // TBS browser don't suppor the import() yet by default 
  //return import(url).then(m => m.default)
  // use the polyfill method instead
  try {
    // TODO: QQBrowser will drop cookie when import the module js
    // I need auto-dected the browser type to decide in runtime
    // for use the polyfill-dynamic-import or native one
    let UA = window.navigator.userAgent || "";
    if(UA.indexOf("QQBrowser") > 0) {
      //console.log("QQBrowser dynamic importModule:", url)
      return await importModule(url)      
    }
    return await import(url)
  }
  catch(E) {
    if(Ti.IsWarn("TiLoad")) {
      console.warn("ti.load.mjs", url, E)
    }
    throw E
  }
})
/////////////////////////////////////////
const TextLoading = new UnifyResourceLoading(async (url)=>{
  // window.textII = window.textII || []
  // window.textII.push(url)
  try {
    return await Ti.Http.get(url)
  }
  catch(E) {
    if(Ti.IsWarn("TiLoad")) {
      console.warn("ti.load.text", url, E)
    }
    throw E
  }
})
/////////////////////////////////////////
const LoadModes = {
  // normal js lib
  js(url) {
    return new Promise((resolve, reject)=>{
      // Already Loaded
      let $script = Ti.Dom.find(`script[src="${url}"]`)
      if($script) {
        _.defer(resolve, $script)
      }
      // Load it now
      else {
        $script = Ti.Dom.createElement({
          tagName : "script",
          props : {
            //charset : "stylesheet",
            src     : url,
            //async   : true
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
  // async js lib
  asyncjs(url) {
    return new Promise((resolve, reject)=>{
      // Already Loaded
      let $script = Ti.Dom.find(`script[src="${url}"]`)
      if($script) {
        _.defer(resolve, $script)
      }
      // Load it now
      else {
        $script = Ti.Dom.createElement({
          tagName : "script",
          props : {
            //charset : "stylesheet",
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
    return new Promise((resolve, reject)=>{
      MjsLoading.tryLoad(url, (reo)=>{
        resolve(reo.default)
      })
    })
  },
  // css file
  css(url) {
    return new Promise((resolve, reject)=>{
      let $link = Ti.Dom.find(`link[href="${url}"]`)
      // Already Loaded
      if($link) {
        _.defer(resolve, $link)
      }
      // Load it now
      else {
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
  async json(url) {
    try {
      let json = await LoadModes.text(url)
      return _.isPlainObject(json)
              ? json
              : JSON.parse(json)
    } catch(E) {
      if(Ti.IsWarn("TiLoad")) {
        console.warn("ti.load.json!!", url, E)
      }
      throw E
    }
  },
  // pure text
  text(url) {
    // if(url.endsWith("/ti-list.html")) {
    //   console.log("::TEXT->", url)
    // }
    // Check the CACHE
    return new Promise((resolve, reject)=>{
      TextLoading.tryLoad(url, resolve)
    })
  }
}
//---------------------------------------
// @cooked : the URL has been Ti.Config.url already
async function TiLoad(url=[], {dynamicPrefix, dynamicAlias, cooked, type}={}) {
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

  //
  // Cook URL
  //
  if(!cooked) {
    let cook = Ti.Config.cookUrl(url , {dynamicPrefix, dynamicAlias})
    if(!cook) {
      throw `Fail to cook URL: ${url}`
    }
    type = cook.type
    url  = cook.url
  }

  // Try cache
  let reObj = Ti.MatchCache(url)
  if(reObj)
    return reObj

  // if(url.endsWith(".json")) {
  //   console.log({url, type})
  // }

  // invoke
  try {
    reObj = await LoadModes[type](url)
    return reObj
  }catch(E) {
    if(Ti.IsWarn("TiLoad")) {
      console.warn(`TiLoad Fail: [${type}]`, `"${url}"`)
    }
    throw E
  }
}
//-----------------------------------
export const Load = TiLoad

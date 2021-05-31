//---------------------------------------
function isTiLink(str) {
  // Remote Link @http://xxx
  if(/^@https?:\/\//.test(str)){
    return str.substring(1)
  }
  // Remote Link @js://xxx
  if(/^@!(js|css|html|mjs|text|json):\/\//.test(str)){
    return str.substring(1)
  }
  // Remote Link @//xxx
  // Absolute Link @/xxx
  if(/^@\/{1,2}/.test(str)){
    return str.substring(1)
  }
  // @com:xxx or @mod:xxx
  if(/^(@[A-Za-z0-9_-]+:?|\.\/)/.test(str)) {
    return str
  }
  // !mjs:xxx
  if(/^(!(m?js|json|css|text):)/.test(str)) {
    return str
  }
  // Then it should be normal string
}
//---------------------------------------
class LoadingTable {
  //.....................................
  constructor(afterLoaded){
    this.itMap = {}
    this.afterLoaded = afterLoaded
  }
  //.....................................
  isAlreadyInLoading(link) {
    return this.itMap[link] ? true : false
  }
  //.....................................
  // @return true: add (should create promise), false: join
  addItem(link) {
    this.itMap[link] = {
      done: false,
      result : undefined
    }
  }
  //.....................................
  loadedItem(link, result) {
    let it = this.itMap[link]
    it.result = result
    it.done = true
  }
  //.....................................
  // Check table is done
  tryFinished() {
    for(let link in this.itMap) {
      let it = this.itMap[link]
      if(!it.done)
        return
    }
    this.afterLoaded(this.itMap)
  }
  //.....................................
}
//---------------------------------------
function __load_linked_obj(input, {
  LT, dynamicPrefix, dynamicAlias
}={}) { 
  //.....................................
  // String
  if(_.isString(input)) {
    // Escape "...", the syntax for MappingXXX of Vuex
    // only link like value should be respected
    if(!/^\.{3}/.test(input)) {
      let linkURI = isTiLink(input)
      //.......................................
      if(linkURI) {
        let cookRe = Ti.Config.cookUrl(linkURI, {dynamicPrefix, dynamicAlias})
        if(!cookRe) {
          return
        }
        let {url, type}  = cookRe

        if(!LT.isAlreadyInLoading(url)) {
          LT.addItem(url)
          Ti.Load(url, {dynamicPrefix, dynamicAlias, cooked:true, type})
            .then( reo => {
              let parentPath = Ti.Util.getParentPath(url)
              // Check the result deeply
              __load_linked_obj(reo, {
                LT, dynamicPrefix, 
                dynamicAlias : new Ti.Config.AliasMapping({
                  "^\./": parentPath
                })
              })

              // Mark the result in LoadingTable
              LT.loadedItem(url, reo)

              // Try end
              LT.tryFinished()
            })
        }
      } // if(linkURI) {
    }
    //.......................................
  }
  //.....................................
  // Array
  else if(_.isArray(input)) {
    for(let i=0; i<input.length; i++) {
      let ele = input[i]
      __load_linked_obj(ele, {LT, dynamicPrefix, dynamicAlias})
    }
  }
  //.....................................
  // Object
  else if(_.isPlainObject(input)) {
    for(let key in input) {
      let val = input[key]
      __load_linked_obj(val, {LT, dynamicPrefix, dynamicAlias})
    }
  }
  //.....................................
}
//---------------------------------------
function __assemble_linked_obj(
  input, 
  itMap, 
  memo={}, 
  {dynamicPrefix, dynamicAlias}
) {
  //.....................................
  // String
  if(_.isString(input)) {
    // Escape "...", the syntax for MappingXXX of Vuex
    // only link like value should be respected
    if(!/^\.{3}/.test(input)) {
      let linkURI = isTiLink(input)
      //.......................................
      if(linkURI) {
        // Try cook URL
        let cookRe = Ti.Config.cookUrl(linkURI, {dynamicPrefix, dynamicAlias})
        if(!cookRe) {
          return input
        }
        let {url, type} = cookRe
        // Guard for infinity import loop
        if(memo[url])
          return
        let reo = itMap[url].result
        let parentPath = Ti.Util.getParentPath(url)
        memo = _.assign({}, memo, {[url]:true})
        let re2 = __assemble_linked_obj(reo, itMap, memo, {
          dynamicPrefix, 
          dynamicAlias : new Ti.Config.AliasMapping({
            "^\./": parentPath
          })
        })
        return re2
      }
    }
    //.......................................
  }
  //.....................................
  // Array
  else if(_.isArray(input)) {
    let list = []
    for(let i=0; i<input.length; i++) {
      let ele = input[i]
      let e2 = __assemble_linked_obj(ele, itMap, memo, {dynamicPrefix, dynamicAlias})
      if(!_.isUndefined(e2)) {
        list.push(e2)
      }
    }
    return list
  }
  //.....................................
  // Object
  else if(_.isPlainObject(input)) {
    let obj = {}
    for(let key in input) {
      let val = input[key]
      let v2 = __assemble_linked_obj(val, itMap, memo, {dynamicPrefix, dynamicAlias})
      obj[key] = v2
    }
    return obj
  }
  //.....................................
  // Others just return
  return input
  //.....................................
}
//---------------------------------------
export function LoadTiLinkedObj(input, {
  dynamicPrefix, dynamicAlias
}={}) { 
  return new Promise((resolve, reject)=>{
    // Prapare the loading table
    // And register a callback function
    // once the table done for load all linked 
    // object deeply, it will be call to make the 
    // result object
    let LT = new LoadingTable((itMap)=>{
      let reo = __assemble_linked_obj(input, itMap, {}, {dynamicPrefix, dynamicAlias})
      resolve(reo)
    })
    // Start loading ...
    __load_linked_obj(input, {
      dynamicPrefix, 
      dynamicAlias,
      LT
    })
  })
}
/***
Load all app info for app.json  
*/
export async function LoadTiAppInfo(info={}, $doc=document) {
  // Clone info and reload its all detail
  let conf = await LoadTiLinkedObj(info, {
    "^\./": "@MyApp:"
  })
  if(Ti.IsInfo("TiApp")) {
    console.log("await LoadTiLinkedObj(conf)", conf)
  }
  
  // For Theme / CSS
  // RemarkCssLink(conf.theme, {key:"ti-theme", val:"yes"})
  // RemarkCssLink(conf.css,   {key:"ti-app-css", val:conf.name})
  
  // The app config object which has been loaded completely
  return conf
}
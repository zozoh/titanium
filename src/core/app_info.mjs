import {Ti} from './ti.mjs'
//---------------------------------------
const BASE = Symbol("BASE")
//---------------------------------------
async function LoadTiLinkedObj(obj={}, {dynamicPrefix, dynamicAlias}={}) {
  // Promise list
  let ps = []
  // walk Object Key shallowly
  _.forOwn(obj, function(val, key){
    // String
    if(_.isString(val)) {
      // the value is linked
      if(/^(@[a-z0-9_-]+:?|\.\/)/.test(val)) {
        ps.push(Ti.Load(val, {dynamicPrefix, dynamicAlias}).then(re=>{
          // Plain Object save the BASE for recur
          if(_.isPlainObject(re)) {
            obj[key] = {[BASE]:val, ...re}
          }
          // Others just save it
          else {
            obj[key] = re
          }
        }))
      }
    }
    // Array recur
    else if(_.isArray(val)){
      // Prepare the loading list
      let list  = []
      let index = []   // the index of `list` in `val`
      for(let i=0; i<val.length; i++) {
        let v = val[i];
        if(/^(@[a-z0-9_-]+:?|\.\/)/.test(val)) {
          list.push(v)
          index.push(i)
        }
      }
      // Nothing need to load
      if(list.length == 0)
        return

      // Do loading
      console.log("load: ", list)
      ps.push(Ti.Load(list, {dynamicPrefix, dynamicAlias}).then(reList=>{
        for(let i=0; i<reList.length; i++) {
          let ix = index[i]
          val[ix] = {[BASE]:list[i], ...reList[i]}
        }
      }))
    }
    // Object recur
    else if(_.isObject(val)){{
      ps.push(LoadTiLinkedObj(val, {dynamicPrefix, dynamicAlias}))
    }}
  })
  // Promise obj has been returned
  if(ps.length > 0) {
      await Promise.all(ps);
  }
  return obj;
}
//---------------------------------------
function RemarkCssLink(cssLink, {key="",val=""}={}, $doc=document) {
  if(!cssLink)
    return
  // Batch
  if(_.isArray(cssLink) && cssLink.length > 0){
    // Then remove the old
    Ti.Dom.remove('link['+key+'="'+val+'"]', $doc.head)
    // Mark the new one
    for(let cl of cssLink) {
      RemarkCssLink(cl, {key:"", val:""})
    }
    return
  }
  // Already marked
  if(key && cssLink.getAttribute(key) == val)
    return
  
  // Mark the new
  if(key && val)
    cssLink.setAttribute(key, val)
}
// //---------------------------------------
// function MergeToOne(listOrObj) {
//   if(_.isArray(listOrObj)) {
//     return _.assign({}, ...listOrObj)
//   }
//   // `null/false ...` unify to undefined
//   if(!listOrObj)
//     return undefined
//   // Plain object already
//   return listOrObj
// }
//---------------------------------------
export const TiAppInfo = {
  /***
  Load all app info for app.json  
  */
  async load(info={}, $doc=document) {
    // App Must has a name
    if(!info.name) {
      throw Ti.Err.make("e.ti.app.load_info_without_name")
    }
    // Clone info and reload its all detail
    let conf = _.cloneDeep(info)
    await LoadTiLinkedObj(conf)
    console.log("conf1", conf)

    // Then check each part
    
    // For Theme / CSS
    RemarkCssLink(conf.theme, {key:"ti-theme", val:"yes"})
    RemarkCssLink(conf.css,   {key:"ti-app-css", val:conf.name})
    
    // Merge mutations/actions/getters as single one Object
    // conf.mutations = MergeToOne(conf.mutations)
    // conf.actions   = MergeToOne(conf.actions)
    // conf.getters   = MergeToOne(conf.getters)
    
    // extends all modules
    if(_.isArray(conf.modules) && conf.modules.length>0) {
      let ps = []
      for(let mod of conf.modules) {
        console.log("mod:", mod)
        ps.push(LoadTiLinkedObj(mod, { 
          dynamicAlias : new Ti.Config.AliasMapping({
            "^\./" : mod[BASE] + "/"
          })
        }).then(mod=>{
          // mod.mutations = MergeToOne(mod.mutations)
          // mod.actions   = MergeToOne(mod.actions)
          // mod.getters   = MergeToOne(mod.getters)
        }))
      }
      // wait the loading has been done
      await Promise.all(ps)
    }

    // extends all components
    if(_.isArray(conf.components) && conf.components.length>0) {
      let ps = []
      for(let com of conf.components) {
        console.log("com before", com)
        ps.push(LoadTiLinkedObj(com, { 
          dynamicAlias : new Ti.Config.AliasMapping({
            "^\./" : com[BASE] + "/"
          })
        }).then(com=>{
          console.log("com after", com)
          // com.computed = MergeToOne(com.computed)
          // com.methods  = MergeToOne(com.methods)
        }))
      }
      // wait the loading has been done
      await Promise.all(ps)
    }

    // The app config object which has been loaded completely
    return conf
  }
}
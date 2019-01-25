import {Ti}    from './ti.mjs'
import {TiVue} from "./polyfill-ti-vue.mjs"
//---------------------------------------
export const BASE = Symbol("BASE")
//---------------------------------------
export async function LoadTiLinkedObj(
  obj={}, 
  {dynamicPrefix, dynamicAlias}={}
) {
  // Promise list
  let ps = []
  // walk Object Key shallowly
  _.forOwn(obj, function(val, key){
    // Escape "...", the syntax for MappingXXX of Vuex
    if(/^\.{3}/.test(key)) {
      return
    }
    // String
    if(_.isString(val)) {
      // the value is linked
      if(/^(@[a-z0-9_-]+:?|\.\/)/.test(val)) {
        ps.push(Ti.Load(val, {
          dynamicPrefix, dynamicAlias
        }).then(re=>{
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
        if(/^(@[a-z0-9_-]+:?|\.\/)/.test(v)) {
          list.push(v)
          index.push(i)
        }
      }
      // Nothing need to load
      if(list.length == 0)
        return

      // Do loading
      ps.push(Ti.Load(list, {
        dynamicPrefix, dynamicAlias
      }).then(reList=>{
        for(let i=0; i<reList.length; i++) {
          let base = list[i]
          let re = reList[i]
          let ix = index[i]
          // Plain Object save the BASE for recur
          if(_.isPlainObject(re)) {
            val[ix] = {[BASE]:base, ...re}
          }
          // Others just save it
          else {
            val[ix] = re
          }
        }
      }))
    }
    // Object recur
    else if(_.isPlainObject(val)){{
      ps.push(LoadTiLinkedObj(val, {
        dynamicPrefix, dynamicAlias
      }))
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
/***
Load all app info for app.json  
*/
export async function LoadTiAppInfo(info={}, $doc=document) {
  // App Must has a name
  if(!info.name) {
    throw Ti.Err.make("e.ti.app.load_info_without_name")
  }
  // Clone info and reload its all detail
  let conf = _.cloneDeep(info)
  await LoadTiLinkedObj(conf)
  {
    console.log("await LoadTiLinkedObj(conf)", conf)
  }

  // Then check each part
  
  // For Theme / CSS
  RemarkCssLink(conf.theme, {key:"ti-theme", val:"yes"})
  RemarkCssLink(conf.css,   {key:"ti-app-css", val:conf.name})
  
  // Merge mutations/actions/getters as single one Object
  // conf.mutations = MergeToOne(conf.mutations)
  // conf.actions   = MergeToOne(conf.actions)
  // conf.getters   = MergeToOne(conf.getters)
  
  // extends all modules
  if(conf.store) {
    await TiVue.LoadVuexModule(conf.store, "@MyApp:")
  }

  // extends all components
  if(_.isArray(conf.components) && conf.components.length>0) {
    TiVue.LoadVueComponents(conf.components)
  }

  // The app config object which has been loaded completely
  return conf
}
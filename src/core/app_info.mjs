import {Ti} from './ti.mjs'
//---------------------------------------
async function LoadTiLinkedObj(obj={}) {
  // Promise list
  let ps = []
  // walk Object Key shallowly
  _.forOwn(obj, function(val, key){
    // String
    if(_.isString(val)) {
      // the value is linked
      if(/^@[a-z0-9]+:/.test(val)) {
        ps.push(Ti.Load(val).then(re=>{
          obj[key] = re
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
        if(/^@[a-z0-9]+:/.test(val)){
          list.push(v)
          index.push(i)
        }
      }
      // Nothing need to load
      if(list.length == 0)
        return

      // Do loading
      ps.push(Ti.Load(list).then(reList=>{
        for(let i=0; i<reList.length; i++) {
          let ix = index[i]
          val[ix] = reList[i]
        }
      }))
    }
    // Object recur
    else if(_.isObject(val)){{
      ps.push(LoadTiLinkedObj(val))
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
//---------------------------------------
function MergeToOne(listOrObj) {
  if(_.isArray(listOrObj)) {
    return _.assign({}, ...listOrObj)
  }
  // it is a plain object already
  return listOrObj
}
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
    let obj = _.cloneDeep(info)
    await LoadTiLinkedObj(obj)

    // Then check each part
    
    // For Theme / CSS
    RemarkCssLink(obj.theme, {key:"ti-theme", val:"yes"})
    RemarkCssLink(obj.css,   {key:"ti-app-css", val:obj.name})
    
    // Merge mutations/actions/getters as single one Object
    obj.mutations = MergeToOne(obj.mutations)
    obj.actions   = MergeToOne(obj.actions)
    obj.getters   = MergeToOne(obj.getters)
    
    // extends all modules
    if(_.isArray(obj.modules) && obj.modules.length>0) {
      let ps = []
      for(let mod of obj.modules) {
        ps.push(LoadTiLinkedObj(mod).then(mod=>{
          mod.mutations = MergeToOne(mod.mutations)
          mod.actions   = MergeToOne(mod.actions)
          mod.getters   = MergeToOne(mod.getters)
        }))
      }
      // wait the loading has been done
      await Promise.all(ps)
    }

    // extends all components
    if(_.isArray(obj.components) && obj.components.length>0) {
      let ps = []
      for(let com of obj.components) {
        ps.push(LoadTiLinkedObj(com).then(com=>{
          com.computed = MergeToOne(com.computed)
          com.methods  = MergeToOne(com.methods)
        }))
      }
      // wait the loading has been done
      await Promise.all(ps)
    }

    // Then return the app object which has been loaded completely
    return obj
  }
}
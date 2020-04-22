//---------------------------------------
function isTiLink(str) {
  // @com:xxx or @mod:xxx
  if(/^(@[A-Za-z0-9_-]+:?|\.\/)/.test(str)) {
    return true
  }
  // !mjs:xxx
  if(/^(!(m?js|json|css|text):)/.test(str)) {
    return true
  }
  // Then it should be normal string
  return false
}
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
      // only link like value should be respected
      if(!isTiLink(val)) {
        return
      }
      ps.push(new Promise((resolve, reject)=>{
        Ti.Load(val, {dynamicPrefix, dynamicAlias}).then(async re=>{
          const v2  = Ti.Config.url(val, {dynamicPrefix, dynamicAlias})
          const re2 = await LoadTiLinkedObj(re, {
            dynamicAlias: new Ti.Config.AliasMapping({
              "^\./": Ti.Util.getParentPath(v2)
            })
          });
          obj[key] = re2;
          resolve(re2);
        })
      }))
    }
    // Array recur
    else if(_.isArray(val)){
      for(let i=0; i<val.length; i++) {
        let v = val[i];
        // only link like value should be respected
        if(!_.isString(v) || !isTiLink(v)) {
          continue
        }
        ps.push(new Promise((resolve, reject)=>{
          Ti.Load(v, {dynamicPrefix, dynamicAlias}).then(async re=>{
            const v2  = Ti.Config.url(v, {dynamicPrefix, dynamicAlias})
            const re2 = await LoadTiLinkedObj(re, {
              dynamicAlias: new Ti.Config.AliasMapping({
                "^\./": Ti.Util.getParentPath(v2)
              })
            });
            val[i] = re2
            // If modules/components, apply the default name
            if(!re2.name && /^(modules|components)$/.test(key)) {
              re2.name = Ti.Util.getLinkName(v)
            }
            // Done for loading
            resolve(re2);
          })
        }))
      }
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
/***
Load all app info for app.json  
*/
export async function LoadTiAppInfo(info={}, $doc=document) {
  // Clone info and reload its all detail
  let conf = _.cloneDeep(info)
  await LoadTiLinkedObj(conf)
  if(Ti.IsInfo("TiApp")) {
    console.log("await LoadTiLinkedObj(conf)", conf)
  }
  
  // For Theme / CSS
  // RemarkCssLink(conf.theme, {key:"ti-theme", val:"yes"})
  // RemarkCssLink(conf.css,   {key:"ti-app-css", val:conf.name})
  
  // The app config object which has been loaded completely
  return conf
}
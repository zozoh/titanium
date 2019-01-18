import {Ti} from './ti.mjs'
//---------------------------------------
function LoadTiLinkedObj(obj={}) {
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

    }
    // Object recur
    else if(_.isObject(val)){{

    }}
  })
  // No Promise, just return null
  if(ps.length == 0)
    return null
  // Promise all them
  return Promise.all(ps)
}
//---------------------------------------
export const TiAppInfo = {
  /***
  Load all app info for app.json  
  */
  load(info={}) {
    let obj = _.cloneDeep(info)
    return LoadTiLinkedObj(obj)
  }
}
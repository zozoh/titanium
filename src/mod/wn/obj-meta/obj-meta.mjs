export default {
  ////////////////////////////////////////////////
  getters : {
    //-------------------------------------------
    get : (state) => state,
    //-------------------------------------------
    hasParent : (state)=>{
      // console.log(state.ancestors)
      // console.log(state.parent)
      return state.parent ? true : false
    },
    //-------------------------------------------
    parentIsHome : (state)=>{
      if(!_.isEmpty(state.ancestors) && state.parent && state.meta) {
        if(/^\/home\//.test(state.meta.ph)) {
          return state.parent.pid == state.ancestors[0].id
        }
      }
      return false
    },
    //-------------------------------------------
    currentIsHome : (state)=>{
      if(!_.isEmpty(state.ancestors) && state.meta) {
        if(/^\/home\//.test(state.meta.ph)) {
          return state.meta.pid == state.ancestors[0].id
        }
      }
      return false
    }
    //-------------------------------------------
  },
  ////////////////////////////////////////////////
  mutations : {
    //-------------------------------------------
    reset(state) {
      _.assign(state, {
        "ancestors" : [], 
        "parent" : null, 
        "meta": null,
        "status" : {
          "changed"   : false,
          "saving"    : false,
          "reloading" : false
        },
        "fieldStatus" : {}
      })
    },
    //-------------------------------------------
    setAncestors(state, ancestors=[]) {
      state.ancestors = _.concat(ancestors)
    },
    //-------------------------------------------
    setParent(state, parent) {
      state.parent = parent
    },
    //-------------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //------------------------------------------
    setFieldStatus(state, {name, message, status}={}) {
      if(name){
        let st = status ? {status, message} : null
        let ukey = _.concat(name).join("-")
        Vue.set(state.fieldStatus, ukey, st)
      }
    },
    //------------------------------------------
    clearFieldStatus(state, names=[]) {
      // Clean All
      if(_.isEmpty(names)) {
        state.fieldStatus = {}
      }
      // Clear one
      else {
        state.fieldStatus = _.omit(state.fieldStatus, names)
      }
    },
    //------------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    }
    //-------------------------------------------
  }
  ////////////////////////////////////////////////
}
export default {
  ////////////////////////////////////////////////
  getters : {
    //-------------------------------------------
    get(state){return state},
    //-------------------------------------------
    getHome(state) {
      let obj = state.meta
      let ans = state.ancestors
      if(!_.isEmpty(ans)) {
        // for /home/xiaobai
        if(1 == ans.length) {
          if("home" == ans[0].nm) {
            return obj
          }
        }
        // for /home/xiaobai/path/to/file
        if("home" == ans[0].nm) {
          return ans[1]
        }
      }
      // for /root
      else if(obj && "root" == obj.nm) {
        return obj
      }
      // Dont't known how to find the home
      return null
    },
    //-------------------------------------------
    hasParent (state) {
      // console.log(state.ancestors)
      // console.log(state.parent)
      return state.parent ? true : false
    },
    //-------------------------------------------
    parentIsHome(state) {
      if(!_.isEmpty(state.ancestors) && state.parent && state.meta) {
        if(/^\/home\//.test(state.meta.ph)) {
          return state.parent.pid == state.ancestors[0].id
        }
      }
      return false
    },
    //-------------------------------------------
    isHome (state) {
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
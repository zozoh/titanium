export default {
  ////////////////////////////////////////////////
  getters : {
    get : (state) => state,
    hasParent : (state)=>{
      // console.log(state.ancestors)
      // console.log(state.parent)
      return state.parent ? true : false
    },
    parentIsHome : (state)=>{
      if(!_.isEmpty(state.ancestors) && state.parent && state.meta) {
        if(/^\/home\//.test(state.meta.ph)) {
          return state.parent.pid == state.ancestors[0].id
        }
      }
      return false
    },
    currentIsHome : (state)=>{
      if(!_.isEmpty(state.ancestors) && state.meta) {
        if(/^\/home\//.test(state.meta.ph)) {
          return state.meta.pid == state.ancestors[0].id
        }
      }
      return false
    }
  },
  ////////////////////////////////////////////////
  mutations : {
    set(state, {
      ancestors, parent, children, meta, content, contentType
    }={}) {
      Ti.Util.setTo(state, {ancestors, children}, [])
      Ti.Util.setTo(state, {parent, meta, content, contentType}, null)
    }
  }
  ////////////////////////////////////////////////
}
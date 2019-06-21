//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    setMetaFieldValue(state, {name, value}={}) {
      Vue.set(state.meta, name, _.cloneDeep(value))
    },
    setMetaFieldStatus(state, {name, message, status}={}) {
      let st = null
      if(status) {
        st = {status, message}
      }
      Vue.set(state.fieldStatus, name, st)
    },
    clearMetaFieldStatus(state, names=[]) {
      // Clean All
      if(_.isEmpty(names)) {
        state.fieldStatus = {}
      }
      // Clear one
      else if(_.isString(names)) {
        Vue.set(state.fieldStatus, names, null)
      }
      // Clean one by one
      else {
        for(let nm of names) {
          Vue.set(state.fieldStatus, name, null)
        }
      }
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    setContent(state, content) {
      state.content = content
    },
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    setContentType(state, contentType) {
      state.contentType = contentType
    }
  }
  ////////////////////////////////////////////
}
//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    //------------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //------------------------------------------
    setMetaFieldValue(state, {name, value}={}) {
      // Normal field
      if(_.isString(name)) {
        Vue.set(state.meta, name, _.cloneDeep(value))
      }
      // name is Array, ti-form support the Array as field name
      // it will pick the keys from data and pass to form-field
      // just like country-province-city-address it should be edit 
      // by one casecaded component
      else {
        for(let nm of name) {
          let v2 = value ? value[nm] : undefined
          let v3 = _.cloneDeep(v2)
          Vue.set(state.meta, nm, v3)
        }
      }
    },
    //------------------------------------------
    setMetaFieldStatus(state, {name, message, status}={}) {
      let st = null
      if(status) {
        st = {status, message}
      }
      // Normal field
      if(_.isString(name)) {
        Vue.set(state.fieldStatus, name, st)
      }
      // name is Array, ti-form support the Array as field name
      // it will pick the keys from data and pass to form-field
      // just like country-province-city-address it should be edit 
      // by one casecaded component
      else if(_.isArray(name)) {
        for(let nm of name) {
          Vue.set(state.fieldStatus, nm, st)
        }
      }
    },
    //------------------------------------------
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
    //------------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //------------------------------------------
    setContent(state, content) {
      state.content = content
    },
    //------------------------------------------
    setSavedContent(state, content) {
      state.__saved_content = content
    },
    //------------------------------------------
    setContentType(state, contentType) {
      state.contentType = contentType
    },
    //------------------------------------------
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.content, state.__saved_content)
    }
    //------------------------------------------
  }
  ////////////////////////////////////////////
}
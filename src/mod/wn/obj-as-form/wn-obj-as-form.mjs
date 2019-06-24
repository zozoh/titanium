// Ti required(Wn)
//---------------------------------------
export default {
  mutations : {
    set(state, {
      meta, config, data, __saved_data, status
    }={}) {
      // Meta
      if(!_.isUndefined(meta))
        state.meta = _.cloneDeep(meta)
      // Data
      if(!_.isUndefined(config))
        state.config = _.cloneDeep(config)
      // Data
      if(!_.isUndefined(data))
        state.data = _.cloneDeep(data)
      // SavedData
      if(!_.isUndefined(__saved_data))
        state.__saved_data = _.cloneDeep(__saved_data)
      // Status
      _.assign(state.status, status)
    },
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.data, state.__saved_data)
    },
    /***
     * Update the data
     */
    setFieldValue(state, {name, value}={}){
      // Normal field
      if(_.isString(name)) {
        Vue.set(state.data, name, _.cloneDeep(value))
      }
      // name is Array, ti-form support the Array as field name
      // it will pick the keys from data and pass to form-field
      // just like country-province-city-address it should be edit 
      // by one casecaded component
      else {
        for(let nm of name) {
          let v2 = value ? value[nm] : undefined
          let v3 = _.cloneDeep(v2)
          Vue.set(state.data, nm, v3)
        }
      }
    },
    /***
     * Change the field status
     */
    setFieldStatus(state, {name, message, status}={}) {
      let st = null
      if(status) {
        st = {status, message}
      }
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
    /***
     * Clear the field status.
     * 
     * @param name{Array|String} field names to clean. if empty, clean all
     */
    clearFieldStatus(state, names=[]) {
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
    }
  },
  //.....................................
  actions : {
    /***
     * Update the data and `status.changed`
     */
    update({state, commit}, {name, value}={}){
      commit("setFieldValue", {name, value})
      commit("clearFieldStatus", [name])
      commit("syncStatusChanged")
      commit("set", {data: state.data})
    },
    /***
     * Save content to remote
     */
    async save({state, commit}) {
      if(state.status.saving){
        return
      }

      let meta   = state.meta
      let data   = state.data
      let config = state.config
      let json = config.json 
                  ? JSON.stringify(data, 
                      config.json.replacer, 
                      config.json.tabs || '   ')
                  : JSON.stringify(data)
      commit("set", {status:{saving:true}})
      let newMeta = await Wn.Io.saveContentAsText(meta, json)
      commit("set", {
        meta: newMeta, 
        __saved_data : data,
        status:{saving:false}
      })
      commit("clearFieldStatus")
      commit("syncStatusChanged")

      // return the new meta
      return state.meta
    },
    /***
     * Reload content from remote
     */
    async reload({state, commit}, meta) {
      if(state.status.reloading){
        return
      }

      // Use the default meta
      if(!meta) {
        meta = state.meta
      }
      
      // Declare to loading
      commit("set", {status:{reloading:true}})

      // The loading result
      let json
      
      // Load config
      let config = {}
      if(meta.form) {
        let pph = Ti.Util.getParentPath(meta.ph)
        let aph = Ti.Util.appendPath(pph, meta.form)
        let formMeta = await Wn.Io.loadMeta(aph)
        json = await Wn.Io.loadContent(formMeta, {as:"json"})
        config = json || {}
      }
      // set defaults to config
      config = _.defaults(config, {
        serializers  : {},
        transformers : {},
        statusIcons : {
          spinning : 'fas-spinner fa-spin',
          error    : 'zmdi-alert-polygon',
          warn     : 'zmdi-alert-triangle',
          ok       : 'zmdi-check-circle',
        },
        fields: []
      })

      // Load data
      let data = await Wn.Io.loadContent(meta, {as:"json"})

      // reset data
      commit("set", {
        meta, data, config,
        __saved_data : data,
        status:{reloading:false}
      })
      commit("clearFieldStatus")
      commit("syncStatusChanged")

      // return the root state
      return state
    }
  }
  //.....................................
}
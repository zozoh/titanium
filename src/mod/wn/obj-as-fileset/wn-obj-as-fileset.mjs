// Ti required(Wn)
//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    //------------------------------------------
    set(state, {
      meta, files, current, config, data, __saved_data, status
    }={}) {
      // Meta
      if(!_.isUndefined(meta))
        state.meta = _.cloneDeep(meta)
      // files
      if(!_.isUndefined(files))
        state.files = [].concat(files)
      // current file
      if(!_.isUndefined(current))
        state.current = _.cloneDeep(current)
      // config
      if(!_.isUndefined(current))
        state.current = _.cloneDeep(current)
      // Data
      if(!_.isUndefined(config))
        state.config = _.cloneDeep(config)
      // SavedData
      if(!_.isUndefined(__saved_data))
        state.__saved_data = _.cloneDeep(__saved_data)
      // Status
      _.assign(state.status, status)
    },
    //------------------------------------------
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.data, state.__saved_data)
    },
    //------------------------------------------
    /***
     * Update the data and `status.changed`
     */
    update(state, {name, value}={}){
      // value is partial data, shallow merge it
      if(_.isArray(name) && name.length > 0){
        _.assign(state.data, _.cloneDeep(value))
      }
      // set the value
      else if(_.isString(name) && name) {
        state.data[name] = _.cloneDeep(value)
      }
    }
  },
  ////////////////////////////////////////////
  actions : {
    /***
     * Update the data and `status.changed`
     */
    update({state, commit}, {name, value}={}){
      commit("update", {name, value})
      commit("syncStatusChanged")
      commit("set", {data: state.data})
    },
    //------------------------------------------
    /***
     * Save content to remote
     */
    async save({state, commit}) {
      if(state.status.saving){
        return
      }

      let meta   = state.current
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
        current: newMeta, 
        __saved_data : json,
        status:{saving:false}
      })
      commit("syncStatusChanged")

      // return the new meta
      return state.meta
    },
    //------------------------------------------
    /**
     * Load curretn file
     */
    async loadCurrentFile({state, commit}, current) {
      if(state.status.reloading){
        return
      }

      // Get Current Object
      current = current || state.current
      if(!current) {
        return
      }

      // Declare to loading
      commit("set", {status:{reloading:true}})

      // Load data
      let data = await Wn.Io.loadContent(current, {as:"jsonOrText"})

      // reset data
      commit("set", {
        current, data,
        __saved_data : data,
        status:{reloading:false}
      })
      commit("syncStatusChanged")

      // return the root state
      return state
    },
    //------------------------------------------
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

      // Load files
      let files = state.files
      if(!files || files.length == 0) {
        let result = await Wn.Io.loadChildren(meta)
        if(result) {
          files = result.list || []
        }
      }

      // Try current
      let current = state.current
      let data = null

      if(current) {
        data = await Wn.Io.loadContent(current, {as:"jsonOrText"})        
      }

      // reset data
      commit("set", {
        meta, files, current, data,
        __saved_data : data,
        status:{reloading:false}
      })
      commit("syncStatusChanged")

      // return the root state
      return state
    }
  }
  //.....................................
}
// Ti required(Wn)
//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    //------------------------------------------
    reset(state) {
      _.assign(state, {
        "meta": null,
        "files": [],
        "config" : {
          "json" : true
        },
        "current" : null,
        "data": null,
        "__saved_data" : null,
        "status" : {
          "changed"   : false,
          "saving"    : false,
          "reloading" : false
        }
      })
    },
    //------------------------------------------
    setMeta(state, meta) {
      state.meta = _.cloneDeep(meta)
    },
    //------------------------------------------
    setFiles(state, files) {
      state.files = _.cloneDeep(files)
    },
    //------------------------------------------
    setConfig(state, config) {
      state.config = _.cloneDeep(config)
    },
    //------------------------------------------
    setCurrent(state, current) {
      state.current = _.cloneDeep(current)
    },
    //------------------------------------------
    setData(state, data) {
      state.data = _.cloneDeep(data)
    },
    //------------------------------------------
    setSavedData(state, data) {
      state.__saved_data = _.cloneDeep(data)
    },
    //------------------------------------------
    setStatus(state, status={}) {
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
    updateData(state, {name, value}={}){
      // name is Array, the value must be the Object
      // whihc as partial data, so we will shallow merge it
      if(_.isArray(name) && name.length > 0){
        _.assign(state.data, _.cloneDeep(value))
      }
      // set the value
      else if(_.isString(name) && name) {
        Vuex.set(state.data, name, _.cloneDeep(value))
      }
    }
  },
  ////////////////////////////////////////////
  actions : {
    /***
     * Update the data and `status.changed`
     */
    update({state, commit}, {name, value}={}){
      commit("updateData", {name, value})
      commit("syncStatusChanged")
      //commit("setData", state.data)
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
      let content = config.json 
                  ? JSON.stringify(data, 
                      config.json.replacer, 
                      config.json.tabs || '   ')
                  : data
      commit("setStatus", {saving:true})
      let newMeta = await Wn.Io.saveContentAsText(meta, content)
      commit("setMeta", newMeta)
      commit("setSavedData", content)
      commit("setStatus", {saving:false})
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

      // Load data
      let data = null
      if(current) {
        commit("setStatus", {reloading:true})
        data = await Wn.Io.loadContent(current, {as:"jsonOrText"})
        commit("setStatus", {reloading:false})
      }

      // reset data
      commit("current", current)
      commit("setSavedData", data)
      commit("syncStatusChanged")

      // return the root state
      return state
    },
    //------------------------------------------
    /***
     * Reload content from remote
     */
    async reload({state, commit}, meta) {
      console.log("I am reload")
      if(state.status.reloading){
        return
      }

      // Use the default meta
      if(!meta) {
        meta = state.meta
      }
      
      // Declare to loading
      commit("setStatus", {reloading:true})
      

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

      // Make sure current exists in files
      if(current) {
        // current must exists in files
        let current2 = null
        for(let f of files) {
          if(f.id == current.id) {
            current2 = f
            break;
          }
        }
        current = current2
      }
      // Default current
      if(!current && files.length>0) {
        current = files[0]
      } 
      // Reload the content
      if(current) {
        data = await Wn.Io.loadContent(current, {as:"jsonOrText"})        
      }
      // reset data
      commit("setMeta", meta)
      commit("setFiles", files)
      commit("setData", data)
      commit("setSavedData", data)
      commit("setCurrent", current)
      commit("syncStatusChanged")
      _.delay(()=>{
        commit("setStatus", {reloading:false})
      }, 300)

      // return the root state
      return state
    }
  }
  //.....................................
}
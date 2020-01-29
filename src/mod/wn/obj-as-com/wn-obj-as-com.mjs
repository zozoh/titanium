// Ti required(Wn)
//---------------------------------------
export default {
  mutations : {
    setMeta(state, meta) {
      state.meta = meta || {}
    },
    setComType(state, comType) {
      state.comType = comType
    },
    setComConf(state, comConf) {
      state.comConf = comConf || {}
    },
    mergeComConf(state, comConf) {
      state.comConf = _.assign({}, state.comConf, comConf)
    },
    setDispatchActions(state, dispatchActions) {
      state.dispatchActions = dispatchActions || {}
    },
    setData(state, data) {
      state.data = _.cloneDeep(data)
    },
    setSavedData(state, data) {
      state.__saved_data = data
    },
    mergeData(state, data) {
      state.data = Ti.Util.deepMergeObj({}, state.data, data)
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    syncStatusChanged(state){
      state.status.changed = !_.isEqual(state.data, state.__saved_data)
    }
  },
  //.....................................
  actions : {
    //-------------------------------------
    updatePair({dispatch}, {name, value}={}) {
      if(!_.isUndefined(name) && !_.isNull(name)) {
        dispatch("update", {[name]:value})
      }
    },
    //-------------------------------------
    /***
     * Update the data and `status.changed`
     */
    update({commit}, data={}){
      // Array : replace
      if(_.isArray(data)) {
        commit("setData", data)
        commit("syncStatusChanged")
      }
      // Object : merge
      else if(!_.isEmpty(data)) {
        commit("mergeData", data)
        commit("syncStatusChanged")
      }
    },
    //-------------------------------------
    updateComConf({commit}, comConf) {
      commit("mergeComConf", comConf)
      commit("syncStatusChanged")
    },
    //-------------------------------------
    /***
     * Handle the action dispatching.
     * 
     * One action should be defined in `[page].json#actions`:
     * 
     * ```js
     * {
      *    action : "xx/xx",
      *    payload : {} | [] | ...
      * }
      * ```
      * 
      * @param action{String} - action name like `page/showBlock`
      * @param payload{Object|Array} - action payload, defined in `json` file
      * @param args{Array} - the dynamic information emitted by `[Com].$emit`
      * @param autoDestructArgs{Boolean} - If trusy, one element `args` will be unwrapped.
      * @param autoJoinArgs{Boolean} - If trusy, 
      *    it will auto join `args` to `payload` by `payload` type:
      *   - `null` or `undeinfed` : replace `payload` by `args`
      *   - `Object` : set `payload.args = args`
      *   - `Array`  : concat to the tail of `payload`
      * 
      * @return {void}
      */
     async doAction({state, dispatch}, {
       action, 
       payload, 
       args=[],
       autoDestructArgs = true
     }={}){
       //....................................
       if(!action)
         return;
       //....................................
       // auto destruc args
       if(autoDestructArgs 
         &&_.isArray(args) 
         && args.length == 1) {
         args = args[0]
       }
       //....................................
       // auto join args
       let pld1 = payload;
 
       // Use args directrly cause payload without defined
       if(_.isUndefined(payload) || _.isNull(payload)) {
         pld1 = _.cloneDeep(args)
       }
       //....................................
       // Explain payload
       let context = _.assign({}, state, {
         $args : args
       })
       let pld2 = Ti.Util.explainObj(context, pld1, {
         evalFunc : true
       })
       //....................................
       console.log("invoke->", {action, payload:pld2})
       await dispatch(action, pld2)
     },
    /***
     * Save content to remote
     */
    async save({state, commit}) {
      if(state.status.saving){
        return
      }

      let meta = state.meta
      let data = state.data
      let json = JSON.stringify(data, null, '   ')
      commit("setStatus", {saving:true})
      let newMeta = await Wn.Io.saveContentAsText(meta, json)

      commit("setMeta", newMeta)
      commit("setSavedData", data)
      commit("syncStatusChanged")
      commit("setStatus", {saving:false})

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
      
      if(!meta || !meta.com)
        return
      
      // Mark status
      commit("setMeta", meta)
      commit("setStatus", {reloading:true})

      // Load com setup
      let comMeta = await Wn.Io.loadMeta(meta.com)
      if(!comMeta) {
        Ti.Alert({
          text : "Fail to Load ${path}", 
          vars : {path:meta.com}
        }, {
          type : "error",
          icon : "warn"
        })
        commit("setStatus", {reloading:false})
        return
      }
      let com = await Wn.Io.loadContent(comMeta, {as:"json"})

      // Load data
      let data = await Wn.Io.loadContent(meta, {as:"json"})

      // Update 
      commit("setComType", com.comType)
      commit("setComConf", com.comConf)
      commit("setDispatchActions", com.dispatchActions)
      commit("setData", data)
      commit("setSavedData", data)
      commit("syncStatusChanged")
      commit("setStatus", {reloading:false})

      // return the root state
      return state
    }
  }
  //.....................................
}
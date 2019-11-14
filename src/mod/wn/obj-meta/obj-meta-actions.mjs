export default {
  //--------------------------------------------
  async updateMeta({state, commit}, {name, value}={}) {
    //console.log("I am update", name, value)
    let data = Ti.Types.toObjByPair({name, value})

    // Check Necessary
    if(_.isMatch(state.meta, data)) {
      return
    }

    // Do the update
    commit("setStatus", {saving:true})
    commit("setFieldStatus", {name, status:"spinning"})
    let json = JSON.stringify(data)
    let oid = state.meta.id
    let cmdText = `obj 'id:${oid}' -ocqn -u`
    let newMeta = await Wn.Sys.exec2(cmdText, {input:json, as:"json"})

    commit("setMeta", newMeta)
    commit("clearFieldStatus", name)
    commit("setStatus", {saving:false})

    return newMeta
  },
  //--------------------------------------------
  /***
   * Get obj by ID
   */
  async loadMetaById({dispatch}, id) {
    dispatch("loadMeta", `id:${id}`)
  },
  //--------------------------------------------
  /***
   * Get obj meta by path string
   */
  async loadMeta({state, commit}, str){
    // If wihtout ID reset
    if(!str) {
      commit("reset")
    }
    // Load from server
    else {
      commit("setStatus", {reloading:true})
      let meta = await Wn.Io.loadMeta(str)
      commit("setMeta", meta)
      commit("setStatus", {reloading:false})
    }
  },
  //--------------------------------------------
  /***
   * Get obj ancestors by meta
   */
  async loadAncestors({state, commit}, meta=state.meta) {
    commit("setStatus", {reloading:true})
    let ancestors = await Wn.Io.loadAncestors("id:"+meta.id)
    let parent = _.last(ancestors)
    commit("setMeta", meta)
    commit("setParent", parent)
    commit("setAncestors", ancestors)
    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  /***
   * Load obj meta/ancestors/children/content
   * 
   * @param str{String|Object} : string as the path,
   *        object is the meta
   */
  async reload({state, dispatch}, str) {
    if(_.isString(str)) {
      await dispatch("loadMeta", str)
      await dispatch("loadAncestors")
    }
    // Object as the meta object
    else if(_.isPlainObject(str)) {
      await dispatch("loadAncestors", str)
    }
    // return the curent meta anyway
    return state.meta
  }
  //--------------------------------------------
}
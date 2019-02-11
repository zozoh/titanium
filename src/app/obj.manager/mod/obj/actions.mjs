// Ti required(Wn)
//---------------------------------------
export default {
  /***
   * Get obj by ID
   */
  async loadMetaById({state, commit}, id) {
    // If wihtout ID reset
    if(!id) {
      commit("reset")
    }
    // Load from server
    else {
      let meta = await Wn.Io.loadMetaById(id)
      commit("set", {meta})
    }
  },
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
      let meta = await Wn.Io.loadMeta(str)
      commit("set", {meta})
    }
  },
  /***
   * Get obj ancestors by meta
   */
  async loadAncestors({state, commit}, meta) {
    let ancestors = await Wn.Io.loadAncestors("id:"+meta.id)
    let parent = _.last(ancestors)
    commit("set", {parent, ancestors})
  },
  /***
   * Get obj children by meta
   */
  async loadChildren({state, commit}, {
    meta, skip, limit, sort, mine, match
  }) {
    if('DIR' != meta.race) {
      commit("set", null)
      return
    }
    let children = await Wn.Io.loadChildren(meta, {
      skip, limit, sort, mine, match})
    commit("set", {children})
  },
  /***
   * Get obj content by meta:
   * 
   * - `text`  : PureText
   * - `json`  : JSON Object
   * - `image` : SHA1 finger
   * - `DIR`   : null
   */
  async loadContent({state, commit}, meta) {
    let content = await Wn.Io.loadContent(meta)
    commit("set", {content})
  },
  /***
   * Load obj meta/ancestors/children/content
   */
  async reload({state, commit}, str) {
    let meta = await Wn.Io.loadMeta(str)

    let ancestors = await Wn.Io.loadAncestors("id:"+meta.id)
    let parent    = _.last(ancestors)
    
    let children  = null;
    if('DIR' == meta.race) {
      children = await Wn.Io.loadChildren(meta)
    }
    
    let content = await Wn.Io.loadContent(meta)

    commit("set", {
      meta, parent, ancestors, children, content
    })
  }
}
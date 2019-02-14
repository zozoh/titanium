// Ti required(Wn)
//---------------------------------------
export default {
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
export default {
  //----------------------------------------
  /***
   * Append the `meta` to current tree. 
   * It will auto load all the ancestor node of the meta in tree
   */ 
  async appendNode({state, commit, dispatch}, meta) {
    
  },
  //----------------------------------------
  /***
   * Reload children of specific node. 
   * If current is leaf, it will skip the children reloading.
   * 
   * @param id{String} - the node id. higher priority then `path`
   * @param path{String|Array} - the node path
   * @param self{Boolean} - reload self or not.
   * @param force{Boolean} - reload again event the children had been loaded.
   * @param depth{Number} - reload the multi hierarchies if great than `1`
   */
  async reloadNode({state, commit, dispatch}, {
    id,
    path,
    self=false,
    force=false,
    depth=1
  }={}) {
    
  },
  //----------------------------------------
  /***
   * Reload site root node, and reload the first leave
   */
  async reloadRoot({state, commit, dispatch}, meta) {
    
  }
  //----------------------------------------
}
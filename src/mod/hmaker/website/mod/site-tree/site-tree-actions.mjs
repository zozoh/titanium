export default {
  //----------------------------------------
  /***
   * Append the `meta` to current tree. 
   * It will auto load all the ancestor node of the meta in tree
   */ 
  async appendNode({state, commit, dispatch}, meta) {
    console.log("TODO appendNode", meta)
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
    //......................................
    // Clone the tree
    let treeRoot = _.cloneDeep(state.root)
    let loaded = false
    //......................................
    // Find the node
    let node;
    if(!_.isUndefined(id)) {
      node = Ti.Trees.getNodeById(treeRoot, id)
    }
    // By Path
    else {
      node = Ti.Trees.getNodeByPath(treeRoot, path)
    }
    //......................................
    // Guard
    if(!node) {
      return
    }
    //......................................
    // Reload self
    if(self) {
      let nodeMeta = await Wn.Io.loadMetaById(node.id)
      node.rawData = nodeMeta
      loaded = true
    }
    //......................................
    // Define the loading
    const __load_subs = async (node, depth)=>{
      if(depth > 0 && !node.leaf) {
        depth --;
        if(force || _.isEmpty(node.children)) {
          let children = []
          let {list} = await Wn.Io.loadChildren(node.rawData)
          for(let li of list) {
            let sub = Wn.Util.wrapTreeNode(li)
            await __load_subs(sub, depth)
            children.push(sub)
          }
          node.children = children
          return true
        }
      }
      return false
    }
    //......................................
    // Do load
    loaded |= await __load_subs(node, depth)
    //......................................
    // Update the whole tree
    if(loaded) {
      commit("setRoot", treeRoot)
    }
  },
  //----------------------------------------
  /***
   * Reload site root node, and reload the first leave
   */
  async reloadRoot({state, commit, dispatch}, meta) {
    let root = Wn.Util.wrapTreeNode(meta)

    // Update Root Node
    commit("setRoot", root)

    // Reload Root Node
    await dispatch("reloadNode")

    // Reload The Opened Node
    if(!_.isEmpty(state.root.children)) {
      let keys = _.keys(state.openedNodePaths).sort()
      for(let key of keys) {
        let hie = Ti.Trees.getByPath(state.root, key)
        if(hie && !hie.node.leaf) {
          //console.log("reloadNode", hie.path)
          await dispatch("reloadNode", {
            path : hie.path
          })
        }
      }
    }

    // Append The Current Node
    if(state.currentId) {
      // Check if it had already loaded
      let hie = Ti.Trees.getNodeById(state.root, state.currentId)
      // Do reload it
      if(!hie) {
        let meta = await Wn.Io.loadMetaById(state.currentId)
        await dispatch("appendNode", meta)
      }
    }
  }
  //----------------------------------------
}
export default {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setRoot(state, root=null) {
      if(!_.isEqual(state.root, root)) {
        state.root = root
      }
    },
    //----------------------------------------
    setCurrentId(state, currentId=null) {
      state.currentId = currentId
    },
    //----------------------------------------
    setOpenedNodePaths(state, openedNodePaths={}) {
      state.openedNodePaths = openedNodePaths
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setRoot(state, node=null) {
      state.root = node
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
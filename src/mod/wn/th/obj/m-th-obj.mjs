//---------------------------------------
export default {
  getters: {
    //--------------------------------------------
    isMetaInRecycleBin(state) {
      return -1 == _.get(state.meta, "th_live")
    }
    //--------------------------------------------
  }
}
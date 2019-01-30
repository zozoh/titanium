// Ti required(Wn)
//---------------------------------------
export default {
  /***
   * Get obj by ID
   */
  async getById({state, commit}, id) {
    // If wihtout ID reset
    if(!id) {
      commit("reset")
    }
    // Load from server
    else {
      let meta = await Wn.Io.getById(id)
      commit("set", {meta})
    }
  },
  /***
   * Get obj meta by path string
   */
  async fetch({state, commit}, str){
    // If wihtout ID reset
    if(!str) {
      commit("reset")
    }
    // Load from server
    else {
      let meta = await Wn.Io.fetch(str)
      commit("set", {meta})
    }
  }
}
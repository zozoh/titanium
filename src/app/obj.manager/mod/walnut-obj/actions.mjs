export default {
  async getById({state, commit}, id) {
    // If wihtout ID reset
    if(!id) {
        commit("reset")
        return
    }
    // Load from server
  }
}
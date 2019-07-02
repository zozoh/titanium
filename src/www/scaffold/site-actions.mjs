export default {
  //-------------------------------------
  async navToPage({state}, payload) {
    console.log("navToPage::", payload)
  },
  //-------------------------------------
  async reload({state}) {
    console.log("I am reload", state.entryPage)
  }
  //-------------------------------------
}
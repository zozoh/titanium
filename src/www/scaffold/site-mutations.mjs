export default {
  //-------------------------------------
  setCurrentPage(state, page) {
    state.page = page
  },
  //-------------------------------------
  setPageShown(state, {name,show=false}={}) {
    if(state.page && state.page.shown && name) {
      state.page.shown[name] = show
    }
  },
  //-------------------------------------
  setLoading(state, loading) {
    state.loading = loading
  }
  //-------------------------------------
}
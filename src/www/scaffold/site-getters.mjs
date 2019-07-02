export default {
  //-------------------------------------
  siteBase(state) {
    return state.base
  },
  //-------------------------------------
  // Site Level Navigation
  navigation(state) {
    return state.nav
  },
  //-------------------------------------
  // Site Action Mapping
  actions(state) {
    // Global
    let map = _.assign({}, state.actions)
    let page = state.page
    if(page) {
      _.assign(map, page.actions)
    }
    return map
  },
  //-------------------------------------
  // Current Page GUI Setup
  pageGUI(state, getters) {
    let page = state.page
    // Without current page
    if(!page) {
      return {}
    }
    // Gen the GUI object
    let gui = {
      loadingAs : state.loading,
      schema : {},
      shown  : {}
    }
    // Add layout
    if(page.layout) {
      _.assign(gui, page.layout)
    }
    // Schema
    if(page.schema) {
      _.assign(gui.schema, page.schema)
    }
    // Shown for each block
    if(page.shown) {
      _.assign(gui.shown, page.shown)
    }
    // Done
    return gui
  }
  //-------------------------------------
  //-------------------------------------
}
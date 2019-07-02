export default {
  ////////////////////////////////////////////////
  mutations : {
    //--------------------------------------------
    set(state, all) {
      _.assign(state, all)
      _.defaults(state, {
        "title" : "Untitled",
        "data" : {},
        "layout" : {
          "type" : "rows",
          "blocks" : []
        },
        "shown" : {},
        "schema" : {},
        "actions" : {}
      })
    },
    //--------------------------------------------
    setTitle(state, title) {
      state.title = title
    },
    //--------------------------------------------
    setData(state, data) {
      _.assign(state.data, data)
    },
    //--------------------------------------------
    setLayout(state, layout) {
      state.layout = layout
    },
    //--------------------------------------------
    setShown(state, shown) {
      _.assign(state.shown, shown)
    },
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  actions : {
    //--------------------------------------------
    showBlock({state, commit}, name) {
      commit("setShown", {[name]:true})
    },
    //--------------------------------------------
    hideBlock({state, commit}, name) {
      commit("setShown", {[name]:false})
    },
    //--------------------------------------------
    async reload({state}, {}) {
      console.log("I am reload", state.entryPage)
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}
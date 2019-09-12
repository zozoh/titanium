//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    setHome(state, home) {
      state.home = home
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    setSchema(state, schema) {
      state.schema = schema
    },
    setLayout(state, layout) {
      state.layout = _.pick(layout, ["desktop","tablet","phone"])
      state.shown = layout.shown || {}
    },
    setActions(state, actions) {
      state.actions = actions
    },
    updateShown(state, shown) {
      state.shown = _.assign({}, state.shown, shown)
    }
  }
  ////////////////////////////////////////////
}
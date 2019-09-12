//---------------------------------------
export default {
  ////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
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
      state.listOpen = layout.listOpen || {}
    },
    setActions(state, actions) {
      state.actions = actions
    },
    updateShown(state, shown) {
      if(shown && !_.isEmpty(shown)) {
        state.shown = _.assign({}, state.shown, shown)
      }
    }
  }
  ////////////////////////////////////////////
}
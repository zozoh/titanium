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
    mergeSchema(state, schema) {
      state.schema = _.merge({}, state.schema, schema)
    },
    setLayout(state, layout) {
      state.layout = _.pick(layout, ["desktop","tablet","phone"])
      state.shown = layout.shown || {}
      state.listOpen = layout.listOpen || {}
    },
    setActions(state, actions) {
      state.actions = actions
    },
    mergeShown(state, shown) {
      if(shown && !_.isEmpty(shown)) {
        state.shown = _.assign({}, state.shown, shown)
      }
    },
    persistShown(state) {
      if(state.meta && state.meta.id) {
        Ti.Storage.session.setObject(`${state.meta.id}-shown`, state.shown)
      }
    },
    restoreShown(state) {
      if(state.meta && state.meta.id) {
        let shown = Ti.Storage.session.getObject(`${state.meta.id}-shown`)
        state.shown = _.assign({}, state.shown, shown)
      }
    }
  }
  ////////////////////////////////////////////
}
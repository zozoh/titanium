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
      state.layout = layout
    },
    setActions(state, actions) {
      state.actions = actions
    }
  }
  ////////////////////////////////////////////
}
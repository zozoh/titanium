export default {
  getters : {
    get : (state) => state
  },
  mutations : {
    set(state, {
      ancestors, parent, children, meta, content, contentType
    }={}) {
      Ti.Util.setTo(state, {ancestors, children}, [])
      Ti.Util.setTo(state, {parent, meta, content, contentType}, null)
    }
  }
}
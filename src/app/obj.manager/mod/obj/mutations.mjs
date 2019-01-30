export default {
  /***
   * Reset the state to default
   */
  reset(state) {
    _.assign(state, {
      "ancestors" : [], 
      "parent" : null, 
      "children" : [],
      "meta": null,
      "content": null,
      "contentType": null
    })
  },
  /***
   * Update the state 
   */
  set(state, {
    ancestors, parent, children, meta, content, contentType
  }={}) {
    Ti.Util.setTo(state, {ancestors, children}, [])
    Ti.Util.setTo(state, {parent, meta, content, contentType}, null)
  }
}
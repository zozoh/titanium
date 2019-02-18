export default {
  /***
   * Reset the state to default
   */
  reset(state) {
    _.assign(state, {
      "meta": null,
      "children" : [],
      "pager" : {
        "pageNumber" : -1,
        "pageSize" : -1,
        "pageCount" : -1,
        "totalCoun" : -1
      }
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
  },
  /***
   * Make item selected
   */
  selectItem(state, index) {
    let list = state.children 
    let it   = list[index];
    let _is  = it.__is || {}
    _is.selected = true
    it.__is = _is
    //state.children = [].concat(list)
    Vue.set(list, index, it)
  }
}
export default {
  /***
   * Reset the state to default
   */
  reset(state) {
    _.assign(state, {
      "meta": null,
      "children" : [],
      "currentIndex" : 0,
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
    // It really need to reset the current index if the children changed
    if(children) {
      state.currentIndex = 0
    }
  },
  /***
   * Make item selected
   * 
   * @param index{Integer} : the item should be selected (0 base)
   * @param mode{String} : 3 kinds mode:
   *   - "active" : just on item should be selected
   *   - "shift"  : make items selected betwen the last selected item and current one
   *   - "toggle" : toggle current on selection
   */
  selectItem(state, {index, mode="active"}={}) {
    let list = state.children 
    // Shift mode may mutate multiple items in scope
    if('shift' == mode) {
      let min = Math.min(index, state.currentIndex)
      let max = Math.max(index, state.currentIndex)
      for(let i=0; i<list.length; i++) {
        if(i>=min && i<=max) {
          let it = list[i]
          let _is  = it.__is || {}
          _is.selected = true
          it.__is = _is
        }
      }
    }
    // Toggle mode need to mutate single one item
    else if('toggle' == mode){
      let it   = list[index];
      let _is  = it.__is || {}
      _is.selected = !_is.selected
      it.__is = _is
      // Vue.set(list, index, it)
    }
    // Active mode need to keep only one item selected
    else if('active' == mode) {
      for(let i=0; i<list.length; i++) {
        let it = list[i]
        let _is  = it.__is || {}
        _is.selected = (i == index)
        it.__is = _is
      }
    }
    // invalid mode
    else {
      throw Ti.Err.make("e-mod-wnObjExplorer-selecItem-invalidMode", mode)
    }
    // Update state
    state.children = [].concat(list)
    state.currentIndex = index
  },
  /***
   * Make item blur
   */
  blurAll(state) {
    for(let it of state.children) {
      if(it.__is && it.__is.selected) {
        it.__is.selected = false
      }
    }
    state.children = [].concat(state.children)
  }
}
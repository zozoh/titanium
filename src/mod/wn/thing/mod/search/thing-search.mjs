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
    setFilter(state, filter) {
      state.filter = filter
    },
    setSorter(state, sorter) {
      state.sorter = sorter
    },
    setPager(state, pager) {
      state.pager = pager
    },
    setList(state, list) {
      state.list = list
    },
    //---------------------------------------------------
    /***
     * Make item selected
     * 
     * @param index{Integer} : the item should be selected (0 base)
     * @param mode{String} : 3 kinds mode:
     *   - "active" : just on item should be selected
     *   - "shift"  : select items between the last selected item and given one
     *   - "toggle" : toggle current on selection
     */
    selectItem(state, {index, id, mode="active"}={}) {
      let list = state.list 
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
        throw Ti.Err.make("e-mod-WnObjExplorer-selecItem-invalidMode", mode)
      }
      // Update state
      state.list = [].concat(list)
      state.currentIndex = index
      state.currentId = id
    },
    //---------------------------------------------------
    setSelected(state, items=[]) {
      // Loop All Items
      let list = state.list 
      for(let it of list) {
        let _is  = it.__is || {}
        _is.selected = _.findIndex(items, (it2)=>it2.id == it.id) >= 0
        it.__is = _is
      }
      // Update state
      state.list = [].concat(list)
      state.currentIndex = 0
      state.currentId = items.length > 0 ? items[0].id : null
    },
    //---------------------------------------------------
    selectAll(state) {
      // Loop All Items
      let list = state.list 
      for(let it of list) {
        let _is  = it.__is || {}
        _is.selected = true
        it.__is = _is
      }
      // Update state
      state.list = [].concat(list)
      state.currentIndex = 0
      state.currentId = list.length > 0 ? list[0].id : null
    },
    //---------------------------------------------------
    /***
     * Make item blur
     */
    blurAll(state) {
      for(let it of state.list) {
        if(it.__is && it.__is.selected) {
          it.__is.selected = false
        }
      }
      state.list = [].concat(state.list)
      state.currentIndex = 0
      state.currentId = null
    }
  }
  ////////////////////////////////////////////
}
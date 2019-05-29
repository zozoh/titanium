export default {
  //---------------------------------------------------
  selectedItems(state) {
    let list = []
    for(let it of state.children) {
      if(it.__is && it.__is.selected) {
        list.push(it)
      }
    }
    return list
  },
  //---------------------------------------------------
  activeItem(state) {
    if(state.currentIndex>=0 && state.currentId) {
      let it = state.children[state.currentIndex]
      if(it.id == state.currentId) {
        return it
      }
    }
    return null
  }
  //---------------------------------------------------
}
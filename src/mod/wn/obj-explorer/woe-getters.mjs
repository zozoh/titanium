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
  }
  //---------------------------------------------------
}
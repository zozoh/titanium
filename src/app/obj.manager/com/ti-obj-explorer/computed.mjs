export default {
  objList() {
    let vm = this
    let list = vm.data.children
    let re = []
    //..........................
    for(let it of list) {
      re.push({
        id      : it.id,
        title   : it.nm,
        preview : Wn.Util.genPreviewObj(it),
        ...(it.__is || {
          loading : false,
          process : -1,
          selected : false
        }),
        icons : it.__icons || {
          NW : null,
          NE : null,
          SW : null,
          SE : null
        }
      })
    }
    return re
  }
}
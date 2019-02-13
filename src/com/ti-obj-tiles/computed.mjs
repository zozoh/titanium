export default {
  tilesUlClass() {
    let vm = this
    return {
      ["ti-spacing-" + vm.spacing] : true
    }
  },
  itemStyle() {
    let vm = this
    return {
      "width" : Ti.Css.toSize(vm.itemWidth)
    }
  }
}
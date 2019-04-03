export default {
  props : {
    // The list to be rendered
    list : {
      type : Array,
      default : ()=>[]
    },
    // aspect: list item spacing
    // `xs|sm|md|lg|xl`
    spacing : {
      type : String,
      default : "sm"
    },
    // Drop -> emmit("drop", file)
    droppable : {
      type : Boolean,
      default : false
    },
    // multi-selectable
    // effected when selectable is true
    multi : {
      type : Boolean,
      default : false
    },
    // select item
    selectable : {
      type : Boolean,
      default : true
    },
    // rename items, it will pass on to slot.default
    renameable : {
      type : Boolean,
      default : false
    }
  },
  computed : {
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
  },
  methods : {
    onThumbSelected({mode,id,index}={}){
      this.$emit("selected", {mode,id,index})
    },
    onThumbOpen({id,index}={}) {
      this.$emit("open", {id,index})
    },
    onThumbBlur() {
      this.$emit("blur")
    }
  }
}
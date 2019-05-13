export default {
  props : {
    // The list to be rendered
    "list" : {
      type : Array,
      default : ()=>[]
    },
    // aspect: list item spacing
    // `xs|sm|md|lg|xl`
    "spacing" : {
      type : String,
      default : "sm"
    },
    // multi-selectable
    // effected when selectable is true
    "multi" : {
      type : Boolean,
      default : false
    },
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    }
  },
  computed : {
    tilesUlClass() {
      let re = {}
      re["ti-spacing-" + this.spacing] = true
      return re
    },
    itemStyle() {
      let vm = this
      return {
        "width" : Ti.Css.toSize(vm.itemWidth)
      }
    },
    isEmpty() {
      return this.list.length == 0
    }
  },
  methods : {
    onThumbSelected({mode,id,index}={}){
      if(!this.selectable){
        return
      }
      if(!this.multi) {
        mode = "active"
      }
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
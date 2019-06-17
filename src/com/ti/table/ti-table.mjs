export default {
  props : {
    "idKey" : {
      type : String,
      default : "id"
    },
    //
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    // The list to be rendered
    "list" : {
      type : Array,
      default : ()=>[]
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
    isEmpty() {
      return this.list.length == 0
    }
  },
  methods : {
    onSelected({mode,id,index}={}){
      if(!this.selectable){
        return
      }
      if(!this.multi) {
        mode = "active"
      }
      this.$emit("selected", {mode,id,index})
    },
    onOpen({id,index}={}) {
      this.$emit("open", {id,index})
    },
    onBlur() {
      this.$emit("blur")
    }
  }
}
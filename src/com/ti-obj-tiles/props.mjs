export default {
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
}
export default {
  // The list to be rendered
  list : {
    type : Array,
    default : ()=>[]
  },
  // aspect: list item 
  itemWidth : {
    type : [String, Number],
    default : ""
  },
  // aspect: list item spacing
  // `xs|sm|md|lg|xl`
  spacing : {
    type : String,
    default : "sm"
  }
}
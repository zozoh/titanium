export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "title" : {
      type : String,
      default : null
    },
    "icon" : {
      type : String,
      default : null
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "name" : {
      type : String,
      default : null
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "size" : {
      type : [String,Number],
      default : "stretch"
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "position" : {
      type : String,
      default : "center/center"
    },
    "width" : {
      type : [String,Number],
      default : -1
    },
    "height" : {
      type : [String,Number],
      default : -1
    },
    "closer" : {
      type : String,
      default : "default"
    }
  },
  //////////////////////////////////////////
  computed : {
    hasTitle() {
      return this.title ? true : false
    },
    hasIcon() {
      return this.icon ? true : false
    },
    hasActions() {
      return !_.isEmpty(this.actions)
    },
    hasBody() {
      return this.body ? true : false
    },
    hasType() {
      return this.type ? true : false
    },
    formedBlockList() {
      return this.__formed_list(this.blocks)
    },
    formedPanelList() {
      return this.__formed_list(this.panels)
    }
  },
  //////////////////////////////////////////
  methods : {
    __formed_list(list=[]) {
      let list2 = []
      if(_.isArray(list)) {
        for(let b of list) {
          // Info

          // ComType
          if(b.body) {

          }
        }
      }
      return list2
    }
  }
  //////////////////////////////////////////
}
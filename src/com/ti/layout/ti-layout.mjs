export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  data : ()=>({
    currentBlockName : null
  }),
  ///////////////////////////////////////////
  props : {
    "type" : {
      type : String,
      default : "cols"
    },
    "border" : {
      type : Boolean,
      default : false
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "adjustable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////
  computed : {
    topClass() {
      let klass = [`as-${this.type}`]

      // Border
      if(this.border) {
        klass.push("show-border")
      }

      // Output class names
      return klass.join(" ")
    },
    tabItems() {
      // Make sure one tab items has to been the current
      this.autoCurrentBlockName()
      // Formed list
      let list = []
      for(let b of this.blocks) {
        let text = b.title
        if(!text && !b.icon) {
          text = b.name
        }
        list.push({
          text,
          name : b.name,
          icon : b.icon,
          className : (this.currentBlockName == b.name)
              ? "is-current"
              : null
        })
      }
      console.log("tabItems", list)
      return list
    }
  },
  ///////////////////////////////////////////
  methods : {
    autoCurrentBlockName() {
      if('tabs' == this.type) {
        if(!this.currentBlockName && !_.isEmpty(this.blocks)){
          this.currentBlockName = this.blocks[0].name
        }
      }
    },
    setCurrentItem({name}={}) {
      this.currentBlockName = name
    }
  },
  ///////////////////////////////////////////

  ///////////////////////////////////////////
}
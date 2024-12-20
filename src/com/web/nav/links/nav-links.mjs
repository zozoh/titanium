export default {
  /////////////////////////////////////////
  data: ()=>({
    myOpenedIds: {}
  }),
  /////////////////////////////////////////
  props : {
    "align" : {
      type : String,
      default : "left",
      validator: v => /^(left|center|right)$/.test(v)
    },
    "spacing" : {
      type : String,
      validator: v => /^(tiny|comfy|wide)$/.test(v)
    },
    "border" : {
      type : String,
      default : "solid",
      validator: v => /^(none|solid|dashed|dotted)$/.test(v)
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass(
        `is-spacing-${this.spacing}`,
        `is-align-${this.align}`,
        ()=> {
          if(this.border)
            return `is-border-${this.border}`
        }
      )
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnChangeGroupOpened({idPath, opened}) {
      let ids = {}
      for(let id of idPath) {
        ids[id] = true
      }
      if(!opened) {
        ids[_.last(idPath)] = false
      }
      this.myOpenedIds = ids
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ///////////////////////////////////////////////////
  props : {
    // The data of current row, it will pick value from 
    // it by `@key`
    "data" : {
      type : Object,
      default : ()=>({})
    },
    // i18n string to present the field display text
    "title" : {
      type : String,
      default : null
    },
    // Array[{title,display}]
    "display" : {
      type : Array,
      default : ()=>[]
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    displayItems() {
      let list = []
      // Get items value
      for(let it of this.display) {
        let value
        if(_.isArray(it.key)) {
          value = _.pick(this.data, it.key)
        }
        // Get the value
        else {
          value = _.get(this.data, it.key)
        }
        // Transform
        if(it.transformer) {
          value = it.transformer(value)
        }
        // Join to list
        list.push({...it, value})
      }
      // Array to pick
      return list
    },
    //-----------------------------------------------
    cellKey() {
      let list = []
      for(let it of this.displayItems) {
        list.push(it.uniqueKey)
      }
      return list.join("+")
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    
  }
  ///////////////////////////////////////////////////
}
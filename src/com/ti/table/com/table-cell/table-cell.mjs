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
    // Auto wrap table, true:nowrap, false:wrap
    "nowrap" : {
      type : Boolean,
      default : false
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
    conClass() {
      return {
        "is-nowrap" : this.nowrap
      }
    },
    //-----------------------------------------------
    displayItems() {
      let list = []
      // Get items value
      for(let it of this.display) {
        let value
        if(_.isArray(it.key)) {
          value = _.pick(this.data, it.key)
        }
        // Statci value
        else if(/^'[^']+'$/.test(it.key)) {
          value = it.key.substring(1, it.key.length-1)
        }
        // Get the value
        else {
          value = _.get(this.data, it.key)
        }
        // Ignore the undefined/null
        if(_.isUndefined(value) || _.isNull(value)) {
          continue
        }
        // Transform
        if(it.transformer) {
          value = it.transformer(value)
        }
        // console.log(it.key, value)
        // Join to list
        list.push({...it, value})
      }
      //console.log(this.title, ":", list)
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
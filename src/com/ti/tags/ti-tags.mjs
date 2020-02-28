export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "mapping" : {
      type : Object,
      default : undefined
    },
    "itemOptions" : {
      type : Array,
      default : ()=>[]
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "cancelItemBubble" : {
      type : Boolean,
      default : false
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "itemIconBy" : {
      type : [String, Function],
      default : undefined
    },
    "optionDefaultIcon" : {
      type : String,
      default : undefined
    },
    "itemDefaultIcon" : {
      type : String,
      default : undefined
    },
    "removeIcon" : {
      type : String,
      default : "zmdi-close"
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      if(this.className)
        return this.className
    },
    //------------------------------------------------
    getTagItemIcon() {
      if(_.isFunction(this.itemIconBy)) {
        return it => this.itemIconBy(it)
      }
      if(_.isString(this.itemIconBy)) {
        return it => _.get(it, this.itemIconBy)
      }
      return it => null
    },
    //------------------------------------------------
    theData() {
      const list = []
      if(_.isArray(this.data)) {
        const lastIndex = this.data.length - 1
        _.forEach(this.data, (val, index)=>{
          let tag;
          // Auto mapping plain object
          if(_.isPlainObject(val)) {
            tag = this.mapping 
                    ? Ti.Util.mapping(val, this.mapping)
                    : _.cloneDeep(val)
            // Customized the icon
            if(!tag.icon) {
              tag.icon = this.getTagItemIcon(val)
            }
          }
          // Auto gen object for simple value
          else {
            tag = {text: val, value: val}
          }
          // Join default value
          _.defaults(tag, {
            index,
            icon    : this.itemDefaultIcon,
            options : this.itemOptions,
            atLast  : index == lastIndex
          })
          // Join to list
          list.push(tag)
        }); // _.forEach
      }
      return list
    },
    //------------------------------------------------
    theDataValues() {
      let list = []
      for(let it of this.theData) {
        list.push(Ti.Util.fallback(it.value, null))
      }
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onItemChanged(it={}) {
      if(it.index >= 0) {
        this.$emit("piece:changed", it)
        let values = _.concat(this.theDataValues)
        values[it.index] = Ti.Util.fallback(it.value, null)
        this.$emit("changed", values)
      }
    },
    //------------------------------------------------
    onItemRemoved({index=-1}={}) {
      if(index >= 0) {
        let values = _.remove(this.theDataValues, (v,i)=>i!=index)
        this.$emit("changed", values)
      }
    },
    //------------------------------------------------
    onItemFired({index=-1}={}) {
      if(index >= 0) {
        let it = _.nth(this.theData, index)
        if(it) {
          this.$emit("item:actived", it)
        }
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
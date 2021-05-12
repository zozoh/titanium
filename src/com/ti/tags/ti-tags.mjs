export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    myTags   : [],
    myValues : []
  }),
  ////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value" : {
      type : [Array, String],
      default : ()=>[]
    },
    "dict" : {
      type : [String, Ti.Dict],
      default : null
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
    "removable" : {
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
    TopClass() {
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
    //--------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          return this.dict
        }
        // Get back
        let {name} = Ti.DictFactory.explainDictName(this.dict)
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnItemChanged({index, value}={}) {
      if(index >= 0) {
        let values = this.getMyValues()
        values[index] = Ti.Util.fallback(value, null)
        this.$notify("change", values)
      }
    },
    //------------------------------------------------
    OnItemRemoved({index}={}) {
      if(index >= 0) {
        let values = this.getMyValues()
        _.pullAt(values, index)
        this.$notify("change", values)
      }
    },
    //------------------------------------------------
    OnItemFired({index=-1}={}) {
      if(index >= 0) {
        let it = _.nth(this.theData, index)
        if(it) {
          this.$notify("item:actived", it)
        }
      }
    },
    //------------------------------------------------
    async evalMyData() {
      const tags = []
      let list;
      if(_.isArray(this.value)) {
        list = this.value
      } else if(_.isString(this.value)) {
        list = _.without(this.value.split(","), "")
      } else {
        list = []
      }
      if(!_.isEmpty(list)) {
        const lastIndex = list.length - 1
        for(let index=0; index<list.length; index++){
          let val = list[index]
          console.log(index, val)
          let tag;
          // Auto mapping plain object
          if(_.isPlainObject(val)) {
            tag = this.mapping 
                    ? Ti.Util.translate(val, this.mapping)
                    : _.cloneDeep(val)
            // Customized the icon
            if(!tag.icon) {
              tag.icon = this.getTagItemIcon(val)
            }
          }
          // Lookup Dict
          else if(this.Dict) {
            let it = await this.Dict.getItem(val)
            tag = _.defaults({
              icon  : this.Dict.getIcon(it),
              text  : this.Dict.getText(it) || val,
              value : val
            })
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
          // Join to tags
          tags.push(tag)
        }; // _.forEach
      }
      // assign the tags
      this.myTags = tags
    },
    //------------------------------------------------
    getMyValues() {
      const vals = []
      for(let tag of this.myTags) {
        vals.push(Ti.Util.fallback(tag.value, null))
      }
      return vals
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "evalMyData",
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}
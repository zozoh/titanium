/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data: ()=>({
    cellItems : []
  }),
  ///////////////////////////////////////////////////
  props : {
    "className" : null,
    "index" : {
      type : Number,
      default : -1
    },
    "rowId" : {
      type : String,
      default : null
    },
    "cellSize" : {
      type : Number,
      default : 0
    },
    "title" : {
      type : String,
      default : null
    },
    "nowrap" : {
      type : Boolean,
      default : true
    },
    "display" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "isCurrent" : {
      type : Boolean,
      default : false
    },
    "isHover" : {
      type : Boolean,
      default : false
    },
    "isChecked" : {
      type : Boolean,
      default : false
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-nowrap" : this.nowrap
      }, this.className)
    },
    //-----------------------------------------------
    topStyle() {
      if(this.cellSize > 0) {
        return Ti.Css.toStyle({
          "width" : this.cellSize
        })
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalCellDisplayItems() {
      let items = []
      // Eval each items
      for(let displayItem of this.display) {
        let it = await this.evalDataForFieldDisplayItem(this.data, displayItem)
        if(it) {
          items.push(it)
        }
      }
      // Update and return
      this.cellItems = items

      // make table resizing
      this.$parent.$parent.debounceEvalEachColumnSize()

      // Then return
      return items;
    },
    //-----------------------------------------------
    async evalDataForFieldDisplayItem(itemData={}, displayItem={}) {
      let value = displayItem.defaultAs;
      //.....................................
      // Array -> Obj
      if(_.isArray(displayItem.key)) {
        value = _.pick(itemData, displayItem.key)
      }
      // String ...
      else if(_.isString(displayItem.key)){
        // Statci value
        if(/^'[^']+'$/.test(displayItem.key)) {
          value = displayItem.key.substring(1, displayItem.key.length-1)
        }
        // Dynamic value
        else {
          value = Ti.Util.fallback(_.get(itemData, displayItem.key), value)
        }
      }
      //.....................................
      // TODO it should be removed
      if(displayItem.dict) {
        if(!Ti.Util.isNil(value)) {
          value = await Wn.Dict.get(displayItem.dict, value)
        }
      }
      //.....................................
      // Transformer
      if(_.isFunction(displayItem.transformer)) {
        //console.log("do trans")
        // Sometimes, we need transform nil also
        if(!Ti.Util.isNil(value) || displayItem.transNil) {
          value = displayItem.transformer(value)
        }
      }
      // Ignore the undefined/null
      if(Ti.Util.isNil(value)) {
        if(Ti.Util.fallback(displayItem.ignoreNil, true)) {
          return
        }
      }
      //.....................................
      // Add value to comConf
      let reDisplayItem = _.cloneDeep(displayItem)
      let comConf = {}
      //.....................................
      // Customized comConf
      if(_.isFunction(displayItem.comConf)) {
        _.assign(comConf, displayItem.comConf(itemData))
      }
      //.....................................
      // Eval comConf
      else {
        _.forEach(displayItem.comConf || {}, (val, key)=>{
          //
          // VAL: evalue the special value
          //
          // "${=value}" : value from row data by key
          if("${=value}" == val) {
            val = value
          }
          // "${=isCurrent}" : parent row is actived
          else if("${=isCurrent}" == val) {
            val = this.isCurrent
          }
          // "${=isChecked}" : parent row is checked
          else if("${=isChecked}" == val) {
            val = this.isChecked
          }
          // "${=isHover}" : parent row is checked
          else if("${=isHover}" == val) {
            val = this.isHover
          }
          // "${=rowId}" : parent row ID
          else if("${=rowId}" == val) {
            val = this.rowId
          }
          // ".." : value for whole row data
          else if(".." == val) {
            val = itemData
          }
          // "${info.age}" : value from row data
          else if(_.isString(val)) {
            let m = /^(\((.+)\)\?)?(.+)$/.exec(val)
            if(m) {
              let preKey = _.trim(m[2])
              let tmpl = _.trim(m[3])
              //console.log("haha", preKey, tmpl)
              // Only `itemData` contains the preKey, render the value
              if(preKey) {
                if(_.get(itemData, preKey)) {
                  val = Ti.S.renderBy(tmpl, itemData)
                } else {
                  val = null
                }
              }
              // Always render the value
              else {
                val = Ti.S.renderBy(tmpl, itemData)
              }
            }
          }

          //
          // KEY: Set to `comConf`
          //
          // ... will extends all value to comConf
          if("..." == key) {
            _.assign(comConf, val)
          }
          // Just set the val
          else {
            comConf[key] = val
          }
        })
      }
      //.....................................
      // Set the default value key
      if(_.isUndefined(comConf.value)) {
        comConf.value = value
      }
      //.....................................
      reDisplayItem.comConf = comConf
      //.....................................
      reDisplayItem.uniqueKey = _.concat(reDisplayItem.key).join("-")
      //.....................................
      return reDisplayItem
    },
    //-----------------------------------------------
    onItemChanged(item, payload) {
      this.$emit('item:changed', {name:item.key, value:payload})
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "display" : async function() {
      await this.evalCellDisplayItems()
    },
    "data" : async function() {
      //console.log("data changed")
      await this.evalCellDisplayItems()
    },
    "isCurrent" : async function() {
      await this.evalCellDisplayItems()
    },
    "isChecked" : async function() {
      await this.evalCellDisplayItems()
    },
    "isHover" : async function() {
      await this.evalCellDisplayItems()
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    await this.evalCellDisplayItems()
  }
  ///////////////////////////////////////////////////
}
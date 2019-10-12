/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    displayItems : []
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
    }
    //-----------------------------------------------
    // cellKey() {
    //   let list = []
    //   for(let it of this.displayItems) {
    //     list.push(it.uniqueKey)
    //   }
    //   return list.join("+")
    // }
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalDisplayItems() {
      let list = []
      // Get items value
      for(let it of this.display) {
        let value;
        //.....................................
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
        //.....................................
        if(it.dict) {
          value = await Wn.Dict.get(it.dict, value)
        }
        //.....................................
        // Transform
        if(_.isFunction(it.transformer)) {
          //console.log("do trans")
          value = it.transformer(value)
        }
        //.....................................
        // Add value to comConf
        let it2 = {...it}
        let conf2 = {}
        let valueAssigned = false
        //.....................................
        _.forEach(it2.comConf || {}, (val, key)=>{
          // assign value
          if("=value" == key) {
            _.assign(conf2, value)
            valueAssigned = true
          }
          // set val
          else {
            conf2[key] = val
          }
        })
        //.....................................
        if(!valueAssigned) {
          conf2.value = value
        }
        //.....................................
        it2.comConf = conf2
        //.....................................
        // console.log(it.key, value)
        // Join to list
        list.push(it2)
        //.....................................
      } // ~ for(let it of this.display)
      //console.log(this.title, ":", list)
      // Array to pick
      this.displayItems = list
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    await this.evalDisplayItems()
  }
  ///////////////////////////////////////////////////
}
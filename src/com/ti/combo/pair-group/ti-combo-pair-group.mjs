const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    myFieldNames : [],
    myFieldMap  : {},
    myCurrentTabName : null
  }),
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    ValueObj() {
      if(Ti.Util.isNil(this.value)) {
        return {}
      }
      if(_.isString(this.value)) {
        return JSON.parse(this.value)
      }
      if(_.isPlainObject(this.value)) {
        return this.value
      }
      console.warn("Unsupported value object:", this.value)
    },
    //------------------------------------------------
    TheBlocks() {
      // Update Block Keys, add the key noexists in map
      let names = _.cloneDeep(this.myFieldNames)
      _.forEach(this.ValueObj, (block, key)=>{
        if(_.indexOf(names, key) < 0) {
          names.push(key)
        }
      })
      this.myFieldNames = names

      // Gen-block by keys
      let list = []
      for(let name of names) {
        let val = _.get(this.ValueObj, name)
        let field = _.get(this.myFieldMap, name) || {}
        // Explain block
        let b2 = Ti.Util.explainObj(val, {
          title : name,
          name  : name,
          ... _.pick(field, "title", "name", "icon"),
          body : {
            comType : field.comType || "ti-input-text",
            comConf : field.comConf || { value: "=.." }
          }
        })
        list.push(b2)
      }
      return list
    },
    //------------------------------------------------
    TheLayout() {
      return {
        type  : "tabs",
        tabAt : this.tabAt,
        blocks : this.TheBlocks
      }
    },
    //------------------------------------------------
    TheShown() {
      if(this.keepShownTo) {
        return
      }
      let shown = {}
      _.forEach(this.myFieldNames, name => {
        shown[name] = (name == this.myCurrentTabName)
      })
      return shown
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    __on_events(eventFullName, payload) {
      let [key, eventName] = eventFullName.split("::")
      //console.log(key, eventName, payload)
      // For Change
      if("change" == eventName && this.$parent) {
        return ()=>{
          let data = _.cloneDeep(this.ValueObj)
          _.set(data, key, payload)
          this.$parent.$notify("change", data)
          return true
        }
      }
      // Cancel others bubble
      return ()=>true
    },
    //------------------------------------------------
    OnShownUpdate(shown) {
      let keys = Ti.Util.truthyKeys(shown)
      this.myCurrentTabName = _.first(keys)
    },
    //------------------------------------------------
    evalBlocks() {
      let map = {}
      let keys = []
      _.forEach(this.fields, block => {
        map[block.name] = block
        keys.push(block.name)
      })
      this.myFieldNames = keys
      this.myFieldMap = map
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "blocks" : {
      handler : "evalBlocks",
      immediate : true
    }
    //-----------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;
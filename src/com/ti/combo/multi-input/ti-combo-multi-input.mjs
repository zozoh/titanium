export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    myDropStatus   : "collapse",
    myTags         : [],
    myFreeValues   : [],
    myFilterValue  : null,
    myOptionsData  : [],
    myCurrentId    : null,
    myCheckedIds   : {}
  }),
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    Values() {
      return Ti.S.toArray(this.value)
    },
    //------------------------------------------------
    InputTagValues() {
      return _.concat(this.myTags, this.myFreeValues)
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
    },
    //------------------------------------------------
    TheSuffixIcon() {
      return this.statusIcons[this.myDropStatus]
    },
    //------------------------------------------------
    DropComType() {return this.dropComType || "ti-list"},
    DropComConf() {
      return _.assign({
        display    : this.dropDisplay || "text",
        border     : this.dropItemBorder
      }, this.dropComConf, {
        data : this.myOptionsData,
        currentId  : this.myCurrentId,
        checkedIds : this.myCheckedIds,
        idBy       : this.GetValueBy,
        multi      : true,
        hoverable  : true,
        checkable  : true,
        autoCheckCurrent : false
      })
    },
    //------------------------------------------------
    Dict() {
      // Customized
      if(this.options instanceof Ti.Dict) {
        return this.options
      }
      // Auto Create
      return Ti.DictFactory.CreateDictBy(this.options, {
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnDropListInit($dropList){this.$dropList=$dropList},
    //------------------------------------------------
    async OnCollapse() {this.doCollapse()},
    //------------------------------------------------
    OnInputInputing(val) {
      if(this.filter) {
        this.myFilterValue = val
        this.debReload()
      }
    },
    //------------------------------------------------
    async OnInputChanged(val) {
      // Clean filter
      this.myFilterValue = null
      // Uniq 
      if(this.valueUnique) {
        if(_.indexOf(this.myFreeValues, val)>=0) {
          return
        }
        for(let tag of this.myTags) {
          let tagV = this.Dict.getValue(tag)
          if(tagV == val) {
            return
          }
        }
      }
      // Join to ...
      let it = await this.Dict.getItem(val)
      // Matched tag
      if(it) {
        this.myTags.push(it)
      }
      // Join to free value
      else if(val && !this.mustInList) {
        this.myFreeValues.push(val)
      }
      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    async OnInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnTagListChanged(vals=[]) {
      await this.evalMyTags(vals)
      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    async OnClickStatusIcon() {
      if(this.isExtended) {
        this.doCollapse()
      } else {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnDropListSelected({currentId, checkedIds}={}) {
      this.myCurrentId = currentId
      this.myCheckedIds = checkedIds

      let vals = Ti.Util.truthyKeys(checkedIds)
      await this.evalMyTags(_.concat(vals, this.myFreeValues))
      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    async doExtend() {
      this.myDropStatus = "extended"
      // Try reload options again
      if(_.isEmpty(this.myOptionsData)) {
        await this.reloadMyOptionData()
      }
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.myDropStatus = "collapse"
      if(!escaped) {
        this.tryNotifyChanged(escaped)
      }
    },
    //-----------------------------------------------
    tryNotifyChanged(escaped=false) {
      let vals = this.evalMyValues()
      if(!escaped && !_.isEqual(vals, this.Values)) {
        this.$emit("changed", vals)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    evalMyValues(tags=this.myTags, freeValues=this.myFreeValues) {
      let vals = []
      // Tags
      _.forEach(tags, tag => {
        let v = this.Dict.getValue(tag)
        if(!Ti.Util.isNil(v)) {
          vals.push(v)
        } else if (!this.mustInList) {
          vals.push(tag)
        }
      })
      // Ignore free values
      if(this.mustInList || _.isEmpty(freeValues)) {
        return vals
      }
      // Join free values
      return _.concat(vals, freeValues)
    },
    //-----------------------------------------------
    async evalMyTags(vals=this.Values) {
      let tags  = []
      let ids   = {}
      let frees = []
      for(let v of vals) {
        let tag = await this.Dict.getItem(v)
        if(tag) {
          tags.push(tag)
          ids[v] = true
        } else {
          frees.push(v)
        }
      }
      this.myTags = tags
      this.myFreeValues = frees
      this.myCheckedIds = ids
    },
    //-----------------------------------------------
    async reloadMyOptionData() {
      this.myOptionsData = await this.Dict.find(this.myFilterValue)
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      // If droplist is actived, should collapse it
      if("ENTER" == uniqKey) {
        if(this.$dropList && this.$dropList.isActived) {
          this.doCollapse()
          return {stop:true, quit:true}
        }
      }
      //....................................
      if("ARROWUP" == uniqKey) {
        if(this.$dropList) {
          this.$dropList.selectPrevRow({
            payload: {byKeyboardArrow: true}
          })
        }
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWDOWN" == uniqKey) {
        if(this.$dropList && this.isExtended) {
          this.$dropList.selectNextRow({
            payload: {byKeyboardArrow: true}
          })
        } else {
          this.doExtend()
        }
        return {prevent:true, stop:true, quit:true}
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "value" : {
      handler: async function(newVal, oldVal) {
        await this.evalMyTags()
      },
      immediate : true
    },
    //-----------------------------------------------
    "options" : {
      handler : async function(newVal, oldVal) {
        if(this.isExtended) {
          await this.reloadMyOptionData()
        } else {
          this.myOptionsData = []
        }
      },
      immediate : true
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  created : function() {
    this.debReload = _.debounce(val=>{
      this.reloadMyOptionData()
    }, this.delay)
  }
  ////////////////////////////////////////////////////
}
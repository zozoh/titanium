export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    myFilterValue : null,
    myOptionsData : [],
    can : {
      data : [],
      checkedIds : []
    },
    sel : {
      data : [],
      checkedIds : []
    },
    selIdMap : {}
  }),
  ///////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    Values() {
      if(_.isString(this.value)) {
        return _.without(this.value.split(/[,;，； \n]+/g), "")
      }
      return  _.filter(_.concat(this.value), (v)=>!Ti.Util.isNil(v))
    },
    //------------------------------------------------
    CanListComType() {return this.canComType || "ti-list"},
    SelListComType() {return this.selComType || "ti-list"},
    //------------------------------------------------
    CanListComConf() {
      return this.genComConf(this.canComConf, this.can)
    },
    SelListComConf() {
      return this.genComConf(this.selComConf, this.sel)
    },
    //------------------------------------------------
    FilterComConf() {
      return _.assign({
        trimed      : true,
        width       : "100%",
        prefixIcon  : "zmdi-filter-list",
        placeholder : "i18n:filter",
        hover       : ['prefixIcon','suffixText','suffixIcon']
      }, this.fltComConf)
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
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
        getIcon  : Ti.Util.genGetter(this.textBy  || "icon")
      })
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    OnCanListSelected({checkedIds}) {
      this.can.checkedIds = this.getIds(checkedIds)
    },
    //---------------------------------------------------
    OnSelListSelected({checkedIds}) {
      this.sel.checkedIds = this.getIds(checkedIds)
    },
    //---------------------------------------------------
    OnClickHeadChecker(list) {
      let {data, checkedIds} = list
      // All -> none
      if(data.length == checkedIds.length) {
        list.checkedIds = []
      }
      // Others to All
      else {
        let idMap = this.rebuildIdMap(data)
        list.checkedIds = this.getIds(idMap)
      }
    },
    //---------------------------------------------------
    async OnFilterChanged(val) {
      this.myFilterValue = val
      if(!Ti.Util.isNil(val)) {
        this.myOptionsData = await this.Dict.find(val) || []
      } else {
        this.myOptionsData = await this.Dict.findAll() || []
      }
      this.evalShownCanList()
    },
    //---------------------------------------------------
    GetHeadCheckerIcon({data, checkedIds}) {
      if(data.length > 0) {
        // All
        if(data.length == checkedIds.length) {
          return "fas-check-square"
        }
        // Partally
        if(checkedIds.length > 0) {
          return  "fas-minus-square"
        }
      }
      return "far-square" // none
    },
    //---------------------------------------------------
    // Core Actions
    //---------------------------------------------------
    canListToSel() {
      // Guard
      if(_.isEmpty(this.can.checkedIds))
        return
      // Assign
      let {src, tag} = this.assignToList(this.can, this.sel)
      this.can = src
      this.sel = tag
    },
    //---------------------------------------------------
    selListToCan() {
      // Guard
      if(_.isEmpty(this.sel.checkedIds))
        return
      // Assign
      let {src, tag} = this.assignToList(this.sel,this.can)
      this.can = tag
      this.sel = src
    },
    //---------------------------------------------------
    // Utility
    //---------------------------------------------------
    assignToList({data, checkedIds}, ta) {
      // Make ids map
      let ids = {}
      _.forEach(checkedIds, v=>ids[v]=true)
      // pick remove list
      let remains = []
      let joins = []
      _.forEach(data, it => {
        let itV = this.Dict.getValue(it)
        if(ids[itV]) {
          joins.push(it)
        } else {
          remains.push(it)
        }
      })
      // Merge checked ids
      _.forEach(ta.checkedIds, v=>ids[v]=true)
      // Join to new list
      return {
        src : {
          data: remains, checkedIds: []
        },
        tag : {
          data      : _.concat(ta.data, joins),
          checkedIds: _.keys(ids)
        }
      }
    },
    //---------------------------------------------------
    genComConf(comConf, {data, checkedIds}) {
      return _.assign({
        idBy      : this.GetValueBy,
        display   : this.display || "text"
      }, comConf, {
        data,  checkedIds,
        multi            : true,
        checkable        : true,
        puppetMode       : true,
        autoCheckCurrent : false,
      })
    },
    //---------------------------------------------------
    async reloadCanList() {
      //console.log("reloadCanList")
      this.myOptionsData = await this.Dict.findAll()
      this.evalShownCanList()
    },
    //---------------------------------------------------
    evalShownCanList() {
      let list = []
      _.forEach(this.myOptionsData, it => {
        let itV = this.Dict.getValue(it)
        if(!this.selIdMap[itV]) {
          list.push(it)
        }
      })
      this.can.data = list
      this.can.checkedIds = []
    },
    //---------------------------------------------------
    async reloadSelList(vals=this.Values) {
      //console.log("reloadSelList")
      let list = []
      for(let v of vals) {
        let it = await this.Dict.getItem(v)
        if(it) {
          list.push(it)
        } else {
          list.push(v)
        }
      }
      this.sel = {
        data: list,
        checkedIds : []
      }
    },
    //---------------------------------------------------
    rebuildIdMap(data) {
      let ids = {}
      _.forEach(data, it => {
        let itV = this.Dict.getValue(it)
        ids[itV] = true
      })
      return ids
    },
    //---------------------------------------------------
    rebuildSelIdMap() {
      this.selIdMap = this.rebuildIdMap(this.sel.data)
    },
    //---------------------------------------------------
    getIds(idMap) {
      let ids = []
      _.forEach(idMap, (v, id)=>{
        if(v)
          ids.push(id)
      })
      return ids
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "value" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.reloadSelList()
      }
    },
    "options" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        this.reloadCanList()
      }
    },
    "sel.data" : function() {
      this.rebuildSelIdMap()
      let ids = _.keys(this.selIdMap)
      if(!_.isEqual(ids, this.Values)) {
        this.$emit("changed", ids)
      }
    }
  },
  ///////////////////////////////////////////////////////
  mounted : async function() {
    await this.reloadSelList()
    await this.reloadCanList()
  }
  ///////////////////////////////////////////////////////
}
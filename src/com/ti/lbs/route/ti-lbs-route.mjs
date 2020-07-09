const _M = {
  /////////////////////////////////////////
  data : ()=>({
    myShowList: undefined,
    myCurrentId: undefined,
    myCheckedIds: undefined
  }),
  /////////////////////////////////////////
  props : {
    "by" : {
      type : String,
      default : "tencent"
    },
    // @see https://lbs.qq.com/javascript_v2/doc/maptypeid.html
    // @see http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference_3_0.html#a5b0
    // ROADMAP | SATELLITE | HYBRID | TERRAIN(google only)
    "mapType" : {
      type : String,
      default : "ROADMAP"
    },
    // Sometime, the lat/lng valued by integer
    // this prop defined how to translate them to float
    "autoFloat" : {
      type : Number,
      default : 10000000
    },
    // Map width
    "width" : {
      type : [String, Number],
      default : 400
    },
    // Map height
    "height" : {
      type : [String, Number],
      default : 400
    },
    "zoom" : {
      type : Number,
      default : 8
    },
    // The Coordinate System for input LatLng (center/value...)
    //  - WGS84 : Standard GPS 
    //  - BD09  : for Baidu Map
    //  - GCJ02 : (Mars) QQ/GaoDe/AliYun ...
    "coordinate" : {
      type : String,
      default : "WGS84"
    },
    // A LatLng Point Object or Polygon Array in map
    // Point - Map center will be it
    // Polygon - Auto count the map center
    "value" : {
      type : Array,
      default : ()=>[]
    },
    "keepStateBy": {
      type: String,
      default: undefined
    },
    "showList" :{
      type: Boolean,
      default: true
    },
    "query": {
      type: [Function, Ti.Dict],
      default: null
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    TopClass() {
      let klass = []
      if(this.fullScreen) {
        klass.push("is-fullscreen")
      }
      if(this.className) {
        klass.push(this.className)
      }
      return klass
    },
    //-------------------------------------
    TopStyle() {
      if(!this.fullScreen) {
        return Ti.Css.toStyle({
          width  : this.width,
          height : this.height
        })
      }
    },
    //-------------------------------------
    ValueItems() {
      let list = []
      _.forEach(this.value, (it, index)=>{
          let li = _.cloneDeep(it)
          // Default Label
          if(!li.label) {
            li.label = ""+(index+1)
          }
          // Default ID
          if(!li.id) {
            li.id = `R${index}`
          }
          // Join it
          list.push(li)
      })
      return list
    },
    //-------------------------------------
    ListConf() {
      return {
        display: ["<icon:zmdi-pin>", "label:[$${val}]", "title"],
        multi: true
      }
    },
    //-------------------------------------
    ActionButtons() {
      let list = [{
        icon: "zmdi-long-arrow-up",
        handler: ()=>this.moveCheckedUp()
      }, {
        icon: "zmdi-long-arrow-down",
        handler: ()=>this.moveCheckedDown()
      }, {
        icon: "zmdi-delete",
        handler: ()=>this.removeChecked()
      }, {
        icon: "zmdi-format-list-bulleted",
        handler: ()=> {
          this.myShowList = !this.isShowList
        }
      }]
      if(this.query) {
        return _.concat({
          icon: "zmdi-plus",
          text: "i18n:lbs-place-add",
          handler: ()=>this.openNewItemSelector()
        }, list)
      }
      return list
    },
    //-------------------------------------
    isShowList() {
      return Ti.Util.fallback(this.myShowList, this.showList)
    },
    //-------------------------------------
    QueryItems() {
      if(this.query instanceof Ti.Dict) {
        return async (str)=>{
          return await this.query.queryData(_.trim(str))
        }
      }
      if(_.isFunction(this.query)) {
        return async (str)=>{
          return await this.query(_.trim(str))
        }
      }
      return ()=>[]
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    OnListSelect({currentId, checkedIds}) {
      this.myCurrentId = currentId
      this.myCheckedIds = checkedIds
    },
    //-------------------------------------
    async openNewItemSelector() {
      let list = await this.QueryItems()
      console.log(list)
    },
    //-------------------------------------
    moveCheckedUp() {
      let mc = this.genMoveContext()
      if(_.isEmpty(mc.checkeds)) {
        return Ti.Toast.Open("i18n:nil-obj", "warn")
      }
      if(mc.firstIndex > 0) {
        let list = mc.remains;
        let pos = mc.firstIndex - 1
        Ti.Util.insertToArray(list, pos, ...mc.checkeds)

        // Auto Update
        let checkeds = {}
        for(let i=0; i<mc.checkeds.length;i++) {
          checkeds[`R${i+pos}`] = true
        }
        this.myCurrentId = null
        this.myCheckedIds = checkeds

        this.$notify("change", list)
      }
    },
    //-------------------------------------
    moveCheckedDown() {
      let mc = this.genMoveContext()
      if(_.isEmpty(mc.checkeds)) {
        return Ti.Toast.Open("i18n:nil-obj", "warn")
      }

      if(mc.lastIndex < (mc.remains.length - 1)) {
        let list = mc.remains;
        let pos = mc.lastIndex+1
        Ti.Util.insertToArray(list, pos, ...mc.checkeds)

        // Auto Update
        let checkeds = {}
        for(let i=0; i<mc.checkeds.length;i++) {
          checkeds[`R${i+pos}`] = true
        }
        this.myCurrentId = null
        this.myCheckedIds = checkeds

        this.$notify("change", list)
      }
    },
    //-------------------------------------
    removeChecked() {
      let mc = this.genMoveContext(true)
      if(_.isEmpty(mc.checkeds)) {
        return Ti.Toast.Open("i18n:del-none", "warn")
      }
      this.$notify("change", mc.remains)
    },
    //-------------------------------------
    genMoveContext(forceCleanCheckeds=false) {
      let mc = {
        firstIndex: -1,
        lastIndex : -1,
        checkeds: [],
        remains: []
      }
      _.forEach(this.ValueItems, (it, index)=>{
        let isChecked = _.get(this.myCheckedIds, it.id)
        let priIt = this.value[index]
        // Checked
        if(isChecked) {
          mc.checkeds.push(priIt)
          if(mc.firstIndex<0) {
            mc.firstIndex = index
            mc.lastIndex  = index
          }else {
            mc.lastIndex = mc.remains.length
          }
        }
        // Remain
        else {
          mc.remains.push(priIt)
        }
      })

      // autoCleanCheckeds
      if(forceCleanCheckeds || mc.checkeds.length > 1) {
        this.myCheckedIds = {}
      }

      console.log(mc)
      return mc
    }
    //-------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;
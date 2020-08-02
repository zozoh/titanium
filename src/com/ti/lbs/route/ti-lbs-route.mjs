const _M = {
  /////////////////////////////////////////
  inject: {
    '$vars': {default: {}}
  },
  /////////////////////////////////////////
  data : ()=>({
    myShowList: undefined,
    myCurrentId: undefined,
    myCheckedIds: undefined,
    myFullscreen: false,
    apiLoaded: false
  }),
  /////////////////////////////////////////
  props : {
    // tencent|baidu|google ...
    "by" : {
      type : String,
      default : "tencent"
    },
    // Map security key pattern 
    // it will find the key from "$vars" which injected to the com.
    // default, if by=google, the mapKey in "$vars" should be "googleMapKey"
    "secretKey": {
      type: String,
      default: "${by}MapKey"
    },
    // All Map api support URL
    // key by 'by' prop
    "apiUrls": {
      type: Object,
      default: ()=>({
        "google": '!js://maps.googleapis.com/maps/api/js?key=${key}'
      })
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
    "maxZoom": {
      type: Number,
      default: 22
    },
    "minZoom": {
      type: Number,
      default: 1
    },
    "infoBar": {
      type: Boolean,
      default: true
    },
    "editable": {
      type: Boolean,
      default: false
    },
    "iconSize": {
      type: Object,
      default: undefined
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
    /*
    Open Modal-> ti-transer 
    whatever, you need gen the result like:
    [{
      id, title, lng, lat, label[Optional]
    }]
    */
    "addBy": {
      type: Object,
      default: undefined
    },
    // Refer by goole map api: gestureHandling
    // https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
    "gestureHandling": {
      type: String,
      default: "auto",
      validator: v=>/^(cooperative|greedy|none|auto)$/.test(v)
    }
  },
  //////////////////////////////////////////
  computed : {
    //-------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-fullscreen": this.myFullscreen
      })
    },
    //-------------------------------------
    TopStyle() {
      if(!this.myFullscreen) {
        return Ti.Css.toStyle({
          width  : this.width,
          height : this.height
        })
      }
    },
    //-------------------------------------
    TheMapSecretKey() {
      let vnm = Ti.S.renderBy(this.secretKey, this)
      return _.get(this.$vars, vnm)
    },
    //-------------------------------------
    TheMapApiUrl() {
      let url = _.get(this.apiUrls, this.by)
      url = Ti.S.renderBy(url, {key:this.TheMapSecretKey})
      return url
    },
    //-------------------------------------
    TheGestureHandling() {
      if(this.myFullscreen){
        return "greedy"
      }
      return this.gestureHandling
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
        icon: "zmdi-edit",
        disabled: !this.hasCurrentId,
        handler: ()=>this.editCurrent()
      }, {
        icon: "zmdi-long-arrow-up",
        disabled: !this.hasCheckedIds,
        handler: ()=>this.moveCheckedUp()
      }, {
        icon: "zmdi-long-arrow-down",
        disabled: !this.hasCheckedIds,
        handler: ()=>this.moveCheckedDown()
      }, {
        icon: "zmdi-delete",
        disabled: !this.hasCheckedIds,
        handler: ()=>this.removeChecked()
      }, {
        icon: "zmdi-format-list-bulleted",
        handler: ()=> {
          this.myShowList = !this.isShowList
        }
      }]
      if(this.addBy) {
        return _.concat({
          icon: "zmdi-plus",
          text: "i18n:lbs-place-add",
          handler: ()=>this.openNewItemSelector()
        }, list)
      }
      return list
    },
    //-------------------------------------
    hasCurrentId() {
      return !Ti.Util.isNil(this.myCurrentId)
    },
    //-------------------------------------
    hasCheckedIds() {
      return !_.isEmpty(this.myCheckedIds)
    },
    //-------------------------------------
    isShowList() {
      return Ti.Util.fallback(this.myShowList, this.showList)
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    OnFullscreenChange(fullscreen) {
      console.log("OnFullscreenChange", fullscreen)
      this.myFullscreen = fullscreen
    },
    //-------------------------------------
    OnListSelect({currentId, checkedIds}) {
      this.myCurrentId = currentId
      this.myCheckedIds = checkedIds
    },
    //-------------------------------------
    async OnListOpen({index, item}) {
      let reo = await Ti.App.Open({
        title: "i18n:edit",
        position: "right",
        result: item,
        comType: "TiForm",
        comConf: {
          data: "=result",
          fields: [{
            title: "i18n:title",
            name: "title",
            comType: "ti-input"
          }, {
            title: "i18n:label",
            name: "label",
            comType: "ti-input"
          }]
        }
      })
      // User cancel
      if(_.isEmpty(reo))
        return

      // Update
      let list = _.cloneDeep(this.ValueItems)
      _.assign(list[index], reo)
      this.$notify("change", list)
    },
    //-------------------------------------
    async editCurrent() {
      if(!this.myCurrentId) {
        return
      }
      // Find the index
      let index=0, item=null;
      for(let it of this.ValueItems) {
        if(this.myCurrentId == it.id) {
          item = it
          break;
        }
        index++
      }
      // Then open editor
      await this.OnListOpen({index, item})
    },
    //-------------------------------------
    async openNewItemSelector() {
      // Guard
      if(!this.addBy)
        return
      let diaConf = _.merge({
        icon: "zmdi-plus-circle-o",
        title: "add-item",
        width: "80%",
        height: "80%",
        position: "top",
        result: this.ValueItems,
        comType: "TiTransfer",
        comConf: {}
      }, this.addBy)

      let reo = await Ti.App.Open(diaConf)

      // User canceled
      if(_.isEmpty(reo))
        return
      
      // Remove dup
      let list = []
      let memo = {}

      // Remember old
      _.forEach(list, it => memo[it.id] = true)
      
      // Join new
      _.forEach(reo, it => {
        if(!memo[it.id]) {
          memo[it.id] = true
          if(Ti.Util.isNil(it.label)) {
            it.label = (list.length+1)+""
          }
          list.push(it)
        }
      })

      // Notify change
      this.$notify("change", list)
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

        // Update the auto-generated ID
        if(Ti.Util.isNil(_.first(mc.checkeds).id)) {
          let checkeds = {}
          for(let i=0; i<mc.checkeds.length;i++) {
            checkeds[`R${i+pos}`] = true
          }
          this.myCurrentId = null
          this.myCheckedIds = checkeds
        }

        this.$notify("change", list)
      }
    },
    //-------------------------------------
    moveCheckedDown() {
      let mc = this.genMoveContext()
      if(_.isEmpty(mc.checkeds)) {
        return Ti.Toast.Open("i18n:nil-obj", "warn")
      }

      if(mc.lastIndex < mc.remains.length) {
        let list = mc.remains;
        let pos = mc.lastIndex+1
        Ti.Util.insertToArray(list, pos, ...mc.checkeds)

        // Update the auto-generated ID
        if(Ti.Util.isNil(_.first(mc.checkeds).id)) {
          let checkeds = {}
          for(let i=0; i<mc.checkeds.length;i++) {
            checkeds[`R${i+pos}`] = true
          }
          this.myCurrentId = null
          this.myCheckedIds = checkeds
        }

        this.$notify("change", list)
      }
    },
    //-------------------------------------
    removeChecked() {
      let mc = this.genMoveContext()
      if(_.isEmpty(mc.checkeds)) {
        return Ti.Toast.Open("i18n:del-none", "warn")
      }
      this.myCheckedIds = {}
      this.myCurrentId = null
      this.$notify("change", mc.remains)
    },
    //-------------------------------------
    genMoveContext() {
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

      //console.log(mc)
      return mc
    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  mounted: async function() {
    // Load Map API
    let url = this.TheMapApiUrl
    if(url) {
      //console.log("TiLoad", url)
      await Ti.Load(url)
      this.apiLoaded = true
    }
  }
  //////////////////////////////////////////
}
export default _M;
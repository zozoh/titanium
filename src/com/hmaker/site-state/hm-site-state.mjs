export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    myCurrentPathId : null,
    myTreeOpenedStatus : {}
  }),
  //////////////////////////////////////////
  props : {
    "home" : {
      type : Object,
      default : ()=>({})
    },
    "content" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theData () {
      let str = _.trim(this.content)
      if(!str) {
        return {}
      }
      return JSON.parse(str)
    },
    //--------------------------------------
    theTreeDisplay() {
      return ["<icon>","title","tip"]
    },
    //--------------------------------------
    theTreeData() {
      return {
        name : "ROOT",
        children : [
          this._general,
          this._nav,
          this._apis,
          this._schema,
          this._blocks,
          this._router,
          this._actions,
          this._utils
        ]
      }
    },
    //--------------------------------------
    _general(){
      return {
        icon  : "fas-sliders-h",
        name  : "general",
        title : "i18n:hmaker-site-state-general",
        data  : _.pick(this.theData, [
          "domain",
          "apiBase",
          "captcha",
          "base",
          "entry"
        ])
      }
    },
    //--------------------------------------
    _utils() {
      return {
        icon  : "zmdi-card-sd",
        name  : "utils",
        title : "i18n:hmaker-site-state-utils",
        data  : _.assign({}, this.theData.utils)
      }
    },
    //--------------------------------------
    _apis() {
      let children = []
      //....................................
      _.forEach(this.theData.apis, (val, key)=>{
        children.push({
          icon  : "zmdi-input-power",
          name  : key,
          title : val.title || key,
          tip   : key,
          data  : val
        })
      })
      //....................................
      return {
        icon  : "zmdi-input-composite",
        name  : "apis",
        title : "i18n:hmaker-site-state-apis",
        children
      }
    },
    //......................................
    _schema() {
      let children = []
      //....................................
      _.forEach(this.theData.schema, (val, key)=>{
        children.push({
          icon  : "fas-puzzle-piece",
          name  : key,
          title : val.title || key,
          data  : val
        })
      })
      //....................................
      return {
        icon  : "fas-pencil-ruler",
        name  : "schema",
        title : "i18n:hmaker-site-state-schema",
        children
      }
    },
    //......................................
    _blocks() {
      //....................................
      const __sub_block = (block, key)=>{
        //..................................
        // Block as refer
        if (_.isString(block)) {
          return {
            icon  : "fas-external-link-alt",
            name  : key,
            title : block,
            data  : block
          }
        }
        //..................................
        // Block as component
        else if(block.body) {
          let comName = _.isString(block.body)
            ? block.body
            : (block.body.comType || "ti-label")
          let titleKey = _.isNumber(key)
            ? `[${key}]`
            : `"${key}"`
          return {
            icon  : "fas-puzzle-piece",
            name  : key,
            title : `${titleKey}:<${comName}>`,
            data  : block
          }
        }
        //..................................
        // Block as layout
        else {
          //................................
          let children = []
          //................................
          _.forEach(block.blocks, (block, index)=>{
            children.push(__sub_block(block, index))
          })
          //................................
          let titleKey = _.isNumber(key)
            ? `[${key}]`
            : `"${key}"`
          //................................
          let blockName = [
            titleKey, 
            Ti.I18n.get(`hmaker-layout-${block.type||"cols"}`)
          ]
          //................................
          return {
            icon  : "im-layer",
            name  : key,
            title : blockName.join(":"),
            data  : block,
            children
          }
        }
      }
      //....................................
      let children = []
      _.forEach(this.theData.blocks, (deviceInfo, deviceType)=>{
        //..................................
        let subs = []
        _.forEach(deviceInfo, (block, key)=>{
          subs.push(__sub_block(block, key))
        })
        //..................................
        children.push({
          icon  : ({
            "desktop" : "zmdi-desktop-windows",
            "tablet"  : "zmdi-tablet",
            "phone"   : "zmdi-smartphone-iphone",
          })[deviceType],
          name  : deviceType,
          title : `i18n:${deviceType}`,
          data  : deviceInfo,
          children : subs
        })
        //..................................
      })
      //....................................
      return {
        icon  : "far-object-group",
        name  : "blocks",
        title : "i18n:hmaker-site-state-blocks",
        children
      }
    },
    //......................................
    _nav() {
      return {
        icon  : "im-sitemap",
        name  : "nav",
        title : "i18n:hmaker-site-state-nav",
        data  : this.theData.nav || []
      }
    },
    //......................................
    // router
    _router() {
      let children = []
      //....................................
      _.forEach(this.theData.router, (val, key)=>{
        children.push({
          icon  : "im-share",
          name  : key,
          title : val.match,
          data  : val
        })
      })
      //....................................
      return {
        icon  : "zmdi-router",
        name  : "router",
        title : "i18n:hmaker-site-state-router",
        children
      }
    },
    //......................................
    _actions() {
      let children = []
      //....................................
      _.forEach(this.theData.actions, (val, key)=>{
        children.push({
          icon  : "im-flash",
          name  : key,
          title : key,
          data  : val
        })
      })
      //....................................
      return {
        icon  : "im-rocket",
        name  : "actions",
        title : "i18n:hmaker-site-state-actions",
        children
      }
    },
    //--------------------------------------
    theLayout() {
      return {
        type : "tabs",
        tabAt : "bottom-left",
        blocks : [{
            title : "i18n:structure",
            type : "cols",
            border : true,
            blocks : [{
                size  : .372,
                name  : "tree",
                body  : "desktopStructureTree"
              }, {
                name  : "edit",
                body  : "desktopStructureEdit"
              }]
          }, {
            title : "i18n:source-code",
            name  : "source",
            body  : "desktopSourceCode"
          }]
      }
    },
    //--------------------------------------
    theSchema() {
      return {
        // structure: tree
        "desktopStructureTree" : {
          comType : "ti-tree",
          comConf : {
            mainWidth        : 300,
            border           : "cell",
            multi            : false,
            data             : this.theTreeData,
            display          : this.theTreeDisplay,
            autoOpen         : false,
            currentId        : this.myCurrentPathId,
            defaultOpenDepth : 0,
            keepOpenBy       : `hm-site-state-${this.home.id}-opened`,
            keepCurrentBy    : `hm-site-state-${this.home.id}-current`,
            showRoot         : false
          }
        },
        // structure: edit
        "desktopStructureEdit" : {
          comType : "hmaker-site-node-editing",
          comConf : {
            path : this.myCurrentPathId,
            node : this.theCurrentNode
          }
        },
        // source code 
        "desktopSourceCode" : {
          comType : "ti-text-raw",
          comConf : {
            showTitle : false,
            content   : this.content,
            ignoreKeyUp : true
          }
        }
      }
    },
    //--------------------------------------
    theCurrentNode() {
      if(this.myCurrentPathId) {
        return Ti.Trees.getNodeByPath(this.theTreeData, this.myCurrentPathId)
      }
      return null
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    updateByPath({path, payload}={}) {
      //console.log("udpateByPath", path, payload)
      let data = _.cloneDeep(this.theData)
      _.set(data, path, payload)
      //console.log(JSON.stringify(data, null, '  '))
      Ti.App(this).dispatch("main/onCurrentChanged", data)
    },
    //--------------------------------------
    onBlockEvent({block, name, args}={}) {
      let evKey = _.concat(block||[], name||[]).join(".")
      let data = _.first(args)
      console.log("hmaker-site-state:onBlockEvent",evKey, data)
      //....................................
      // Ignore the undefined data
      if(_.isUndefined(data)) {
        return
      }
      //....................................
      else if("tree.selected" == evKey) {
        this.onSelected(data)
      }
      //....................................
      else if("tree.opened-status:changed" == evKey) {
        this.onOpenedStatusChanged(data)
      }
      //....................................
      else if("edit.changed" == evKey) {
        this.updateByPath(data)
      }
      //....................................
      else if("source.changed" == evKey) {
        Ti.App(this).dispatch("main/onCurrentChanged", data)
      }
      //....................................
    },
    //--------------------------------------
    async onSelected({currentId, current}={}) {
      //console.log("onSelected", currentId, _.cloneDeep(current))
      this.myCurrentPathId = currentId
    },
    //--------------------------------------
    onOpenedStatusChanged(opened) {
      //console.log("onOpenedStatusChanged", _.cloneDeep(opened))
      this.myTreeOpenedStatus = opened
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  //////////////////////////////////////////
}
const _M = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$EmitBy" : async (name, ...args)=>{
        await this.DoEvent(name, args)
      }
    }
  },
  ///////////////////////////////////////////
  props : {
    // Thing Set Home
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "currentDataHome" : {
      type : String,
      default : null
    },
    "currentDataDir" : {
      type : String,
      default : "media"
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "config" : {
      type : Object,
      default : ()=>({})
    },
    "search" : {
      type : Object,
      default : ()=>({})
    },
    "current" : {
      type : Object,
      default : ()=>({})
    },
    "files" : {
      type : Object,
      default : ()=>({})
    },
    "preview" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    shown() {
      return _.get(this.config, "shown") || {}
    },
    //--------------------------------------
    theLayout() {
      return Ti.Util.explainObj(this, this.config.layout)
    },
    //--------------------------------------
    theSchema() {
      return Ti.Util.explainObj(this, this.config.schema)
    },
    //--------------------------------------
    changedRowId() {
      if(this.current && this.current.meta && this.current.status.changed) {
        return this.current.meta.id
      }
    },
    //--------------------------------------
    guiLoading() {
      let key = _.findKey(this.status, (v)=>v)
      return ({
        "reloading" : {
          icon : "fas-spinner fa-spin",
          text : "i18n:loading"
        },
        "saving" : {
          icon : "zmdi-settings fa-spin",
          text : "i18n:saving"
        },
        "deleting" : {
          icon : "zmdi-refresh fa-spin",
          text : "i18n:del-ing"
        },
        "restoring" : {
          icon : "zmdi-time-restore zmdi-hc-spin",
          text : "i18n:thing-restoring"
        },
        "cleaning" : {
          icon : "zmdi-settings zmdi-hc-spin",
          text : "i18n:thing-cleaning"
        }
      })[key]
    },
    //--------------------------------------
    curentThumbTarget() {
      if(this.current.meta) {
        let th_set = this.meta.id
        let thId = this.current.id
        return `id:${th_set}/data/${this.current.meta.id}/thumb.jpg`
      }
      return ""
    },
    //--------------------------------------
    schemaMethods() {
      if(this.theSchema && this.theSchema.methods) {
        return Ti.Util.merge({}, this.theSchema.methods)
      }
      return {}
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    async invoke(fnName) {
      //console.log("invoke ", fnName)
      let fn = _.get(this.schemaMethods, fnName)
      // Invoke the method
      if(_.isFunction(fn)) {
        return await fn.apply(this, [])
      }
      // Throw the error
      else {
        throw Ti.Err.make("e.thing.fail-to-invoke", fnName)
      }
    },
    //--------------------------------------
    async changeShown(shown={}) {
      Ti.App(this).dispatch("main/doChangeShown", shown)
    },
    //--------------------------------------
    showBlock(name) {
      console.log("showBlock", name)
      // If creator, then must leave the recycle bin
      if("creator" == name) {
        if(this.status.inRecycleBin) {
          Ti.Alert("i18n:thing-create-in-recyclebin", {
            title : "i18n:warn",
            icon  : "im-warning",
            type  : "warn"
          })
          return
        }
      }
      if("files" == name) {
        Ti.App(this).dispatch("main/reloadFiles")
      }
      else if("content" == name) {
        //Ti.App(this).dispatch("main/reloadFiles")
        Ti.App(this).dispatch("main/current/reload")
      }
      // Mark block
      Ti.App(this).dispatch("main/doChangeShown", {[name]:true})
    },
    //--------------------------------------
    hideBlock(name) {
      Ti.App(this).dispatch("main/doChangeShown", {[name]:false})
    },
    //--------------------------------------
    toggleBlock(name) {
      Ti.App(this).dispatch("main/doChangeShown", {
        [name]: !this.shown[name]
      })
    },
    //--------------------------------------
    async DoEvent(name, args=[]) {
      let {block, event} = Ti.Util.explainEventName(name)
      console.log("Thing.DoEvent", {name, block, event, args, a0:_.first(args)})
      //console.log("wn-thing-manager:onBlockEvent",evKey, args)
      //....................................
      let app = Ti.App(this)
      //....................................
      // Event Handlers
      const FnSet = {
        //..................................
        "block:show" : (name)=>{
          this.showBlock(name)
        },
        "block:hide" : (name)=>{
          this.hideBlock(name)
        },
        "block:shown" : (shown)=>{
          this.changeShown(shown)
        },
        //..................................
        // Select item in search list
        "list>select" : ({current, currentId, checkedIds})=>{
          //console.log("list.select", current)
          
          // Update Current
          app.dispatch("main/setCurrentThing", {
            meta: current, 
            currentId,
            checkedIds
          })
        },
        //..................................
        // Select item in search list
        "list>open" : ({rawData})=>{
          //console.log("list.open", rawData)
          // Open customized block
          // Sometimes, may user want open the both "content" and "file"
          // at same time when dbl-click the one row
          Ti.App(this).dispatch("main/config/updateShown", this.config.listOpen)
          // Update Current
          app.dispatch("main/setCurrentThing", {
            meta: rawData 
          })
          // Update Checkes/Current to search
          //this.setSeachSelected(current)
        },
        //..................................
        // Content changed
        "content>change" : (content)=>{
          app.dispatch("main/current/changeContent", content)
          app.commit("main/syncStatusChanged")
        },
        //..................................
        // PageNumber changed
        "pager>change:pn" : (pn)=>{
          app.commit("main/search/updatePager", {pn})
          app.dispatch("main/search/reload")
        },
        //..................................
        // PageSize changed
        "pager>change:pgsz" : (pgsz)=>{
          app.commit("main/search/updatePager", {pgsz, pn:1})
          app.dispatch("main/search/reload")
        },
        //..................................
        "view-current-source" : this.viewCurrentSource
        //..................................
      }

      let fn = FnSet[name] || FnSet[event]

      // Run Handler
      if(_.isFunction(fn)) {
        await fn.apply(this, args)
      }
    },
    //--------------------------------------
    async viewCurrentSource() {
      // Guard
      if(!this.current.meta) {
        return await Ti.Toast.Open("i18n:empty-data", "warn")
      }
      // Open Editor
      let newContent = await Wn.EditObjContent(this.current.meta, {
        showEditorTitle : false,
        icon      : Wn.Util.getObjIcon(this.current.meta, "zmdi-tv"),
        title     : Wn.Util.getObjDisplayName(this.current.meta),
        width     : "61.8%",
        height    : "100%",
        spacing   : ".1rem",
        content   : this.current.content,
        saveBy    : null
      })

      //console.log(newContent)

      // Cancel the editing
      if(_.isUndefined(newContent)) {
        return
      }

      // Update the current editing
      Ti.App(this).dispatch("main/setCurrentContent", newContent)
    },
    //--------------------------------------
    checkActionsUpdate() {
      console.log("checkActionsUpdate")
      let actions = _.get(this.config, "actions")
      if(_.isArray(actions)) {
        this.$notify("actions:update", actions)
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted : function() {
    // Mark self in order to let `thing-files` set self
    // to root `wn-thing-manager` instance
    // then `openLocalFileSelectdDialogToUploadFiles`
    // can assess the `thing-files` instance directly.
    this.THING_MANAGER_ROOT = true

    // Update the customized actions
    this.checkActionsUpdate()
  }
  ///////////////////////////////////////////
}
export default _M;
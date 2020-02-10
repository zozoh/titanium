export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  data : ()=>({
    myActions : null,
    myCooling : -1
  }),
  ///////////////////////////////////////////
  props : {
    // Thing Set Home
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "filesName" : {
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
    async onBlockEvent(be={}) {
      //console.log("onBlockEvent", be)
      let app = Ti.App(this)
      // Event Handlers
      const fns = {
        //..................................
        // Select item in search list
        "list.selected" : ({current, currentId, checkedIds})=>{
          //console.log("list.selected", current)
          
          // Update Current
          app.dispatch("main/setCurrentThing", {
            meta : current, 
            force : false
          })

          // Update the search status
          app.commit("main/search/setCurrentId", currentId)

          // checkedIds map -> Array
          let ckids = []
          _.forEach(checkedIds, (val, key)=>{
            if(val)
              ckids.push(key)
          })
          app.commit("main/search/setCheckedIds", ckids)

        },
        //..................................
        // Select item in search list
        "list.open" : ({rawData})=>{
          //console.log("list.open", rawData)
          // Open customized block
          // Sometimes, may user want open the both "content" and "file"
          // at same time when dbl-click the one row
          Ti.App(this).dispatch("main/config/updateShown", this.config.listOpen)
          // Update Current
          app.dispatch("main/setCurrentThing", {
            meta  : rawData, 
            force : false
          })
          // Update Checkes/Current to search
          //this.setSeachSelected(current)
        },
        //..................................
        // Content changed
        "content.changed" : ({content})=>{
          app.dispatch("main/current/changeContent", content)
          app.commit("main/syncStatusChanged")
        },
        //..................................
        // PageNumber changed
        "pager.change:pn" : (pn)=>{
          app.commit("main/search/updatePager", {pn})
          app.dispatch("main/search/reload")
        },
        //..................................
        // PageSize changed
        "pager.change:pgsz" : (pgsz)=>{
          app.commit("main/search/updatePager", {pgsz, pn:1})
          app.dispatch("main/search/reload")
        },
        //..................................
        "tabs:changed" : this.changeTabs
        //..................................
      }

      let fn = fns[`${be.block}.${be.name}`] || fns[be.name]

      // Run Handler
      if(_.isFunction(fn)) {
        await fn(...be.args)
      }
    },
    //--------------------------------------
    // Firefox 33.0, can not watch the click in callback
    openLocalFileSelectdDialogToUploadFiles(){
      //console.log(this.$thingFiles)
      if(this.$thingFiles) {
        this.$thingFiles.openLocalFileSelectdDialog()
      }
    },
    //--------------------------------------
    checkActionsUpdate() {
      // Not need to check
      if(this.myCooling < 0) {
        return
      }
      // Wait cooling 1000ms
      if(Date.now() - this.myCooling > 300) {
        this.$emit("actions:updated", this.myActions)
        this.myCooling = -1
      }
      // Wait cooling 1000ms
      else {
        _.delay(()=>{
          this.checkActionsUpdate()
        }, 200)
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch : {
    "config.actions" : function(newActions, oldActions) {
      //console.log("config.actions", this.config.actions)
      if(!_.isEqual(newActions, oldActions)) {
        this.myActions = newActions
        this.myCooling = Date.now()
      }
    },
    // To prevent the action update too often
    "myCooling" : function(cooling) {
      if(cooling > 0) {
        this.checkActionsUpdate()
      }
    }
  },
  ///////////////////////////////////////////
  mounted : function() {
    // Mark self in order to let `thing-files` set self
    // to root `wn-thing-manager` instance
    // then `openLocalFileSelectdDialogToUploadFiles`
    // can assess the `thing-files` instance directly.
    this.THING_MANAGER_ROOT = true
  }
  ///////////////////////////////////////////
}
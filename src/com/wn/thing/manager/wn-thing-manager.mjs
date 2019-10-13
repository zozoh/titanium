export default {
  inheritAttrs : false,
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
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    shown() {
      return _.get(this.config, "shown") || {}
    },
    //--------------------------------------
    currentLayout() {
      return this.getLayout(this.viewportMode)
    },
    //--------------------------------------
    formedSchema() {
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
      if(this.formedSchema && this.formedSchema.methods) {
        return Ti.Util.merge({}, this.formedSchema.methods)
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
    getLayout(name) {
      if(_.isEmpty(this.config))
        return {}
      let la = this.config.layout[name]
      if(_.isString(la)) {
        la = this.config.layout[la]
      }
      //...........................
      return Ti.Util.explainObj(this, la)
    },
    //--------------------------------------
    async changeTabs(tabs={}) {
      Ti.App(this).dispatch("main/doChangeShown", tabs)
    },
    //--------------------------------------
    showBlock(name) {
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
    // setSeachSelected(current={}, selected) {
    //   let app = Ti.App(this)

    //   let cid = current ? current.id : null
    //   app.commit("main/search/setCurrentId", cid)

    //   if(_.isArray(selected)) {
    //     let ids = []
    //     for(let it of selected) {
    //       ids.push(it.id)
    //     }
    //     app.commit("main/search/setCheckedIds", ids)
    //   }
    // },
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
        "list.open" : ({current})=>{
          //console.log("list.open", current)
          // Open customized block
          Ti.App(this).commit("main/config/updateShown", this.config.listOpen)
          // Update Current
          app.dispatch("main/setCurrentThing", {
            meta : current, 
            force : false
          })
          // Update Checkes/Current to search
          //this.setSeachSelected(current)
        },
        //..................................
        // Content changed
        "content.change" : ({content})=>{
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
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch : {
    "config.actions" : function() {
      this.$emit("actions:updated", this.config.actions)
    },
    "shown" : function() {
      //console.log("shown changed", JSON.stringify(this.shown))
      if(this.meta && this.meta.id) {
        Ti.Storage.session.setObject(this.meta.id, this.shown)
      }
    }
  }
  ///////////////////////////////////////////
}
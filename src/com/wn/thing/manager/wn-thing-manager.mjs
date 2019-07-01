const __format_obj = function(vm, obj){
  // Array
  if(_.isArray(obj)) {
    let list = []
    for(let val of obj) {
      list.push(__format_obj(vm, val))
    }
    return list
  }
  // Plain Object
  if(_.isPlainObject(obj)) {
    let o2 = {}
    _.forEach(obj, (v2, k2)=>{
      o2[k2] = __format_obj(vm, v2)
    })
    return o2
  }
  // String: @xx.xx
  if(_.isString(obj)) {
    let m = /^@(.+)$/.exec(obj)
    if(m) {
      return _.get(vm, m[1])
    }
  }
  // Others
  return obj
}
///////////////////////////////////////////
export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    "shown" : {}
  }),
  ///////////////////////////////////////////
  props : {
    // Thing Set Home
    "meta" : {
      type : Object,
      default : ()=>({})
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
    currentLayout() {
      return this.getLayout(this.viewportMode)
    },
    formedSchema() {
      let re = {}
      _.forEach(this.config.schema, (val, key)=>{
        re[key] = __format_obj(this, val)
      })
      return re
    },
    changedRowId() {
      if(this.current && this.current.meta && this.current.status.changed) {
        return this.current.meta.id
      }
    },
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
    }
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    getLayout(name) {
      if(_.isEmpty(this.config))
        return {}
      let la = this.config.layout[name]
      if(_.isString(la)) {
        la = this.config.layout[la]
      }
      //...........................
      let re = {}
      _.forEach(la, (val, key)=>{
        re[key] = __format_obj(this, val)
      })
      //...........................
      return re
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
      this.shown = {
        ...this.shown, 
        [name]: true
      }
    },
    //--------------------------------------
    hideBlock(name) {
      this.shown = {
        ...this.shown, 
        [name]: false
      }
    },
    //--------------------------------------
    toggleBlock(name) {
      if(this.shown[name]) {
        this.hideBlock(name)
      } else {
        this.showBlock(name)
      }
    },
    //--------------------------------------
    setSeachSelected(current={}, selected) {
      let app = Ti.App(this)

      let cid = current ? current.id : null
      app.commit("main/search/setCurrentId", cid)

      if(_.isArray(selected)) {
        let ids = []
        for(let it of selected) {
          ids.push(it.id)
        }
        app.commit("main/search/setCheckedIds", ids)
      }
    },
    //--------------------------------------
    onBlockEvent(be={}) {
      console.log("onBlockEvent", be)
      let app = Ti.App(this)
      // Event Handlers
      let fn = ({
        //..................................
        // Select item in search list
        "list.selected" : ({current, selected})=>{
          //console.log("list.selected", current)
          if(!current) {
            this.shown.content = false
            this.shown.meta = false
          } else {
            this.shown.meta = true
          }
          
          // Update Current
          app.dispatch("main/current/setCurrent", {
            meta : current, 
            loadContent : this.shown.content,
            force : false
          })
          // Update Checkes/Current to search
          this.setSeachSelected(current, selected)
        },
        //..................................
        // Select item in search list
        "list.open" : ({current})=>{
          //console.log("list.open", current)
          this.shown.meta = true
          this.shown.content = true
          // Update Current
          app.dispatch("main/current/setCurrent", {
            meta : current, 
            loadContent : this.shown.content,
            force : false
          })
          // Update Checkes/Current to search
          this.setSeachSelected(current)
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
        }
        //..................................
      })[`${be.block}.${be.name}`]

      // Run Handler
      if(_.isFunction(fn)) {
        fn(...be.args)
      }
    }
    //--------------------------------------
  }
  ///////////////////////////////////////////
}
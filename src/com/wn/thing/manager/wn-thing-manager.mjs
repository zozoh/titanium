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
      return this.getLayout(this.pageMode)
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
    onBlockEvent(be={}) {
      console.log("onBlockEvent", be)
      let app = Ti.App(this)
      // Event Handlers
      let fn = ({
        //..................................
        // Select item in search list
        "list.selected" : ({current})=>{
          console.log("list.selected", current)
          if(!current) {
            this.shown.content = false
          }
          app.dispatch("main/current/setCurrent", {
            meta : current, 
            loadContent : this.shown.content,
            force : false
          })
        },
        //..................................
        // Select item in search list
        "list.open" : ({current})=>{
          console.log("list.open", current)
          this.shown.content = true
          app.dispatch("main/current/setCurrent", {
            meta : current, 
            loadContent : this.shown.content,
            force : false
          })
        },
        //..................................
        // Content changed
        "content.change" : ({content})=>{
          app.dispatch("main/current/changeContent", content)
          app.commit("main/syncStatusChanged")
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
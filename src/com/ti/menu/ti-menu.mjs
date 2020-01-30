export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "data" :{
      type : Array,
      default : ()=>[]
    },
    "align" : {
      type : String,
      default : "center",
      validator : function(val) {
        return ["left","right","center"].indexOf(val)!=-1
      }
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //---------------------------------------
    conClass() {
      if(this.align) {
        return "align-"+this.align
      }
    },
    //---------------------------------------
    items() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        this.joinActionItem(list, it, "/item"+index)
      })
      return list
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    invokeAction : _.debounce(function(action){
      // Invoke directly
      if(_.isFunction(action)) {
        action()
        return
      }
      //console.log("invokeAction", action)
      let vm = this
      let m = /^([a-zA-Z0-9_]+):([^()]+)(\((.*)\))?$/.exec(action)
      if(m) {
        let mode = m[1]
        let tanm = m[2]
        let arg0 = m[4]
        let args = []
        let func, context
        //...............................
        // Call parent
        if('parent' == mode) {
          func = this.$parent[tanm]
          context = this.$parent
        }
        // Call App
        else {
          let $app = Ti.App(vm)
          func = $app[mode]
          context = $app
          args.push(tanm)
        }
        //...............................
        // Do Invoke
        if(_.isFunction(func) && tanm) {
          if(arg0) {
            let payload = Ti.S.toJsValue(arg0)
            args.push(payload)
          }
          func.apply(context, args)
          return
        }
      }
      // Fail to found function
      // Then emit the action
      // throw Ti.Err.make("e-ti-menu-action-InvalidAction", action)
      if(_.isString(action)) {
        this.$emit(action)
      }
    }, 500, {
      leading  : true,
      trailing : false
    }),
    //---------------------------------------
    joinActionItem(list=[], {
      key, type, statusKey,
      icon, text, tip, 
      shortcut,
      enableBy, disableBy, 
      altDisplay,
      action, 
      items
    }, dftKey){
      let it = {
        key  : key  || dftKey,   // Action item must contains a key
        statusKey : statusKey || key || dftKey,
        type : type || "action", // default as normal action
        shortcut,
        icon, text, tip,
        enableBy, disableBy, 
        action
      }
      // mark altDisplay
      if(_.isPlainObject(altDisplay)) {
        it.altDisplay = {...altDisplay}
      }
      // set sub comType by type
      it.comType = "mitem-" + _.kebabCase(it.type)
      // If group, recur
      if(_.isArray(items) && items.length > 0) {
        it.items = []
        _.forEach(items, (subIt, index)=>{
          this.joinActionItem(it.items, subIt, it.key+"/item"+index)
        })
      }
      // Join the normalized item
      list.push(it)
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
}
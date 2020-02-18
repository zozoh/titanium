export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "className" : null,
    "type" : {
      type : String,
      default : null,
      validator : (v)=>{
        return Ti.Util.isNil(v)
          || /^(cols|rows|tabs)$/.test(v)
      }
    },
    "title" : {
      type : String,
      default : null
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "hideTitle" : {
      type : Boolean,
      default : false
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "name" : {
      type : String,
      default : null
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "body" : {
      type : [String, Object],
      default : null
    },
    "hijackable" : {
      type : Boolean,
      default : true
    },
    "embedIn" : {
      type : String,
      default : null,
      validator : (v)=>/^(panel|rows|cols|tabs)$/.test(v)
    },
    "size" : {
      type : [String, Number],
      default : null
    },
    "overflow" : {
      type : String,
      default : null
    },
    "flex" : {
      type : String,
      default : "auto",
      validator : (v)=>/^(auto|grow|shrink|both|none)$/.test(v)
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    },
    "captureEvents" : {
      type : Object,
      default : ()=>({})
    },
    // "tabAt"      : undefined,
    // "adjustable" : undefined,
    // "border"     : undefined
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        [`gui-block-${this.name}`] : this.name ? true : false,
        "is-show-header"  : this.isShowHeader,
        "is-hide-header"  : !this.isShowHeader,
        "ti-fill-parent" : /^(tabs|panel)$/.test(this.embedIn)
      }, [
        `is-flex-${this.theFlexName}`
      ], this.className)
    },
    //--------------------------------------
    topStyle() {
      return Ti.Css.toStyle(({
        //..................................
        rows:()=>({
          height: this.theSize
        }),
        //..................................
        cols:()=>({
          width : this.theSize
        }),
        //..................................
        tabs:()=>({}),
        //..................................
        panel:()=>({})
        //..................................
      })[this.embedIn]())
    },
    //--------------------------------------
    theSize() {
      return /^(auto|stretch)$/.test(this.size) 
        ? null : this.size
    },
    //--------------------------------------
    theFlexName() {
      if("auto" == this.flex) {
        if("stretch" == this.size || Ti.Util.isNil(this.size)) {
          return "both"
        }
        return "none"
      }
      return this.flex || "both"
    },
    //--------------------------------------
    isShowHeader() {
      if(this.hideTitle || 'tabs' == this.embedIn) {
        return false
      }
      if(this.title || this.hasActions) {
        return true
      }
      return false
    },
    //--------------------------------------
    hasActions() {
      return !_.isEmpty(this.actions)
    },
    //--------------------------------------
    theCom() {
      //....................................
      // Body -> Component
      if(this.body) {
        let com = _.isString(this.body) ? this.schema[this.body] : this.body
        if(com) {
          let parent = this.schema[com.extends]
          let self = _.omit(com, "extends")
          com = _.merge({}, parent, self)
          return _.defaults(com, {
            comType : "ti-label",
            comConf : {}
          })
        }
      }
      //....................................
      // Sub GUI
      if(!_.isEmpty(this.blocks)) {
        let comType = `ti-gui-${this.type||"cols"}`
        let comConf = {
          // tabAt      : this.tabAt,
          // border     : this.border,
          // adjustable : this.adjustable,
          blocks     : this.blocks,
          schema : this.schema,
          actionStatus : this.actionStatus,
          shown  : this.shown
        }
        return {
          comType, comConf
        }
      }
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async hijackEmit(name, args) {
      //console.log("ti-gui-block::hijackEmit->", name, args)
      //....................................
      // Capture Events
      let callName = _.get(this.captureEvents, name)
      if(callName) {
        //console.log("!captureEvents", name, args)
        let $body  = _.last(this.$children)
        let callFn = _.get($body, callName)
        if(_.isFunction(callFn)) {
          callFn.apply($body, [{name, args}])
        }
      }
      //....................................
      // By Pass: "block:show/hide/event"
      else if(/^block:(shown?|hide|event)$/.test(name)) {
        await this.$emit(name, ...args)
      }
      //....................................
      // Gen Block Event
      else {
        await this.$emit("block:event", {
          block : this.name,
          name, args
        })
      }
      //....................................
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default {
  ///////////////////////////////////////////
  inject : ["$gui"],
  /////////////////////////////////////////
  props : {
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
    // Those 3 props for by-pass to sub-(cols/rows)
    "tabAt"      : undefined,
    "adjustable" : undefined,
    "border"     : undefined
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        [`gui-block-${this.name}`] : this.name ? true : false,
        "is-show-header"  : this.isShowHeader,
        "is-hide-header"  : !this.isShowHeader,
        "ti-fill-parent" : /^(tabs|panel)$/.test(this.embedIn)
      }, `is-flex-${this.FlexName}`)
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle(({
        //..................................
        rows:()=>({
          height: this.TheSize
        }),
        //..................................
        cols:()=>({
          width : this.TheSize
        }),
        //..................................
        tabs:()=>({}),
        //..................................
        panel:()=>({})
        //..................................
      })[this.embedIn]())
    },
    //--------------------------------------
    MainConClass() {
      return {
        "can-flex-none"   : this.isFlexNone,
        "can-flex-shrink" : !this.isFlexNone
      }
    },
    //--------------------------------------
    TheSize() {
      return /^(auto|stretch)$/.test(this.size) 
        ? null : this.size
    },
    //--------------------------------------
    FlexName() {
      if("auto" == this.flex) {
        if("stretch" == this.size || Ti.Util.isNil(this.size)) {
          return "both"
        }
        return "none"
      }
      return this.flex || "both"
    },
    //--------------------------------------
    isFlexNone() {
      return "none" == this.FlexName
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
    TheCom() {
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
          tabAt      : this.tabAt,
          border     : this.border,
          adjustable : this.adjustable,
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
    __before_bubble({name, args}) {
      if(this.name) {
        return {
          name : `${this.name}::${name}`,
          args
        }
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
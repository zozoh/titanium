export default {
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
    "tabAt" : {
      type : String,
      default : "top-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : false
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "panels" : {
      type : Array,
      default : ()=>[]
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    },
    "canLoading" : {
      type : Boolean,
      default : false
    },
    // value should be prop of ti-loading
    "loadingAs" : {
      type : [Boolean, Object],
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-loading" : this.isLoading,
        "has-panels" : this.hasPanels
      }, [
        `as-${this.type}`
      ], this.className)
    },
    //--------------------------------------
    hasPanels() {
      return !_.isEmpty(this.panels)
    },
    //--------------------------------------
    thePanels() {
      let list = []
      if(this.hasPanels) {
        for(let pan of this.panels) {
          if(this.isShown(pan.name)) {
            list.push(pan)
          }
        }
      }
      return list
    },
    //--------------------------------------
    isLoading() {
      return this.canLoading 
             && this.loadingAs 
                  ? true 
                  : false
    },
    //--------------------------------------
    showLoading() {
      if(_.isPlainObject(this.loadingAs)) {
        return this.loadingAs
      }
      return {}
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    isShown(name) {
      return this.shown[name] ? true : false
    },
    //--------------------------------------
    onTabChanged() {
      console.log(onTabChanged, arguments)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
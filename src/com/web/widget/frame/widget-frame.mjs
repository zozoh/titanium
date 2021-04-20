export default {
  /////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "src": {
      type : String,
      default: undefined
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "postPayload" : {
      type : [String, Object, Number, Boolean, Array]
    },
    "postEvents" : {
      type : [String, Array]
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "frameStyle" : {
      type : Object
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width" : {
      type : [Number, String]
    },
    "height" : {
      type : [Number, String]
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------
    FrameSrc() {
      return _.trim(this.src)
    },
    //------------------------------------
    hasFrameSrc() {
      return this.FrameSrc ? true : false
    },
    //------------------------------------
    FrameStyle() {
      return Ti.Css.toStyle(_.assign({
        border : 0, 
        width  : this.width,
        height : this.height
      }, this.frameStyle))
    },
    //------------------------------------
    PostEventNames() {
      if(this.postEvents) {
        return _.concat(this.postEvents)
      }
    },
    //------------------------------------
    hasPostEventNames() {
      return !_.isEmpty(this.PostEventNames)
    },
    //------------------------------------
    PostEventFunctions() {
      let re = []
      if(this.hasPostEventNames) {
        for(let eventName of this.PostEventNames) {
          re.push({
            index : re.length,
            eventName,
            handler : () => {
              let $fm = this.$refs.frame
              if(_.isElement($fm)) {
                $fm.contentWindow.postMessage(eventName, this.postPayload);
              }
            }
          })
        }
      }
      return re;
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  mounted() {
    for(let en of this.PostEventFunctions) {
      let {eventName, handler} = en
      console.log("add", eventName)
      window.addEventListener(eventName, handler, false)
    }
  },
  /////////////////////////////////////////
  beforeDestroy : function(){
    for(let en of this.PostEventFunctions) {
      let {eventName, handler} = en
      console.log("remove", eventName)
      window.removeEventListener(eventName, handler, false)
    }
  }
  /////////////////////////////////////////
}
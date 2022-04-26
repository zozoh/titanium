export default {
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "src": {
      type: String,
      default: undefined
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "postPayload": {
      type: [String, Object, Number, Boolean, Array]
    },
    "postEvents": {
      type: [String, Array]
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "frameStyle": {
      type: Object
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width": {
      type: [Number, String]
    },
    "height": {
      type: [Number, String]
    }
  },
  /////////////////////////////////////////
  computed: {
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
        border: 0,
        width: this.width,
        height: this.height
      }, this.frameStyle))
    },
    //------------------------------------
    PostEventNames() {
      if (this.postEvents) {
        return _.concat(this.postEvents)
      }
    },
    //------------------------------------
    hasPostEventNames() {
      return !_.isEmpty(this.PostEventNames)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods: {
    //------------------------------------
    OnFrameLoaded() {
      //console.log("OnFrameLoaded")
      this.postEventToFrame()
    },
    //------------------------------------
    postEventToFrame() {
      // Guard
      if (!this.hasPostEventNames) {
        return
      }
      // Then post event one by one
      let $fm = this.$refs.frame
      let $fw = $fm.contentWindow
      for (let eventName of this.PostEventNames) {
        $fw.postMessage({
          name: eventName,
          payload: this.postPayload
        })
      }
    }
    //------------------------------------
  }
  /////////////////////////////////////////
}
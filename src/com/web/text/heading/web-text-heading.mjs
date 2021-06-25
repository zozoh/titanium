export default {
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": undefined,
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "href": String,
    "moreHref": String,
    "showBackward": false,
    "titleNotifyName": {
      type: String,
      default: "fire"
    },
    "moreNotifyName": {
      type: String,
      default: "more"
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "icon": String,
    "title": String,
    "titleIcon": String,
    "titleClass": {
      type: [String, Array, Object]
    },
    "titleStyle": Object,
    "comment": String,
    "moreTip": String,
    "moreIconType": String,
    "moreIcon": [String, Object],
    "moreIconStyle": Object,
    "moreIconConf": Object,
    "morePreview": Object,
    "moreText": String,
    "moreNewTab": {
      type: Boolean,
      default: true
    }
  },
  //////////////////////////////////////////
  computed: {
    TopClass() {
      return this.getTopClass({
        "show-backward": this.showBackward
      })
    },
    //--------------------------------------
    TitleClass() {
      return Ti.Css.mergeClassName(this.titleClass)
    },
    //--------------------------------------
    TitleStyle() {
      return Ti.Css.toStyle(this.titleStyle)
    },
    //--------------------------------------
    showMore() {
      if (this.TheMoreIcon || this.moreText)
        return true
      return false
    },
    //--------------------------------------
    TheMoreTarget() {
      return this.moreNewTab ? "_blank" : undefined
    },
    //--------------------------------------
    TheMoreIcon() {
      let src = Ti.WWW.evalObjPreviewSrc(this.moreIcon, this.morePreview)
      if (!src) {
        return
      }
      if (this.moreIconType) {
        return {
          type: this.moreIconType,
          value: src
        }
      }
      return src
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnClickBackward() {
      if (history && _.isFunction(history.back)) {
        history.back()
      }
    },
    //--------------------------------------
    OnClickTitle() {
      if (this.titleNotifyName) {
        this.$notify(this.titleNotifyName, this.value)
      }
    },
    //--------------------------------------
    OnClickMore() {
      if (this.moreNotifyName) {
        this.$notify(this.moreNotifyName, this.value)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
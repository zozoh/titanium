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
    "moreIcon": [String, Object, Array],
    "moreIconStyle": Object,
    "moreIconConf": Object,
    "morePreview": Object,
    "moreText": String,
    "moreHref": String,
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
    showMoreIcon() {
      return !_.isEmpty(this.TheMoreIcon)
    },
    //--------------------------------------
    TheMoreTarget() {
      return this.moreNewTab ? "_blank" : undefined
    },
    //--------------------------------------
    TheMoreIcon() {
      let list = []
      let icons = _.concat(this.moreIcon)
      for (let moreIcon of icons) {
        if (!moreIcon) {
          continue
        }
        let src = Ti.WWW.evalObjPreviewSrc(moreIcon, this.morePreview)
        if (!src) {
          continue
        }
        let icon = {
          type: this.moreIconType || "image",
          value: src
        }
        icon.tip = Ti.Util.explainObj(moreIcon, this.moreTip)
        icon.href = Ti.Util.explainObj(moreIcon, this.moreHref)
        list.push(icon)
      }
      return list
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
    OnClickMore(moreIcon={}) {
      if (this.moreNotifyName) {
        this.$notify(this.moreNotifyName, moreIcon)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
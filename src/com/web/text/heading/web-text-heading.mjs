export default {
  /////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": undefined,
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "href" : String,
    "moreHref": String,
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "icon": String,
    "title" : String,
    "titleIcon" : String,
    "titleClass": {
      type: [String, Array, Object]
    },
    "titleStyle": Object,
    "comment" : String,
    "moreTip": String,
    "moreIconType": String,
    "moreIcon": [String, Object],
    "moreIconStyle": Object,
    "morePreview": Object,
    "moreText": String,
    "moreNewTab": {
      type : Boolean,
      default: true
    }
  },
  //////////////////////////////////////////
  computed: {
    TopClass() {
      return this.getTopClass()
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
      if(this.TheMoreIcon || this.moreText)
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
      if(this.moreIconType) {
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
  methods : {
    //--------------------------------------
    OnClickTitle() {
      if(this.value) {
        this.$notify("fire", this.value)
      }
    },
    //--------------------------------------
    OnClickMore() {
      if(this.more) {
        this.$notify("more", this.value)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
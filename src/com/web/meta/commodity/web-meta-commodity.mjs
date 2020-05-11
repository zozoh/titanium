export default {
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "previewSrc": {
      type: String,
      default: null
    },
    "titleKey" : {
      type : String,
      default : "title"
    },
    "buyAmount" : {
      type : Number,
      default : 1
    },
    "form" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    TopClass() {
      return this.getTopClass()
    },
    //......................................
    FormData() {
      return {
        ...this.meta,
        buyAmount : this.buyAmount
      }
    },
    //......................................
    previewImageSrc() {
      if(this.previewSrc && this.meta) {
        return Ti.S.renderBy(this.previewSrc, this.meta)
      }
    },
    //......................................
    MetaTitle() {
      if(this.titleKey) {
        return _.get(this.meta, this.titleKey)
      }
      return "NoTitle"
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    OnClickBuyNow() {
      this.$notify("buy:now")
    },
    //......................................
    OnFormChanged({name, value}) {
      this.$notify("meta:changed", {name, value})
    }
    //......................................
  }
  //////////////////////////////////////////
}
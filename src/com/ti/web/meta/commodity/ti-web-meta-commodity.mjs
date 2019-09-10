export default {
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "titleKey" : {
      type : String,
      default : "title"
    },
    "briefKey" : {
      type : String,
      default : "brief"
    },
    "priceKey" : {
      type : String,
      default : "price"
    },
    "priceFormat" : {
      type : String,
      default : "￥${price}"
    },
    "bottomLine" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    title() {
      if(this.titleKey) {
        return this.meta[this.titleKey]
      }
      return "NoTitle"
    },
    //......................................
    brief() {
      if(this.briefKey) {
        return this.meta[this.briefKey]
      }
    },
    //......................................
    price() {
      if(this.priceKey) {
        let price = this.meta[this.priceKey]
        return Ti.S.renderBy(this.priceFormat, {price})
      }
    },
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    onClickBuyNow() {
      this.$emit("buy:now")
    }
  }
  //////////////////////////////////////////
}
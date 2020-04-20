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
    "buyAmount" : {
      type : Number,
      default : 1
    },
    "fields" : {
      type : Array,
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    formData() {
      return {
        meta   : this.meta,
        buyAmount : this.buyAmount
      }
    },
    //......................................
    formConfig() {
      return {
        fields : this.fields
      }
    },
    //......................................
    title() {
      if(this.titleKey) {
        return _.get(this, this.titleKey)
      }
      return "NoTitle"
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    onClickBuyNow() {
      this.$notify("buy:now")
    },
    //......................................
    onFormChanged({name, value}) {
      this.$notify("meta:changed", {name, value})
    }
    //......................................
  }
  //////////////////////////////////////////
}
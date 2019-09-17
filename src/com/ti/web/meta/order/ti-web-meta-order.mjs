export default {
  /////////////////////////////////////////
  props : {
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "itemThumbSrc" : {
      type : String,
      default : "/api/thumb?id:${id}"
    },
    "currency" : {
      type : String,
      default : "RMB"
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    totalFee() {
      let tot = 0
      for(let it of this.items) {
        tot += Ti.WWW.evalFee(it)
      }
      return tot
    },
    //......................................
    totalFeeText() {
      return Ti.WWW.feeText(this.totalFee, this.currency)
    }
    //......................................
  },
  methods : {
    onSubmit() {
      this.$emit("order:submit", {
        items    : this.items,
        currency : this.currency
      })
    }
  }
  //////////////////////////////////////////
}
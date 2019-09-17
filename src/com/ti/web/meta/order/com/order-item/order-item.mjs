export default {
  /////////////////////////////////////////
  props : {
    "id" : {
      type : String,
      default : null
    },
    "thumb" : {
      type : String,
      default : null
    },
    "src" : {
      type : String,
      default : "/api/thumb?id:${id}"
    },
    "dftIcon" : {
      type : String,
      default : "fas-cube"
    },
    "title" : {
      type : String,
      default : null
    },
    "price" : {
      type : Number,
      default : 1
    },
    "currency" : {
      type : String,
      default : "RMB"
    },
    "amount" : {
      type : Number,
      default : 1
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    thumbObj() {
      if(this.thumb) {
        let imgSrc = Ti.S.renderBy(this.src, this)
        return {type:"image", value:imgSrc}
      }
      return this.dftIcon
    },
    //......................................
    fee() {
      return Ti.WWW.evalFee(this)
    },
    //......................................
    feeText() {
      return Ti.WWW.feeText(this.fee, this.currency)
    }
    //......................................
  }
  //////////////////////////////////////////
}
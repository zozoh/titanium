export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "payType" : {
      type : String,
      default : null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "orderData" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    topClass() {
      return {
        "is-ok"   : this.isOK,
        "is-fail" : this.isFAIL,
        "is-wait" : this.isWAIT
      }
    },
    isOK() {
      return "OK" == this.orderData.st
    },
    isFAIL(){
      return "FAIL" == this.orderData.st
    },
    isWAIT(){
      return "WAIT" == this.orderData.st
    },
    theIcon() {
      if(this.isOK) {
        return "zmdi-check-circle"
      }
      if(this.isFAIL) {
        return "zmdi-alert-octagon"
      }
      return "zmdi-notifications-active"
    },
    theTip() {
      return ({
        "OK"   : "pay-re-ok",
        "FAIL" : "pay-re-fail",
        "WAIT" : "pay-re-wait"
      })[this.orderData.st]
        || "pay-re-nil"
    }
  },
  //////////////////////////////////////////
  methods : {
    
  },
  //////////////////////////////////////////
  watch : {
    
  }
  //////////////////////////////////////////
}
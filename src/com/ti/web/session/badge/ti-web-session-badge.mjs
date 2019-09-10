export default {
  /////////////////////////////////////////
  props : {
    "me" : {
      type : Object,
      default : null
    },
    "loginIcon" : {
      type : String,
      default : "zmdi-account-circle"
    },
    "nameKeys" : {
      type : [String, Array],
      default : "name"
    },
    "loginEvent" : {
      type : String,
      default : "do:login"
    },
    "logoutEvent" : {
      type : String,
      default : "do:logout"
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    myName() {
      if(this.me) {
        return Ti.Util.getFallback(this.me, this.nameKeys) 
               || Ti.I18n.get("mine")
      }
    },
    //......................................
    myIcon() {
      if(this.me) {
        if(2 == this.me.sex) {
          return "im-user-female"
        }
        return "im-user-male"
      }
      return "far-user"
    },
    //......................................
    hasSession() {
      return this.me ? true : false
    }
    //......................................
  }
  //////////////////////////////////////////
}
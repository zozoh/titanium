export default {
  /////////////////////////////////////////
  props : {
    "me" : {
      type : Object,
      default : null
    },
    // Key to indicate Avatar existing
    // null - will not support avatar
    "avatarKey" : {
      type : String,
      default : null
    },
    // Avatar Source Template
    // null - will not support avatar
    "avatarSrc" : {
      type : String,
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
    myAvatar() {
      if(this.avatarSrc) {
        return Ti.S.renderBy(this.avatarSrc, this.me)
      }
    },
    //......................................
    hasAvatar() {
      return this.avatarSrc
        && this.avatarKey
        && this.me
        && this.me[this.avatarKey]
    },
    //......................................
    hasSession() {
      return this.me ? true : false
    }
    //......................................
  }
  //////////////////////////////////////////
}
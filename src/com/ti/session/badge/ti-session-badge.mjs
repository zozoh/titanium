const _M = {
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
    },
    /***
     * The customized link before `login/logout`.
     * 
     * ```
     * {
     *    icon   : "im-xxx",
     *    text   : "i18n:xxx",
     *    href   : "/path/to/uri"  // The <a href>
     *    newtab : false,        // if href, the open target
     *    emit   : "do:login"      // Mutex(href)
     *    inSession : true       // Show only in session
     * }
     * ```
     */
    "links" : {
      type : Array,
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    TopClass() {
      return this.getTopClass()
    },
    //......................................
    theLinks() {
      let list = []
      //---------------------------
      // Join the links
      for(let li of this.links) {
        // Ignore out-of-session link
        if(li.inSession && !this.hasSession) {
          continue;
        }
        // Join
        list.push(li)
      }
      //---------------------------
      // Add the Login/Logout link
      if(this.hasSession) {
        list.push({
          text : "i18n:logout",
          emit : this.logoutEvent
        })
      }
      // Login 
      else {
        list.push({
          text : "i18n:login",
          emit : this.loginEvent
        })
      }
      //---------------------------
      return list
    },
    //......................................
    myName() {
      if(this.me) {
        return Ti.Util.getOrPick(this.me, this.nameKeys) 
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
  },
  //////////////////////////////////////////
  methods : {
    OnClickLink(link, $event) {
      // Emit
      if(link.emit) {
        $event.preventDefault()
        this.$notify(link.emit)
      }
      // Href: do nothing
    }
  }
  //////////////////////////////////////////
}
export default _M;
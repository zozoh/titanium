export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    "params" : {
      "name"   : null,
      "passwd" : null
    }
  }),
  ///////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    // - "login-passwd" : Login by passwd
    // - "login-vcode"  : Login by phone-vcode
    // - "bind-phone"   : Bind phone to current user
    "mode" : {
      type : String,
      default : "login-passwd"
    },
    // "apiCheckName" : {
    //   type : String,
    //   default : null
    // },
    // "apiCheckPhone" : {
    //   type : String,
    //   default : null
    // },
    // "apiLoginByVcode" : {
    //   type : String,
    //   default : null
    // },
    // "apiLoginByPasswd" : {
    //   type : String,
    //   default : null
    // },
    // "apiGetVcode" : {
    //   type : String,
    //   default : null
    // }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    topClass() {
      return this.className
    },
    //---------------------------------------------------
    msgs() {
      // Login by password
      if("login-passwd" == this.mode) {
        return {
          "title"     : "i18n:auth-passwd-title",
          "nameTip"   : "i18n:auth-passwd-name-tip",
          "passwdTip" : "i18n:auth-passwd-tip",
          "btnText"   : "i18n:auth-login",
          "linkLeft"  : "i18n:auth-go-vcode",
          "linkRight" : "i18n:auth-passwd-getback",
        }
      }
      // Login by Vcode
      if("login-vcode" == this.mode) {
        return {
          "title"     : "i18n:auth-phone-title",
          "nameTip"   : "i18n:auth-phone-tip",
          "passwdTip" : "i18n:auth-phone-vcode",
          "codeGet"   : "i18n:auth-vcode-get",
          "btnText"   : "i18n:auth-login",
          "linkLeft"  : "i18n:auth-go-passwd",
          "linkRight" : "i18n:auth-vcode-lost",
        }
      }
      // Bind the phone
      if("bind-phone" == this.mode) {
        return {
          "title"     : "i18n:auth-bind-title",
          "nameTip"   : "i18n:auth-phone-tip",
          "passwdTip" : "i18n:auth-phone-vcode",
          "codeGet"   : "i18n:auth-vcode-get",
          "btnText"   : "i18n:auth-bind",
          //"linkLeft"  : "i18n:auth-bind-link-left",
          "linkRight" : "i18n:auth-vcode-lost",
        }
      }
      // Invalid mode
      throw Ti.Err.make("e.com.combo.auth.invalid-mode", this.mode)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    onChangeMode() {
      let taMode = "login-passwd" == this.mode
                      ? "login-vcode"
                      : "login-passwd"
      this.$emit("change:mode", {
        from : this.mode,
        to   : taMode
      })
    },
    //---------------------------------------------------
    doAuth() {
      Ti.Toast.Open("hahahahahahah", "info", "center")
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    "data" : {
      "name"   : null,
      "passwd" : null
    },
    "guarding" : false,
    "currentMode"  : "login_by_passwd",
    // String, Array
    "invalidField" : null 
  }),
  ///////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    // - "login_by_passwd"
    // - "login_by_vcode"
    // - "bind_account"
    "mode" : {
      type : String,
      default : "login_by_passwd"
    },
    // "invalidField" : {
    //   type : [String, Array],
    //   default : null
    // }
  },
  ///////////////////////////////////////////////////////
  watch : {
    "currentMode" : function() {
      this.guarding = false
    }
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
      if("login_by_passwd" == this.currentMode) {
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
      if("login_by_vcode" == this.currentMode) {
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
      if("bind_account" == this.currentMode) {
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
      throw Ti.Err.make("e.com.combo.auth.invalid-mode", this.currentMode)
    },
    //---------------------------------------------------
    params() {
      return _.mapValues(this.data, (str)=>_.trim(str))
    },
    //---------------------------------------------------
    isBlankNameOrPasswd() {
      let {name, passwd} = this.params
      return !name || !passwd
    },
    //---------------------------------------------------
    invalid() {
      return {
        name   : this.isInvalid("name"),
        passwd : this.isInvalid("passwd")
      }
    },
    //---------------------------------------------------
    nameClass() {
      if(this.guarding && 
        (this.invalid.name || !this.params.name))
        return "is-invalid"
    },
    //---------------------------------------------------
    passwdClass() {
      if(this.guarding && 
        (this.invalid.passwd || !this.params.passwd))
        return "is-invalid"
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    isInvalid(name="") {
      if(_.isArray(this.invalidField)) {
        return _.indexOf(this.invalidField, name) >= 0
      }
      return name == this.invalidField
    },
    //---------------------------------------------------
    onChangeMode() {
      // -> login-by-vcode
      if("login_by_passwd" == this.currentMode) {
        this.currentMode = "login_by_vcode"
      }
      // -> login-by-passwd
      else {
        this.currentMode = "login_by_passwd"
      }
      Ti.Be.BlinkIt(this.$el)  
    },
    //---------------------------------------------------
    doAuth() {
      this.guarding = true
      // Guarding
      if(this.isBlankNameOrPasswd) {
        return Ti.Toast.Open("i18n:auth-blank-name-passwd", "warn")
      }
      // Mask GUI
      let toast = Ti.Toast.Open({
        icon : "fas-spinner fa-spin",
        content : "i18n:auth-doing",
        position : "center",
        duration : 0,
        closer : false
      })

      // Do Auth
      this.$emit("do:auth", {
        type   : this.currentMode,
        name   : this.params.name,
        passwd : this.params.passwd,
        // Close loading toast
        before : ({ok}={})=> {
          toast.close()
          this.invalidField = null
        },
        ok : ()=>{
          Ti.Toast.Open({
            type : "success",
            position : "top",
            content : "i18n:auth-ok",
            duration : 2000
          })
        },
        noexist : ()=>{
          this.invalidField = "name"
        },
        invalid : ()=> {
          this.invalidField = "passwd"
        },
        others : ()=> {
          this.invalidField = ["name", "passwd"]
        },
        fail : ({errCode, data}={})=> {
          Ti.Toast.Open({
            type : "warn",
            position : "top",
            content : `i18n:${errCode}`,
            duration : 5000
          })
        }
      })
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    if(this.mode) {
      this.currentMode = this.mode
    }
  }
  ///////////////////////////////////////////////////////
}
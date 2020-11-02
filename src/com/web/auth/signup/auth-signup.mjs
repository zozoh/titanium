const _M = {
  ///////////////////////////////////////////////////////
  data : ()=>({
    "data" : {
      "name"   : null,
      "passwd" : null
    },
    "guarding" : false,
    "currentMode"  : "login_by_passwd",
    // String, Array
    "invalidField" : null,
    // delay to get the next captcha to prevent robot
    "delay" : -1
  }),
  ///////////////////////////////////////////////////////
  props : {
    // - "login_by_passwd"
    // - "login_by_phone"
    // - "login_by_email"
    // - "bind_phone"
    // - "bind_email"
    "mode" : {
      type : String,
      default : "login_by_passwd"
    },
    "toggleMode": {
      type : String,
      default : "login_by_phone"
    },
    "captcha" : {
      type : String,
      required : true,
      default : null
    },
    "scenes" : {
      type : Object,
      default: ()=>({
        robot  : "robot",
        bind_phone : "auth",
        bind_email : "auth",
        login_by_email   : "auth",
        login_by_phone   : "auth",
        login_by_passwd  : "auth"
      })
    },
    // The interval of get capche to prevent robot
    // (in second)
    "getDelay" : {
      type : Number,
      default : 60
    },
    // "invalidField" : {
    //   type : [String, Array],
    //   default : null
    // }
    "logo": {
      type: String,
      default: undefined
    },
    "oauth2": {
      type: Array,
      default: ()=>[]
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //---------------------------------------------------
    Msgs() {
      // Login by password
      if("login_by_passwd" == this.currentMode) {
        return {
          "title"     : "i18n:auth-passwd-title",
          "nameTip"   : (
            "login_by_email" == this.toggleMode
              ? "i18n:auth-passwd-name-email-tip"
              : "i18n:auth-passwd-name-phone-tip"
          ),
          "passwdTip" : "i18n:auth-passwd-tip",
          "btnText"   : "i18n:auth-login",
          "linkLeft"  : (
            "login_by_email" == this.toggleMode
              ? "i18n:auth-go-email"
              : "i18n:auth-go-phone"
          ),
          "linkRight" : "i18n:auth-passwd-getback",
          "blankName" : "i18n:auth-blank-name"
        }
      }
      // Login by Phone
      if("login_by_phone" == this.currentMode) {
        return {
          "title"     : "i18n:auth-phone-title",
          "nameTip"   : "i18n:auth-phone-tip",
          "passwdTip" : "i18n:auth-phone-vcode",
          "codeGet"   : "i18n:auth-phone-vcode-get",
          "btnText"   : "i18n:auth-login-or-signup",
          "linkLeft"  : "i18n:auth-go-passwd",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-phone"
        }
      }
      // Login by email
      if("login_by_email" == this.currentMode) {
        return {
          "title"     : "i18n:auth-email-title",
          "nameTip"   : "i18n:auth-email-tip",
          "passwdTip" : "i18n:auth-email-vcode",
          "codeGet"   : "i18n:auth-email-vcode-get",
          "btnText"   : "i18n:auth-login-or-signup",
          "linkLeft"  : "i18n:auth-go-passwd",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-email"
        }
      }
      // Bind the phone
      if("bind_phone" == this.currentMode) {
        return {
          "title"     : "i18n:auth-bind-phone-title",
          "nameTip"   : "i18n:auth-phone-tip",
          "passwdTip" : "i18n:auth-phone-vcode",
          "codeGet"   : "i18n:auth-phone-vcode-get",
          "btnText"   : "i18n:auth-bind",
          //"linkLeft"  : "i18n:auth-bind-link-left",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-phone"
        }
      }
      // Bind the email
      if("bind_email" == this.currentMode) {
        return {
          "title"     : "i18n:auth-bind-email-title",
          "nameTip"   : "i18n:auth-email-tip",
          "passwdTip" : "i18n:auth-email-vcode",
          "codeGet"   : "i18n:auth-email-vcode-get",
          "btnText"   : "i18n:auth-bind",
          //"linkLeft"  : "i18n:auth-bind-link-left",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-email"
        }
      }
      // Invalid mode
      throw Ti.Err.make("e.com.combo.auth.invalid-mode", this.currentMode)
    },
    //---------------------------------------------------
    Params() {
      return _.mapValues(this.data, (str)=>_.trim(str))
    },
    //---------------------------------------------------
    isBlankName() {
      return this.Params.name ? false : true
    },
    //---------------------------------------------------
    isBlankNameOrPasswd() {
      let {name, passwd} = this.Params
      return !name || !passwd
    },
    //---------------------------------------------------
    Invalid() {
      return {
        name   : this.isInvalid("name"),
        passwd : this.isInvalid("passwd")
      }
    },
    //---------------------------------------------------
    NameClass() {
      if(this.guarding && 
        (this.Invalid.name || !this.Params.name))
        return "is-invalid"
    },
    //---------------------------------------------------
    PasswdClass() {
      if(this.guarding && 
        (this.Invalid.passwd || !this.Params.passwd))
        return "is-invalid"
    },
    //---------------------------------------------------
    PasswdInputType() {
      return "login_by_passwd" == this.currentMode
        ? "password"
        : "text"
    },
    //---------------------------------------------------
    OAuth2Items() {
      return _.cloneDeep(this.oauth2)
    },
    //---------------------------------------------------
    hasOAuth2() {
      return !_.isEmpty(this.OAuth2Items)
    },
    //---------------------------------------------------
    hasToggleMode() {
      return !_.isEmpty(this.toggleMode)
    },
    //---------------------------------------------------
    // 验证码发送目标的名称（i18n）
    ToggleModeName(){
      return ({
        "login_by_phone" : "i18n:auth-ta-phone",
        "login_by_email" : "i18n:auth-ta-email",
        "bind_phone"     : "i18n:auth-ta-phone",
        "bind_email"     : "i18n:auth-ta-email"
      })[this.toggleMode]
    },
    //---------------------------------------------------
    // 验证码发送目标的名称（i18n）
    vCodeTargetName(){
      return ({
        "login_by_phone" : "i18n:auth-ta-phone",
        "login_by_email" : "i18n:auth-ta-email",
        "bind_phone"     : "i18n:auth-ta-phone",
        "bind_email"     : "i18n:auth-ta-email"
      })[this.currentMode]
    },
    //---------------------------------------------------
    // 验证码发送目标的名称（i18n）
    vCodeTargetBy(){
      return ({
        "login_by_phone" : "i18n:auth-ta-by-phone",
        "login_by_email" : "i18n:auth-ta-by-email",
        "bind_phone"     : "i18n:auth-ta-by-phone",
        "bind_email"     : "i18n:auth-ta-by-email"
      })[this.currentMode]
    },
    //---------------------------------------------------
    // 不同模式下的场景
    vCodeScene() {
      return _.get(this.scenes, this.currentMode) || "auth"
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnChangeMode() {
      // -> login-by-vcode
      if("login_by_passwd" == this.currentMode) {
        this.currentMode = this.toggleMode
      }
      // -> login-by-passwd
      else {
        this.currentMode = "login_by_passwd"
      }
      Ti.Be.BlinkIt(this.$el)  
    },
    //---------------------------------------------------
    OnAuthSubmit() {
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
      this.$notify("auth:send", {
        type   : this.currentMode,
        name   : this.Params.name,
        passwd : this.Params.passwd,
        // Close loading toast
        done : ()=> {
          toast.close()
          this.InvalidField = null
        },
        ok : ()=>{
          Ti.Toast.Open({
            type : "success",
            position : "top",
            content : "i18n:auth-ok",
            duration : 2000
          })
          this.$notify("auth:ok")
        },
        noexist : ()=>{
          this.InvalidField = "name"
        },
        invalid : ()=> {
          this.InvalidField = "passwd"
        },
        others : ()=> {
          this.InvalidField = ["name", "passwd"]
        },
        fail : ({errCode, data}={})=> {
          // VCode Error
          if("e.auth.captcha.invalid" == errCode) {
            Ti.Toast.Open({
              type : "warn",
              position : "top",
              content : `i18n:e-www-invalid-captcha`,
              vars : {
                ta : Ti.I18n.text(this.vCodeTargetName)
              },
              duration : 5000
            })
          }
          // NoSaltedPasswd
          else if("e.auth.login.NoSaltedPasswd" == errCode) {
            Ti.Alert("i18n:auth-login-NoSaltedPasswd", {
              title: "i18n:e-auth-login-NoSaltedPasswd",
              icon: "zmdi-shield-security",
              textOk: "i18n:i-known",
              vars: {
                ta : Ti.I18n.text(this.ToggleModeName)
              }
            })
          }
          // Others Error
          else {
            Ti.Toast.Open({
              type : "warn",
              position : "top",
              content : `i18n:${errCode}`,
              duration : 5000
            })
          }
        }
      })
    },
    //---------------------------------------------------
    async OnGetVcode() {
      this.guarding = true
      // The Account Name is required
      if(this.isBlankName) {
        this.InvalidField = "name"
        Ti.Toast.Open(this.Msgs["blankName"], "warn")
        return
      }

      // Reset invalid
      this.guarding = false
      this.InvalidField = null

      // Show the image captcha to prevent robot
      //console.log("captcha", this.captcha)
      let vars = {
        scene   : this.scenes.robot,
        account : this.Params.name
      }
      //let src = "/api/joysenses/auth/captcha?site=rv340tg5gcigsp6p5hvigc2gjb&account=18501211423"
      let src = Ti.S.renderBy(this.captcha, vars)
      let captcha = await Ti.Captcha(src)
      if(!captcha)
        return

      // Mask GUI
      let toast = Ti.Toast.Open({
        icon : "fas-spinner fa-spin",
        content : "i18n:auth-sending-vcode",
        position : "center",
        duration : 0,
        closer : false
      })

      // use the captcha to get code
      this.$notify("get:vcode", {
        type    : this.currentMode,
        scene   : this.vCodeScene,
        account : this.data.name,
        captcha,
        done: ()=>{
          toast.close()
          this.InvalidField = null
          this.data.passwd = ""
        },
        ok : ({duInMin=60}={})=>{
          console.log(arguments)
          this.delay = this.getDelay
          Ti.Toast.Open({
            type : "success",
            position : "top",
            content : "i18n:auth-sent-ok",
            vars : {
              ta  : Ti.I18n.text(this.vCodeTargetName),
              by  : Ti.I18n.text(this.vCodeTargetBy),
              min : duInMin
            },
            duration : 5000
          })
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
    },
    //---------------------------------------------------
    isInvalid(name="") {
      if(_.isArray(this.InvalidField)) {
        return _.indexOf(this.InvalidField, name) >= 0
      }
      return name == this.InvalidField
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //....................................
      // If droplist is actived, should collapse it
      if("ENTER" == uniqKey) {
        if(!this.isBlankNameOrPasswd) {
          this.$nextTick(()=>{
            this.OnAuthSubmit()
          })
          return {stop:true, quit:true}
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "currentMode" : function() {
      this.guarding = false
      //this.data.name = ""
      this.data.passwd = ""
    }
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    if(this.mode) {
      this.currentMode = this.mode
    }
    // count the secound
    this.__H = window.setInterval(()=>{
      if(this.delay>=0)
        this.delay --
    }, 1000)
  },
  ///////////////////////////////////////////////////////
  beforeDestroy : function() {
    if(this.__H) {
      window.clearInterval(this.__H)
    }
  }
  ///////////////////////////////////////////////////////
}
export default _M;
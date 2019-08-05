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
    "invalidField" : null,
    // delay to get the next captcha to prevent robot
    "delay" : -1
  }),
  ///////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    // - "login_by_passwd"
    // - "login_by_phone"
    // - "login_by_email"
    // - "bind_account"
    "mode" : {
      type : String,
      default : "login_by_passwd"
    },
    "captcha" : {
      type : String,
      required : true,
      default : null
    },
    "sceneCaptcha" : {
      type : String,
      default : "robot"
    },
    "sceneVcode" : {
      type : String,
      default : "auth"
    },
    // The interval of get capche to prevent robot
    // (in second)
    "getDelay" : {
      type : Number,
      default : 60
    }
    // "invalidField" : {
    //   type : [String, Array],
    //   default : null
    // }
  },
  ///////////////////////////////////////////////////////
  watch : {
    "currentMode" : function() {
      this.guarding = false
      this.data.name = ""
      this.data.passwd = ""
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
          "linkLeft"  : "i18n:auth-go-phone",
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
          "btnText"   : "i18n:auth-login",
          "linkLeft"  : "i18n:auth-go-passwd",
          "linkRight" : "i18n:auth-vcode-lost",
          "blankName" : "i18n:auth-blank-phone"
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
      // Bind the phone
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
    params() {
      return _.mapValues(this.data, (str)=>_.trim(str))
    },
    //---------------------------------------------------
    isBlankName() {
      return this.params.name ? false : true
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
        this.currentMode = "login_by_phone"
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
        done : ()=> {
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
    },
    //---------------------------------------------------
    async onGetVcode() {
      this.guarding = true
      // The Account Name is required
      if(this.isBlankName) {
        this.invalidField = "name"
        Ti.Toast.Open(this.msgs["blankName"], "warn")
        return
      }

      // Reset invalid
      this.guarding = false
      this.invalidField = null

      // Show the image captcha to prevent robot
      console.log("captcha", this.captcha)
      let vars = {
        scene   : this.sceneCaptcha,
        account : this.params.name
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

      // 
      let vCodeTargetName = ({
        "login_by_phone" : "i18n:auth-ta-phone",
        "bind_phone"     : "i18n:auth-ta-phone",
        "bind_email"     : "i18n:auth-ta-email"
      })[this.currentMode]
      console.log("vCodeTargetName", vCodeTargetName)

      // use the captcha to get code
      this.$emit("get:vcode", {
        type    : this.currentMode,
        scene   : this.sceneVcode,
        account : this.data.name,
        captcha,
        done: ()=>{
          toast.close()
          this.invalidField = null
          this.data.passwd = ""
        },
        ok : ({duInMin=60}={})=>{
          this.delay = this.getDelay
          Ti.Toast.Open({
            type : "success",
            position : "top",
            content : "i18n:auth-sent-ok",
            vars : {
              ta  : Ti.I18n.text(vCodeTargetName),
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
    }
    //---------------------------------------------------
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
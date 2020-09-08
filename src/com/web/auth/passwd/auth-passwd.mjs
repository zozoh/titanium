const _M = {
  ///////////////////////////////////////////////////////
  data : ()=>({
    "myPassInputType": "password",
    "myForm" : {
      "name"  : null,
      "vcode" : null,
      "passwd_old" : null,
      "passwd_new" : null,
      "passwd_ren" : null
    },
    "myPassTip": -1,
    "myMode"  : "passwd",
    // delay to get the next captcha to prevent robot
    "delay" : -1,
    "myResetResult": null,
    "doing": false
  }),
  ///////////////////////////////////////////////////////
  props : {
    // - "passwd"
    // - "phone"
    // - "email"
    "mode" : {
      type : String,
      default : "passwd"
    },
    "allowModes": {
      type: Object,
      default: ()=>({
        "passwd" : true,
        "phone"  : true,
        "email"  : true
      })
    },
    "captcha" : {
      type : String,
      //required : true,
      default : null
    },
    "scenes" : {
      type : Object,
      default: ()=>({
        "robot"  : "robot",
        "passwd" : "resetpasswd",
        "email"  : "resetpasswd",
        "phone"  : "resetpasswd"
      })
    },
    // The interval of get capche to prevent robot
    // (in second)
    "getDelay" : {
      type : Number,
      default : 60
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //---------------------------------------------------
    PasswdClass() {

    },
    //---------------------------------------------------
    TheAllowModes() {
      return Ti.Util.truthyKeys(this.allowModes)
    },
    //---------------------------------------------------
    isByVode() {
      return "passwd" != this.myMode
    },
    //---------------------------------------------------
    ModeTitle() {
      return `i18n:auth-reset-passwd-by-${this.myMode}`
    },
    //---------------------------------------------------
    VCodeNameTip() {
      return `i18n:auth-reset-passwd-by-${this.myMode}-tip`
    },
    //---------------------------------------------------
    VCodeCodeTip() {
      if("email" == this.myMode) {
        return "i18n:auth-email-vcode"
      }
      return "i18n:auth-phone-vcode"
    },
    //---------------------------------------------------
    VCodeGetTip() {
      if("email" == this.myMode) {
        return "i18n:auth-email-vcode-get"
      }
      return "i18n:auth-phone-vcode-get"
    },
    //---------------------------------------------------
    PasswdInputTypeIcon() {
      return ({
        "password": "fas-eye-slash",
        "text": "fas-eye"
      })[this.myPassInputType]
    },
    //---------------------------------------------------
    AltModes() {
      let list = []
      for(let md of this.TheAllowModes) {
        if(md != this.myMode) {
          list.push({
            text : `i18n:auth-reset-passwd-by-${md}`,
            mode : md
          })
        }
      }
      return list
    },
    //---------------------------------------------------
    hasAltModes() {
      return !_.isEmpty(this.AltModes)
    },
    //---------------------------------------------------
    PasswdTipBar() {
      let items = []
      for(let i=1; i<=5; i++) {
        items.push({
          text: `i18n:passwd-sl-${i}`,
          className: (i>this.myPassTip?"is-off":"is-on")
        })
      }
      return items;
    },
    //---------------------------------------------------
    FormStatus() {
      // passwd: Lake params
      if("passwd" == this.myMode) {
        if(!_.trim(this.myForm.passwd_old)
          || !_.trim(this.myForm.passwd_new)
          || !_.trim(this.myForm.passwd_ren)) {
          return "lack"
        }
      }
      // vcode: Lake params
      else if(!_.trim(this.myForm.name)
          || !_.trim(this.myForm.vcode)
          || !_.trim(this.myForm.passwd_new)
          || !_.trim(this.myForm.passwd_ren)) {
        return "lack"
      }

      // vcode: new password too short
      if(this.myForm.passwd_new.length < 6) {
        return "short"
      }

      // 2 password unmatched
      if(this.myForm.passwd_new != this.myForm.passwd_ren) {
        return "unmatch"
      }

      return "ready"
    },
    //---------------------------------------------------
    SubmitBtnText() {
      return `i18n:auth-reset-passwd-btn-${this.FormStatus}`
    },
    //---------------------------------------------------
    SubmitBtnClass() {
      return `is-${this.FormStatus}`
    },
    //---------------------------------------------------
    ResetOK() {
      return _.get(this.myResetResult, "ok") ? true : false
    },
    //---------------------------------------------------
    ResetDoneClass() {
      return this.ResetOK
        ? 'is-ok'
        : 'is-fail'
    },
    //---------------------------------------------------
    ResetDoneIcon() {
      return this.ResetOK
        ? "im-check-mark-circle"
        : "im-warning"
    },
    //---------------------------------------------------
    ResetDoneText() {
      return this.ResetOK
        ? "i18n:auth-reset-passwd-ok"
        : _.get(this.myResetResult, "errCode")
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnChangeMode({mode}) {
      this.myMode = mode
    },
    //---------------------------------------------------
    OnTogglePasswdInputType() {
      this.myPassInputType = ({
        "password": "text",
        "text": "password"
      })[this.myPassInputType]
    },
    //---------------------------------------------------
    OnResetAgain() {
      this.myResetResult=null
      _.assign(this.myForm, {
        "name"  : null,
        "vcode" : null,
        "passwd_old" : null,
        "passwd_new" : null,
        "passwd_ren" : null
      })
    },
    //---------------------------------------------------
    OnSubmit() {
      if("ready" == this.FormStatus) {
        this.doing = true
        this.$notify("passwd:reset", {
          mode  : this.myMode,
          scene :  _.get(this.scenes, this.myMode),
          account : _.trim(this.myForm.name),
          vcode   : _.trim(this.myForm.vcode),
          oldpwd  : _.trim(this.myForm.passwd_old),
          newpwd  : _.trim(this.myForm.passwd_new),
          done: (reo)=>{
            this.doing = false
            this.myResetResult = reo
          }
        })
      }
    },
    //---------------------------------------------------
    async OnGetVcode() {
      let name = _.trim(this.myForm.name)
      if(!name) {
        Ti.Toast.Open(`i18n:auth-reset-passwd-lack-${this.myMode}`, "warn")
        return 
      }

      let vars = {
        scene   : this.scenes.robot,
        account : name
      }

      // Get the captcha
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

      // Process to get vcode
      this.$notify("get:vcode", {
        type: this.myMode,
        scene: _.get(this.scenes, this.myMode),
        account: name,
        captcha,
        done: ()=>{
          toast.close()
          this.myForm.vcode = null
        },
        ok : ({duInMin=60}={})=>{
          this.delay = this.getDelay
          Ti.Toast.Open({
            type : "success",
            position : "top",
            content : "i18n:auth-sent-ok",
            vars : {
              ta  : Ti.I18n.get(`auth-ta-${this.myMode}`),
              by  : Ti.I18n.get(`auth-ta-by-${this.myMode}`),
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
    evalCurrentMode(mode) {
      console.log("evalCurrentMode", mode)
      // Find the first allowed modes
      if(!_.get(this.allowModes, mode)) {
        if(_.isEmpty(this.TheAllowModes)) {
          throw `mode[${mode}] push me to corner!`
        }
        return _.first(this.TheAllowModes)
      }
      // The mode seems ok
      return mode
    },
    //---------------------------------------------------
    updatePasswordTip(passwd=this.myForm.passwd_new) {
      if(_.isEmpty(passwd) || !_.isString(passwd) || passwd.length < 6) {
        this.myPassTip = -1
        return
      }
      // Score the passwd
      let score = 0
      //  > 8
      if(passwd.length > 8) {
        score += 1
      }
      // Count char type
      let map = {
        a_z: 0,
        A_Z: 0,
        dig: 0,
        spe: 0
      }
      for(let i=0; i<passwd.length; i++) {
        let code = passwd.charCodeAt(i)
        // a-z
        if(code>=97 && code<=122) {
          map.a_z = 1
        }
        // A-Z
        else if(code>=65 && code<=90) {
          map.A_Z = 1
        }
        // 0-9
        else if(code>=48 && code<=57) {
          map.dig = 1
        }
        // Special char
        else if(code>=20 && code<=128){
          map.spe = 1
        }
        // Invalid char
        else {
          this.myPassTip = -2
          return
        }
      }
      // Count score
      score += _.sum(_.values(map))

      this.myPassTip = score
    },
    //---------------------------------------------------
    syncCurrentMode() {
      this.myMode = this.evalCurrentMode(this.mode)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    "mode": {
      handler: "syncCurrentMode"
    },
    "allowModes": {
      handler: "syncCurrentMode"
    },
    "myForm.passwd_new": "updatePasswordTip"
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    this.syncCurrentMode()
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
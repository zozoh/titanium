const _M = {
  ///////////////////////////////////////////////////////
  data : ()=>({
    "myForm" : {
      "name"  : null,
      "vcode" : null,
      "passwd_old" : null,
      "passwd_new" : null,
      "passwd_ren" : null
    },
    "myMode"  : "by-passwd",
    // delay to get the next captcha to prevent robot
    "delay" : -1
  }),
  ///////////////////////////////////////////////////////
  props : {
    // - "by-passwd"
    // - "by-phone"
    // - "by-email"
    "mode" : {
      type : String,
      default : "by-passwd"
    },
    "allowModes": {
      type: Object,
      default: ()=>({
        "by-passwd" : true,
        "by-phone"  : true,
        "by-email"  : true
      })
    },
    "captcha" : {
      type : String,
      required : true,
      default : null
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
    isByVode() {
      return "by-passwd" != this.myMode
    },
    //---------------------------------------------------
    ModeTitle() {
      return `i18n:auth-reset-passwd-${this.myMode}`
    },
    //---------------------------------------------------
    VCodeNameTip() {
      return `i18n:auth-reset-passwd-${this.myMode}-tip`
    },
    //---------------------------------------------------
    VCodeCodeTip() {
      if("by-email" == this.myMode) {
        return "i18n:auth-email-vcode"
      }
      return "i18n:auth-phone-vcode"
    },
    //---------------------------------------------------
    VCodeGetTip() {
      if("by-email" == this.myMode) {
        return "i18n:auth-email-vcode-get"
      }
      return "i18n:auth-phone-vcode-get"
    },
    //---------------------------------------------------
    TheAllowModes() {
      return Ti.Util.truthyKeys(this.allowModes)
    },
    //---------------------------------------------------
    AltModes() {
      let list = []
      for(let md of this.TheAllowModes) {
        if(md != this.myMode) {
          list.push({
            text : `i18n:auth-reset-passwd-${md}`,
            mode : md
          })
        }
      }
      return list
    },
    //---------------------------------------------------
    hasAltModes() {
      return !_.isEmpty(this.AltModes)
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
    OnSubmit() {

    },
    //---------------------------------------------------
    OnGetVcode() {

    },
    //---------------------------------------------------
    evalCurrentMode(mode) {
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
    syncCurrentMode() {
      this.myMode = this.evalCurrentMode(this.mode)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    "mode": {
      handler: "syncCurrentMode",
      immediate: true
    }
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
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
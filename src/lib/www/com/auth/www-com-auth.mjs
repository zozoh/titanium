export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    "currentMode" : "login-passwd"
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
    "siteId" : {
      type : String,
      required : true,
      default : null
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    getApiUrl(path) {
      return this.$store.getters.getApiUrl(path)
    },
    //---------------------------------------------------
    onChangeMode({from,to}={}) {
      this.currentMode = to
      Ti.Be.BlinkIt(this.$el)
    },
    //---------------------------------------------------
    async onDoAuth({name, passwd, toast}={}) {
      // Toast
      
      // Prepare Request
      let params = {
        site   : this.siteId,
        passwd : passwd
      }
      // phone
      if(Ti.S.isPhoneNumber(name)) {
        params.phone = name
      }
      // Or Name
      else {
        params.name = name
      }
      // Send request
      let url = this.getApiUrl("auth/login_by_passwd")
      let reo = await Ti.Http.post(url, {params, as:"json"})
      console.log(reo)
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
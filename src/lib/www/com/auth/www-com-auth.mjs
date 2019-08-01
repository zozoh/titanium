export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    "currentMode"  : "login-passwd",
    "invalidField" : null
  }),
  ///////////////////////////////////////////////////////
  props : {
    "siteId" : {
      type : String,
      required : true,
      default : null
    },
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
      // Reset the invalid faild
      this.invalidField = null

      // Prepare Request
      let params = {
        site : this.siteId,
        name, 
        passwd
      }
      // Send request
      let url = this.getApiUrl("auth/login_by_passwd")
      let reo = await Ti.Http.post(url, {params, as:"json"})
      console.log(reo)

      // Close the toast
      if(toast)
        toast.close()

      // Prepare the messages
      let too = {position : "top"};

      // Success
      if(reo.ok && reo.data) {
        this.invalidField = null
        too.type = "success"
        too.content = `i18n:auth-ok`
        too.duration = 2000

        // save ticket
        Ti.Storage.session.set(
          `www-ticket-${this.siteId}`,
          reo.data.ticket
        )

        // Close block
      }
      // Fail 
      else {
        too.type = "warn"
        too.content = `i18n:${reo.errCode}`
        too.duration = 5000
        // Fail : noexist
        if("e.www.login.noexists" == reo.errCode) {
          this.invalidField = "name"
        }
        // Fail : invalid
        else if("e.www.login.invalid.passwd" == reo.errCode) {
          this.invalidField = "passwd"
        }
        // Fail : others
        else {
          this.invalidField = ["name", "passwd"]
        }
      }
      
      // Report the error
      Ti.Toast.Open(too)
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
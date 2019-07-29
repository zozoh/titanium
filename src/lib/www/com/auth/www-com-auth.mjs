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
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    onChangeMode({from,to}={}) {
      this.currentMode = to
      Ti.Be.BlinkIt(this.$el)
    }
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    if(this.mode) {
      this.currentMode = this.mode
    }
  }
  ///////////////////////////////////////////////////////
}
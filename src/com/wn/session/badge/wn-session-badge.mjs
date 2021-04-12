const _M = {
  /////////////////////////////////////////
  data : ()=>({
    collapse : true,
    dropReady : false
  }),
  /////////////////////////////////////////
  props : {
    "me" : {
      type : Object,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    MySex() {
      return _.get(this.me, "sex") || 0
    },
    //--------------------------------------
    MyLang() {
      return _.get(this.me, "LANG") || "zh-cn"
    },
    //--------------------------------------
    hasSession() {
      return this.me ? true : false
    },
    //--------------------------------------
    LangList() {
      return [{
        lang : "en-us",
        text : "English",
        className: {"is-current" : "en-us" == this.MyLang},
        src  : "/gu/rs/ti/icons/png/lang-en-us.png"
      }, {
        lang : "zh-cn",
        text : "简体",
        className: {"is-current" : "zh-cn" == this.MyLang},
        src  : "/gu/rs/ti/icons/png/lang-zh-cn.png"
      }, {
        lang : "zh-hk",
        text : "繁體",
        className: {"is-current" : "zh-hk" == this.MyLang},
        src  : "/gu/rs/ti/icons/png/lang-zh-hk.png"
      }]
    },
    //--------------------------------------
    TheLoginIcon() {
      if(2 == this.MySex)
        return "im-user-female"
      
      if(1 == this.MySex)
        return "im-user-male"

      return "im-user-circle"
    },
    //--------------------------------------
    DropStyle() {
      if(this.dropReady){
        return {
          "visibility": "visible"
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnResetPassword() {
      this.collapse = true
      Ti.App(this).dispatch("session/openResetPasswd")
    },
    //--------------------------------------
    OnShowMore() {
      this.collapse = false
    },
    //--------------------------------------
    async OnChangeLang(lang) {
      if(this.MyLang != lang) {
        await Wn.Sys.exec(`me -set LANG=${lang}`)
        window.location.reload()
      }
    },
    //--------------------------------------
    dockDrop() {
      let $drop = this.$refs.drop
      let $info = this.$refs.info
      // Guard the elements
      if(!_.isElement($drop) || !_.isElement($info) || this.collapse){
        return
      }
      // Dock
      Ti.Dom.dockTo($drop, $info, {
        space: {y:2}
      })
      _.delay(()=>{
        this.dropReady = true
      }, 10)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "collapse" : {
      handler : function(newVal, oldVal) {
        if(!newVal && newVal!=oldVal) {
          _.delay(()=>{
            this.dockDrop()
          }, 0)
        }
        // Collapse
        else if(newVal) {
          this.dropReady = false
        }
      },
      immediate: true
    }
  }
  //////////////////////////////////////////
}
export default _M;
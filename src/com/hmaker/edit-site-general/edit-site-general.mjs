export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    
  }),
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TheFields() {
      return [{
          title : "i18n:hmaker-site-k-domain",
          name : "domain"
        },{
          title : "i18n:hmaker-site-k-apiBase",
          name : "apiBase"
        },{
          title : "i18n:hmaker-site-k-captcha",
          name : "captcha"
        },{
          title : "i18n:hmaker-site-k-base",
          name : "base"
        },{
          title : "i18n:hmaker-site-k-entry",
          name : "entry"
        }]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}
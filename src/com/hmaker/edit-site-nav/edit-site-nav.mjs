export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    
  }),
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theFields() {
      return [{
          title : "i18n:icon",
          display : "icon",
          width : "auto"
        },{
          title : "i18n:title",
          name    : "title",
          display : true,
          width   : -120,
          comType : "ti-input"
        },{
          title : "i18n:type",
          name  : "type",
          width : 120,
          display : {
            comType : "ti-droplist",
            comConf : {
              prefixIconForClean : false,
              hideBorder : true,
              options : [{
                  icon  : "zmdi-file",
                  text  : "i18n:hmaker-nav-tp-page",
                  value : "page"
                }, {
                  icon  : "zmdi-link",
                  text  : "i18n:hmaker-nav-tp-href",
                  value : "href"
                }, {
                  icon  : "zmdi-flash-auto",
                  text  : "i18n:hmaker-nav-tp-dispatch",
                  value : "dispatch"
                }]
            }
          }
        },{
          title : "i18n:value",
          name  : "value",
          display : true,
          comType : "ti-input"
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
export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    
  }),
  //////////////////////////////////////////
  props : {
    "path" : {
      type : String,
      default : null
    },
    "node" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theCom() {
      //....................................
      // General
      if("general" == this.path) {
        return {
          comType : "hmaker-edit-site-general",
          comConf : {
            data : this.node.data
          }
        }
      }
      //....................................
      // General
      if("nav" == this.path) {
        return {
          comType : "hmaker-edit-site-nav",
          comConf : {
            data : this.node.data
          }
        }
      }
      //....................................
      // Default
      return  {
        comType : "ti-form",
        comConf : {
          config : {
            fields : [{
              name  : "path",
              //comConf : {value:this.path}
            }, {
              name : "node",
              comType : "ti-input-text",
              comConf : {
                readonly : true,
                height: "7rem"
              }
            }]
          },
          data : {
            path : this.path,
            node : JSON.stringify(this.node, null, '  ')
          }
        }
      }
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
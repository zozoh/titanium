export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    myActionMenu : null
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
    hasNode() {
      return this.path && !_.isEmpty(this.node)
    },
    //--------------------------------------
    hasActionMenu() {
      return !_.isEmpty(this.myActionMenu)
    },
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
    onChanged(payload) {
      //console.log("onChanged", payload)
      this.$emit("changed", {
        path : this.path,
        node : this.node,
        payload
      })
    },
    //--------------------------------------
    onActionsUpdated(menu={}) {
      this.myActionMenu = menu
    },
    //--------------------------------------
    callChild(actionName) {
      console.log(actionName)
      if(this.$myChildCom) {
        this.$myChildCom[actionName]()
      }
    },
    //--------------------------------------
    onChildInit($myChildCom) {
      this.$myChildCom = $myChildCom
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "path" : function() {
      this.myActionMenu = null
    }
  }
  //////////////////////////////////////////
}
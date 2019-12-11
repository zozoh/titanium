export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    comType : "ti-loading",
    comConf : {}
  }),
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : null
    },

    "loadingBy" : {
      type : Object,
      default : ()=>({
        comType : "ti-loading",
        comConf : {}
      })
    }
  },
  //////////////////////////////////////////
  methods : {
    //-------------------------------------
    showLoading() {
      if(this.loadingBy) {
        this.comType = this.loadingBy.comType
        this.comConf = this.loadingBy.comConf
      }
    },
    //-------------------------------------
    async reload() {
      let app = Ti.App(this)
      //....................................
      // Release Watch
      Ti.Shortcut.removeWatch(this)

      // Show loading
      this.showLoading()

      //....................................
      // then try to unregisterModule safely
      try{
        this.$store.unregisterModule("main")
      }catch(Err){}

      //....................................
      // Load the module/component for the object
      if(_.isPlainObject(this.meta)) {
        //..................................
        // Get back the viewName from hash
        let m = /^#!(.+)$/.exec(window.location.hash)
        let viewName = m ? m[1] : null

        let cmdText;
        //..................................
        // If defined the viewName
        if(viewName) {
          cmdText = `ti views -cqn -name '${viewName}'`
        }
        // Query by current object
        else {
          cmdText = `ti views -cqn id:${meta.id}`
        }
        //..................................
        // Load the main view
        let mainView = await Wn.Sys.exec2(cmdText, {as:"json"})
        if(Ti.IsInfo("app/wn.manager")) {
          console.log("ReloadMainView", mainView)
        }
        //..................................
        //console.log(mainView)
        // Load moudle/component
        let view = await $app.loadView("main", mainView, {
          updateStoreConfig : config=>{
            if(!config.state) {
              config.state = {}
            }
          },
          // Add hook to get back the mainView instance
          updateComSetup : conf=>{
            conf.mixins = [].concat(conf.mixins||[])
            conf.mixins.push({
              mounted : function(){
                $app.$vmMain(this)
              }
            })
          }
        })
        //..................................
        if(Ti.IsInfo("app/wn.manager")) {
          console.log("TiView Loaded:", view)
        }
      }

    }
    //-------------------------------------
  },
  //////////////////////////////////////////
  watched : {
    "meta" : function() {
      this.reload()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.reload()
  }
  //////////////////////////////////////////
}
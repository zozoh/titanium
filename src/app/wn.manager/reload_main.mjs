// Ti required(Wn)
//---------------------------------------
export default function reloadMain(meta) {
    let vm = this

    // default meta
    if(!meta) {
      mata = vm.obj.meta
    }

    // Switch to Loading component
    vm.mainView = {
      comIcon : "zmdi-more",
      comName : vm.loadingCom
    }
    // then try to unregisterModule safely
    try{
      vm.$store.unregisterModule("main")
    }catch(Err){}

    // Load the module/component for the object
    if(meta) {
      let mainView = {
        comType  : null,
        modType : null
      }
      // Folder
      if('DIR' == meta.race) {
        mainView.comIcon = "im-archive"
        mainView.comType = "@com:wn/list/adaptview"
        mainView.modType = "@mod:wn/obj-explorer"
      }
      // Text
      else if(Wn.Util.isMimeText(meta.mime)) {
        mainView.comIcon = "im-edit"
        mainView.comType = "@com:wn/obj/puretext"
        mainView.modType = "@mod:wn/obj-as-text"
        mainView.actions = [{
            key  : "save",
            type : "action",
            icon : "zmdi-floppy",
            text : "i18n:save-change",
            altDisplay : {
              icon : "fas-spinner fa-pulse",
              text : "i18n:saving",
            },
            action : "dispatch:main/save",
            shortcut : "CTRL+S"
          }, {
            key  : "reload",
            type : "action",
            icon : "zmdi-refresh",
            text : "i18n:refresh",
            altDisplay : {
              icon : "zmdi-refresh zmdi-hc-spin",
              text : "i18n:loading",
            },
            action : "dispatch:main/reload",
            shortcut : "CTRL+R"
          }, {
            key  : "more",
            type : "group",
            icon : "zmdi-settings",
            text : "i18n:more",
            items : [{
              key  : "save",
              type : "action",
              icon : "zmdi-floppy",
              text : "i18n:save-change",
              altDisplay : {
                icon : "fas-spinner fa-pulse",
                text : "i18n:saving",
              },
              action : "dispatch:main/save",
            }]
          }]
      }
      // Others like Image/Video or another binary stream
      else {
        mainView.comIcon = "im-eye"
        mainView.comType = "@com:wn/obj/preview"
        mainView.modType = "@mod:wn/obj-as-binary"
      }
      // Register Module
      //console.log(mainView)

      // Load moudle/component
      let $app = Ti.App(vm)
      $app.loadView("main", mainView).then((view)=>{
        if(Ti.IsInfo()) {
          console.log("TiView Loaded:", view)
        }
        // switch to main component
        vm.mainView = view
        
        // call main reload
        $app.dispatch("main/reload", meta)
      })
      }
  } // reloadMain
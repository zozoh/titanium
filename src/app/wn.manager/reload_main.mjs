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
      vm.$app.loadView("main", mainView).then((view)=>{
        if(Ti.IsInfo()) {
          console.log("TiView Loaded:", view)
        }
        // switch to main component
        vm.mainView = view
        // call main reload
        vm.$store.dispatch("main/reload", meta)
      })
      }
  } // reloadMain
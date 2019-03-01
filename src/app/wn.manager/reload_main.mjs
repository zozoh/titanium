export default function reloadMain(meta) {
    let vm = this

    // default meta
    if(!meta) {
      mata = vm.obj.meta
    }

    // Switch to Loading component
    vm.mainComType = vm.loadingComType
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
        mainView.comIcon = "im-folder-open"
        mainView.comType = "@com:wn/list/adaptview"
        mainView.modType = "@mod:wn/obj-explorer"
      }
      // Text
      else if(/^text\//.test(meta.mime) || "application/x-javascript" == meta.mime) {
        mainView.comType = "@com:wn/obj/puretext"
        mainView.modType = "@mod:wn/obj-as-text"
      }
      // Others like Image/Video or another binary stream
      else {
        mainView.comType = "@com:wn/obj/preview"
        mainView.modType = "@mod:wn/obj-as-binary"
      }
      // Register Module
      //console.log(mainView)

      // Load moudle/component
      vm.$app.loadView("main", mainView).then((view)=>{
        console.log(view)
        // switch to main component
        vm.mainView = view
        // call main reload
        vm.$store.dispatch("main/reload", meta)
      })
      }
  } // reloadMain
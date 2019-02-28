export default {
  /***
   * compute the obj link
   */
  getObjLink(meta) {
    return '/a/open/wn.manager?ph=id:'+meta.id
  },
  onOpen(meta) {
    let vm = this
    vm.$store.dispatch("wn-obj-meta/reload", meta).then((meta)=>{
      let his = window.history
      if(his) {
        let newLink = vm.getObjLink(meta)
        let title =  Wn.Util.getObjDisplayName(meta)
        console.log(title , "->", newLink)
        his.pushState(meta, title, newLink)
      }
    })
  },
  /***
   * It will reload main moudle by obj.meta
   */
  reloadMain(meta) {
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
        mainView.comType = "@com:wn-obj-explorer"
        mainView.modType = "@mod:wn-obj-explorer"
      }
      // Text
      else if(/^text\//.test(meta.mime)) {
        mainView.comType = "@com:ti-obj-text"
        mainView.modType = "@mod:wn-obj-binary"
      }
      // Image
      else if(/^image\//.test(meta.mime)) {
        mainView.comType = "@com:ti-obj-image"
        mainView.modType = "@mod:wn-obj-binary"
      }
      // Video
      else if(/^video\//.test(meta.mime)) {
        mainView.comType = "@com:ti-obj-video"
        mainView.modType = "@mod:wn-obj-binary"
      }
      // Others
      else {
        mainView.comType = "@com:ti-obj-binary"
        mainView.modType = "@mod:wn-obj-binary"
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
}
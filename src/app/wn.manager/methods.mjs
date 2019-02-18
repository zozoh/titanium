export default {
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
        component  : null,
        moduleName : null
      }
      // Folder
      if('DIR' == meta.race) {
        mainView.component  = "@com:wn-obj-explorer";
        mainView.moduleName = "@mod:wn-obj-explorer";
      }
      // Text
      else if(/^text\//.test(meta.mime)) {
        mainView.component  = "@com:ti-obj-text";
        mainView.moduleName = "@mod:wn-obj-binary";
      }
      // Image
      else if(/^image\//.test(meta.mime)) {
        mainView.component  = "@com:ti-obj-image";
        mainView.moduleName = "@mod:wn-obj-binary";
      }
      // Video
      else if(/^video\//.test(meta.mime)) {
        mainView.component  = "@com:ti-obj-video";
        mainView.moduleName = "@mod:wn-obj-binary";
      }
      // Others
      else {
        mainView.component  = "@com:ti-obj-binary";
        mainView.moduleName = "@mod:wn-obj-binary";
      }
      // Register Module
      //console.log(mainView)

      // Load moudle/component
      vm.$app.loadView("main", mainView).then(({com})=>{
        // switch to main component
        if(com)
          vm.mainComType = com
        // call main reload
        vm.$store.dispatch("main/reload", meta)
      })
    }
  }
}
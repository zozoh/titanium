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
        mainView.component  = "ti-obj-explorer";
        mainView.moduleName = "obj-explorer";
      }
      // Text
      else if(/^text\//.test(meta.mime)) {
        mainView.component  = "ti-obj-text";
        mainView.moduleName = "obj-binary";
      }
      // Image
      else if(/^image\//.test(meta.mime)) {
        mainView.component  = "ti-obj-image";
        mainView.moduleName = "obj-binary";
      }
      // Video
      else if(/^video\//.test(meta.mime)) {
        mainView.component  = "ti-obj-video";
        mainView.moduleName = "obj-binary";
      }
      // Others
      else {
        mainView.component  = "ti-obj-binary";
        mainView.moduleName = "obj-binary";
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
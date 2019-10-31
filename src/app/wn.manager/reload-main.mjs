// Ti required(Wn)
//---------------------------------------
export default async function reloadMain(meta) {
  let vm = this
  let $app = Ti.App(vm)

  vm.reloading = true
  vm.mainActions = []

  // Release Watch
  if(vm.mainView) {
    Ti.Shortcut.removeWatch(vm.mainView)
  }

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
    // Get back the viewName from hash
    let m = /^#!(.+)$/.exec(window.location.hash)
    let viewName = m ? m[1] : null

    let cmdText;
    // If defined the viewName
    if(viewName) {
      cmdText = `ti views -cqn -name '${viewName}'`
    }
    // Query by current object
    else {
      cmdText = `ti views -cqn id:${meta.id}`
    }
    // Load the main view
    let mainView = await Wn.Sys.exec2(cmdText, {as:"json"})
    if(Ti.IsInfo("app/wn.manager")) {
      console.log("ReloadMainView", mainView)
    }
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
    
    if(Ti.IsInfo("app/wn.manager")) {
      console.log("TiView Loaded:", view)
    }
    // switch to main component
    vm.mainView = view

    // Add Shortcut watching
    if(_.isArray(view.actions)) {
      Ti.Shortcut.addWatch(vm.mainView, view.actions)
    }
    
    // call main reload
    await $app.dispatch("main/reload", meta)
  }
  // Remove mainView
  else {
    $app.$vmMain(null)
  }

  vm.reloading = false
} // reloadMain
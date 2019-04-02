// Ti required(Wn)
//---------------------------------------
export default async function reloadMain(meta) {
  let vm = this
  let $app = Ti.App(vm)

  vm.reloading = true

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
    let mainView = await Wn.Sys.exec2(
        vm, `ti views -cqn id:${meta.id}`, {as:"json"})
    if(Ti.IsInfo("app/wn.manager")) {
      console.log("ReloadMainView", mainView)
    }
    // Load moudle/component
    let view = await $app.loadView("main", mainView, {
      // Add hook to get back the mainView instance
      updateComSetup : setup=>{
        setup.options.mixins = [].concat(setup.options.mixins||[])
        setup.options.mixins.push({
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
    
    // call main reload
    await $app.dispatch("main/reload", meta)
  }
  // Remove mainView
  else {
    $app.$vmMain(null)
  }

  vm.reloading = false
} // reloadMain
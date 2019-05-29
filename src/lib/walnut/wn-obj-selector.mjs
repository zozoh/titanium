/***
 * Open Modal Dialog to explore one or multi files
 */
export async function OpenObjSelector(pathOrObj="~", {
  title = "i18n:select", 
  icon = "im-folder-open",
  className,
  closer = true,
  type = "info", 
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  width="80%", height="90%",
  multi=false,
  selected=[],
  autoOpenDir=false,
  spacing="xs"}={}){
  //................................................
  // Prepare the DOM
  let html = `<wn-explorer 
    :loading="loading"
    :ancestors="obj.ancestors"
    :meta="obj.meta"
    :status="mainStatus"
    @main:open="onMainViewOpen">
    <template v-slot:arena>
      <wn-adaptlist
        class="ti-fill-parent" 
        v-bind="mainData"
        :multi="${multi}"
        spacing="${spacing}"
        @open="onMainViewOpen"/>
    </template>
  </wn-explorer>`
  //................................................
  // Open modal dialog
  let reObj = await Ti.Modal({
    "template" : html,
    /////////////////////////////////////////////////
    "data" : {
      loading : true
    },
    /////////////////////////////////////////////////
    "store" : {
      "modules" : {
        "page" : "@mod:ti/page",
        "meta" : "@mod:wn/obj-meta",
        "main" : "@mod:wn/obj-explorer"
      }
    },
    /////////////////////////////////////////////////
    "computed" : {
      ...Vuex.mapGetters("meta", {
        "obj" : "get"
      }),
      ...Vuex.mapGetters("main", {
        "selected" : "selectedItems",
        "actived"  : "activeItem"
      }),
      mainStatus() {
        let status = {}
        if(this.mainData) {
          _.assign(status, this.mainData.status)
        }
        return status
      },
      mainData() {
        return _.pickBy(this.$store.state.main, (val, key)=>{
          return key && !key.startsWith("_")
        })
      }
    },
    /////////////////////////////////////////////////
    "methods" : {
      async onMainViewOpen(meta){
        // console.log("meta", meta)
        let meta2 = await this.$store.dispatch("meta/reload", meta)
        return await this.$store.dispatch("main/reload", meta2)
      }
    },
    //................................................
    // Load meta at first
    "mounted" : async function(){
      let app = Ti.App(this)
      this.loading = true
      // Try Load
      try {
        // Try get meta
        let meta
        if(_.isString(pathOrObj))
          meta = await Wn.Io.loadMeta(pathOrObj)
        else
          meta = pathOrObj
        
        // Reloading relatived data
        if(meta) {
          // Make sure curretn is directory
          if(!autoOpenDir || 'DIR' != meta.race) {
            meta = await Wn.Io.loadMetaById(meta.pid)
          }
          // Reload ancestors
          await app.dispatch("meta/reload", meta)
          // Reload children
          await app.dispatch("main/reload", meta)
          // Then highlight the selection
          app.commit("main/setSelected", selected)
        }
        // Report Error
        else {
          let msg = Ti.I18n.get('e-io-obj-noexists') + " : " + pathOrObj
          await Ti.Alert(msg, {
            title : "i18n:warn",
            type : "warn"
          })
        }
      }
      // Handle Error
      catch(err) {
        console.log(err)
        let msg = Ti.I18n.get(err.msg, err) + " : " + err.data
        await Ti.Alert(msg, {
          title : "i18n:warn",
          type : "warn"
        })
      }
      // Mark loading done!
      this.loading = false
    }
  }, {
    icon, title, type, width, height, className, closer,
    actions : [{
      text : textOk,
      handler : function({app}){
        if(multi) {
          return app.self("selected");
        }
        return app.self("actived");
      }
    }, {
      text : textCancel
    }]
  })
  //................................................
  // End of OpenObjSelector
  return reObj
}
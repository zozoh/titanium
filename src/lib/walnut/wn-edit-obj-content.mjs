////////////////////////////////////////////////////
export async function EditObjContent(pathOrObj="~", {
  title = "i18n:info", 
  icon  = "far-file-alt",
  type  = "info",
  className,
  closer = true,
  // undefined is auto, null is hidden
  // if auto, 'i18n:save' for saveBy, else 'i18n:ok'
  textOk = undefined,  
  textCancel = "i18n:cancel",
  width=640, height="80%",
  readonly=false,
  showEditorTitle=true,
  content=null,
  saveBy="content/save",
  blankText="i18n:blank"
}={}){
  //................................................
  // Load meta
  let obj = pathOrObj
  if(_.isString(pathOrObj)) {
    obj = await Wn.Io.loadMeta(pathOrObj)
  }
  //................................................
  if(_.isUndefined(textOk)) {
    textOk = this.saveBy ? 'i18n:save' : 'i18n:ok'
  }
  //................................................
  // Prepare the DOM
  let html = `<ti-text-raw
    class="ti-fill-parent"
    :icon="theIcon"
    :title="theTitle"
    :readonly="readonly"
    :show-title="showEditorTitle"
    :content="content"
    :content-is-changed="theStatusChanged"
    :blank-text="blankText"
    @changed="onChangeContent"/>`
  //................................................
  // Open modal dialog
  let reObj = await Ti.Modal.Open({
    template : html,
    /////////////////////////////////////////////////
    data : {
      readonly, showEditorTitle, blankText
    },
    /////////////////////////////////////////////////
    store : {
      modules : {
        content : "@mod:wn/obj-current"
      }
    },
    /////////////////////////////////////////////////
    computed : {
      //--------------------------------------------
      ...Vuex.mapState("content", ["meta", "status", "content"]),
      //--------------------------------------------
      theIcon() {
        if(this.meta) {
          return Wn.Util.getIconObj(this.meta)
        }
        return Ti.Icons.get()
      },
      //--------------------------------------------
      theTitle() {
        if(this.meta) {
          return this.meta.title || this.meta.nm
        }
        return "no-title"
      },
      //--------------------------------------------
      theStatusChanged() {
        return this.status ? this.status.changed : false
      }
      //--------------------------------------------
    },
    /////////////////////////////////////////////////
    methods : {
      //--------------------------------------------
      async onChangeContent(content) {
        Ti.App(this).dispatch("content/onChanged", content)
      }
      //--------------------------------------------
    },
    /////////////////////////////////////////////////
    // Load meta at first
    mounted : async function(){
      let app = Ti.App(this)
      // Do reload
      if(Ti.Util.isNil(content)) {
        app.dispatch("content/reload", obj)
      }
      // Do show content
      else {
        app.commit("content/setMeta", obj)
        app.dispatch("content/updateContent", content)
      }
    },
    /////////////////////////////////////////////////
    components : ["@com:ti/text/raw"]
    /////////////////////////////////////////////////
  }, {
    icon, title, type, width, height, className, closer,
    actions : [{
      text : textOk,
      handler : async ({app})=>{
        // Auto Save
        if(saveBy) {
          await app.dispatch(saveBy)
        }
        return app.$vm().content
      },
    }, {
      text : textCancel
    }]
  })
  //................................................
  return reObj
}
////////////////////////////////////////////////////
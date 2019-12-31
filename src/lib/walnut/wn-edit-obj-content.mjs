////////////////////////////////////////////////////
export async function EditObjContent(pathOrObj="~", {
  title = "i18n:info", 
  icon  = "far-file-alt",
  type  = "info",
  className,
  closer = true,
  textOk = "i18n:save",
  textCancel = "i18n:cancel",
  width=640, height="80%",
  readonly=false,
  showTitle=true,
  blankText="i18n:blank"
}={}){
  //................................................
  // Load meta
  let obj = pathOrObj
  if(_.isString(pathOrObj)) {
    obj = await Wn.Io.loadMeta(pathOrObj)
  }
  //................................................
  // Prepare the DOM
  let html = `<ti-text-raw
    class="ti-fill-parent"
    :icon="theIcon"
    :title="theTitle"
    :readonly="readonly"
    :show-title="showTitle"
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
      readonly, showTitle, blankText
    },
    /////////////////////////////////////////////////
    store : {
      modules : {
        content : "@mod:wn/obj-as-text"
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
      async onChangeContent(text) {
        Ti.App(this).dispatch("content/onChanged", {content:text})
      }
      //--------------------------------------------
    },
    /////////////////////////////////////////////////
    // Load meta at first
    mounted : async function(){
      Ti.App(this).dispatch("content/reload", obj)
    },
    /////////////////////////////////////////////////
    components : ["@com:ti/text/raw"]
    /////////////////////////////////////////////////
  }, {
    icon, title, type, width, height, className, closer,
    actions : [{
      text : textOk,
      handler : async ({app})=>{
        await app.dispatch("content/save")
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
////////////////////////////////////////////////////
async function EditObjMeta(pathOrObj = "~", {
  icon, title,
  type = "info",
  closer = true,
  escape = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position = "top",
  width = 640,
  height = "90%",
  spacing,
  currentTab = 0,
  // static tabs
  // if emtpy, apply the default
  // “auto" will load by `ti editmeta`, it will override the currentTab
  fields = [],
  fixedKeys = ["icon", "thumb", "title"],
  saveKeys = ["thumb"],  // If the key changed, `cancel` same as `OK`
  autoSave = true
} = {}) {
  //............................................
  // Load meta
  let meta = pathOrObj
  if (_.isString(meta)) {
    meta = await Wn.Io.loadMeta(pathOrObj)
  }
  //............................................
  // Save key map
  let saves = {}
  _.forEach(saveKeys, k => saves[k] = true)
  //............................................
  let reo = await Wn.Obj.genObjFormFields({
    meta, fields, currentTab, fixedKeys
  })
  let myFormFields = reo.fields
  currentTab = reo.currentTab || currentTab || 0

  //............................................
  let theIcon = icon || Wn.Util.getObjIcon(meta, "zmdi-info-outline")
  let theTitle = title || Wn.Util.getObjDisplayName(meta)
  //............................................
  reo = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer, escape,
    icon: theIcon,
    title: theTitle,
    //------------------------------------------
    actions: [{
      text: textOk,
      handler: ({ $main }) => _.cloneDeep({
        updates: $main.updates,
        data: $main.meta
      })
    }, {
      text: textCancel,
      handler: ({ $main }) => {
        // Is in saveKeys
        let ks = _.keys($main.updates)
        for (let k of ks) {
          if (saves[k]) {
            return _.cloneDeep({
              updates: $main.updates,
              data: $main.meta
            })
          }
        }
        // Nothing be updated, just return undefined
      }
    }],
    //------------------------------------------
    ready() {
      this.$main.meta = meta
    },
    //------------------------------------------
    comType: "modal-inner-body",
    //------------------------------------------
    components: [{
      name: "modal-inner-body",
      globally: false,
      data: {
        myFormFields,
        currentTab,
        meta: undefined,
        updates: {}
      },
      template: `<ti-form
        mode="tab"
        :current-tab="currentTab"
        :fields="myFormFields"
        :gridColumnHint="[[1,420],0]"
        :data="meta"
        @field:change="onFieldChange"
        @change="onChange"
        />`,
      methods: {
        onChange(data) {
          this.meta = data
        },
        onFieldChange({ name, value } = {}) {
          let obj = Ti.Types.toObjByPair({ name, value })
          this.updates = _.assign({}, this.updates, obj)
        }
      }
    },
      "@com:ti/form",
      "@com:ti/input/text",
      "@com:wn/imgfile",
      "@com:wn/obj/mode"]
    //------------------------------------------
  })
  //............................................
  // User cancel
  if (!reo) {
    return
  }
  //............................................
  let { updates } = reo
  let saved = false
  if (autoSave && !_.isEmpty(updates)) {
    let json = JSON.stringify(updates)
    let cmdText = `obj 'id:${meta.id}' -ocqn -u`
    let newMeta = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })
    await Ti.Toast.Open("i18n:save-done", "success")
    saved = true

    return { updates, data: newMeta, saved }
  }
  //............................................
  return reo
}
////////////////////////////////////////////////////
export default EditObjMeta;
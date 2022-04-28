/***
 * Open Modal Dialog to explore one or multi files
 */
async function OpenObjSelector(pathOrObj = "~", {
  title = "i18n:select",
  icon = "im-folder-open",
  type = "info", closer = true,
  textOk = "i18n:ok",
  textCancel = "i18n:cancel",
  position = "top",
  width = "80%", height = "90%", spacing,
  multi = true,
  titleBy = "title|nm",
  fromIndex = 0,
  exposeHidden = false,
  homePath = Wn.Session.getHomePath(),
  fallbackPath = Wn.Session.getHomePath(),
  sideItems = [],
  sideWidth = "2rem",
  search = {
    filter: {},
    sorter: { nm: 1 }
  },
  filter = o => "FILE" == o.race,
  canOpen = o => "DIR" == o.race,
  selected = []
} = {}) {
  //................................................
  // Load the target object
  let meta = pathOrObj;
  if (_.isString(pathOrObj))
    meta = await Wn.Io.loadMeta(pathOrObj)
  // Fallback
  if (!meta && fallbackPath && pathOrObj != fallbackPath) {
    meta = await Wn.Io.loadMeta(fallbackPath)
  }
  // Fail to load
  if (!meta) {
    return await Ti.Toast.Open({
      content: "i18n:e-io-obj-noexistsf",
      vars: _.isString(pathOrObj)
        ? { ph: pathOrObj, nm: Ti.Util.getFileName(pathOrObj) }
        : pathOrObj.ph
    }, "warn")
  }
  //................................................
  // Eval side items
  let sideCandidateItems = []
  for (let si of sideItems) {
    let sideObj = await Wn.Io.loadMeta(si)
    if (sideObj) {
      sideCandidateItems.push({
        depth: 0,
        key: sideObj.id,
        id: sideObj.id,
        path: sideObj.ph,
        icon: Ti.Icons.get(sideObj),
        title: sideObj.title || sideObj.nm
      })
    }
  }
  //................................................
  // Make sure the obj is dir
  if ("DIR" != meta.race) {
    meta = await Wn.Io.loadMetaById(meta.pid)
    if (!meta) {
      return await Ti.Toast.Open({
        content: "i18n:e-io-obj-noexistsf",
        vars: {
          ph: `Parent of id:${meta.id}->pid:${meta.pid}`,
          nm: `Parent of id:${meta.nm}->pid:${meta.pid}`,
        }
      }, "warn")
    }
  }
  //................................................
  // Open modal dialog
  let reObj = await Ti.App.Open({
    //------------------------------------------
    type, width, height, spacing, position, closer,
    icon, title,
    //------------------------------------------
    actions: [{
      text: textOk,
      handler: ({ $main }) => {
        return $main.myChecked
      }
    }, {
      text: textCancel,
      handler: () => undefined
    }],
    //------------------------------------------
    modules: {
      axis: "@mod:wn/obj-axis",
      current: "@mod:wn/obj-current",
      main: "@mod:wn/obj-children"
    },
    //------------------------------------------
    comType: "modal-inner-body",
    //------------------------------------------
    components: [
      "@com:ti/crumb",
      "@com:wn/adaptlist",
      "@com:wn/gui/side/nav",
      {
        //////////////////////////////////////////
        name: "modal-inner-body",
        globally: false,
        //////////////////////////////////////////
        data: {
          myChecked: [],
          myShown: {
            side: sideCandidateItems.length > 1
          }
        },
        //////////////////////////////////////////
        props: {
          "icon": undefined,
          "text": undefined,
          "trimed": undefined,
          "placeholder": undefined,
          "valueCase": undefined,
          "value": undefined
        },
        //////////////////////////////////////////
        template: `<ti-gui
        :layout="TheLayout"
        :schema="TheSchema"
        :shown="myShown"
        :can-loading="true"
        :loading="status.reloading"
        @item:active="OnCurrentMetaChange"
        @arena::open:wn:obj="OnCurrentMetaChange"
        @arena::select="OnArenaSelect"/>`,
        //////////////////////////////////////////
        computed: {
          //--------------------------------------
          ...Vuex.mapState("axis", [
            "ancestors", "parent"]
          ),
          //--------------------------------------
          ...Vuex.mapState("current", [
            "meta", "status", "fieldStatus"]),
          //--------------------------------------
          ...Vuex.mapState("main", [
            "data"]),
          //--------------------------------------
          CrumbData() {
            let crumbs = Wn.Obj.evalCrumbData({
              meta: this.meta,
              ancestors: this.ancestors,
              fromIndex,
              homePath,
              titleBy,
              iteratee: (item, i, { nm } = {}) => {
                if (!exposeHidden && nm && nm.startsWith(".")) {
                  return
                }
                return item
              }
            })
            // Cancel the first item icon
            if (!_.isEmpty(crumbs)) {
              crumbs[0].icon = null
            }
            return crumbs
          },
          //--------------------------------------
          SideConfig() {
            return {
              items: sideCandidateItems,
              highlightItemId: _.get(this.meta, "id"),
              highlightItemPath: _.get(this.meta, "ph")
            }
          },
          //--------------------------------------
          TheLayout() {
            return {
              type: "rows",
              border: true,
              blocks: [{
                name: "sky",
                size: ".5rem",
                body: "sky"
              }, {
                type: "cols",
                border: true,
                blocks: [{
                  name: "side",
                  size: sideWidth,
                  body: "side"
                }, {
                  name: "arena",
                  body: "main"
                }]
              }]
            }
          },
          //--------------------------------------
          TheSchema() {
            return {
              "sky": {
                comType: "ti-crumb",
                comConf: {
                  "style": { padding: "0 .1rem" },
                  "data": this.CrumbData
                }
              },
              "side": {
                comType: "wn-gui-side-nav",
                comConf: this.SideConfig
              },
              "main": {
                comType: "wn-adaptlist",
                comConf: {
                  "meta": this.meta,
                  "data": this.data,
                  "status": this.status,
                  "multi": multi,
                  "listConf": {
                    resizeDelay: 200
                  },
                  "itemTitleKey": titleBy
                }
              }
            }
          }
        },
        //////////////////////////////////////////
        methods: {
          //--------------------------------------
          OnCurrentMetaChange({ id, path, value } = {}) {
            this.open(id || path || value)
          },
          //--------------------------------------
          OnArenaSelect({ checked }) {
            //console.log("OnArenaSelect", checked)
            if (_.isFunction(filter))
              this.myChecked = _.filter(checked, (obj) => {
                if (filter(obj))
                  return true
                return false
              })
            else
              this.myChecked = checked
          },
          //--------------------------------------
          async open(obj) {
            // Guard
            if (!obj) {
              return
            }

            // To WnObj
            if (_.isString(obj)) {
              obj = await Wn.Io.loadMetaBy(obj)
            }

            // Only can enter DIR
            if (canOpen(obj)) {
              let app = Ti.App(this)
              // Setup search filter/sorter
              if (search) {
                app.commit("main/setFilter", search.filter || {})
                app.commit("main/setSorter", search.sorter || { nm: 1 })
              }
              app.commit("current/setMeta", obj)
              app.dispatch("main/reload", obj)
              app.dispatch("axis/reload", obj)
            }
            // Double click file to select and click "OK"
            else {
              console.log(this.myChecked)
              this.$notify("ok", this.myChecked)
            }
          }
          //--------------------------------------
        },
        //////////////////////////////////////////
        mounted: function () {
          this.open(meta)
        }
        //////////////////////////////////////////
      }]  // ~ components: []
    //------------------------------------------
  })
  //................................................
  // End of OpenObjSelector
  return reObj
}
////////////////////////////////////////////
export default OpenObjSelector;
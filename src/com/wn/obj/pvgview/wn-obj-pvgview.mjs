const DFT_PVG = 5;
export default {
  //////////////////////////////////////////
  data: () => ({
    myObjs: [],
    mySite: {},

    myCurrentPvg: undefined,
    //
    // Status
    //
    myCurrentId: null,
    loading: false,
    saving: false
  }),
  //////////////////////////////////////////
  props: {
    "loadObj": {
      type: [Array, String],
      default: "o ~ @query -sort 'nm:1' @json -cqn"
    },
    "loadSite": {
      type: [Object, String],
      default: 'domain site -cqn -keys "^(id|nm|ph|title)$"'
    },
    "keepCustomizedTo": {
      type: String,
      default: "Wn-Obj-PvgView-Layout-Main-Col"
    },
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    hasCurrent() {
      return this.myCurrentId ? true : false
    },
    //--------------------------------------
    CurrentObj() {
      if (this.hasCurrent) {
        for (let obj of this.myObjs) {
          if (obj.id == this.myCurrentId) {
            return obj
          }
        }
      }
    },
    //--------------------------------------
    CurrentObjPvg() {
      return _.get(this.CurrentObj, "pvg")
    },
    //--------------------------------------
    CurrentObjPvgValue() {
      return this.myCurrentPvg || this.CurrentObjPvg
    },
    //--------------------------------------
    isCurrentChanged() {
      return this.hasCurrent
        && this.myCurrentPvg
        && !_.isEqual(this.CurrentObjPvg, this.myCurrentPvg)
    },
    //--------------------------------------
    Layout() {
      return {
        type: "cols",
        border: true,
        keepCustomizedTo: this.keepCustomizedTo,
        blocks: [{
          title: "对象列表",
          size: "37.2%",
          name: "list",
          body: "list"
        }, {
          title: "权限设置",
          actions: [
            {
              "name": "view",
              "type": "action",
              "icon": "zmdi-info",
              "text": "查看对象",
              "enabled": "hasCurrent",
              "eventName": "view:current:obj"
            },
            {},
            {
              "name": "saving",
              "type": "action",
              "icon": "zmdi-floppy",
              "text": "保存权限设置",
              "altDisplay": {
                "icon": "fas-spinner fa-pulse",
                "text": "i18n:saving"
              },
              "enabled": "changed",
              "eventName": "save:current:pvg"
            }
          ],
          actionStatus: {
            hasCurrent: this.hasCurrent,
            changed: this.isCurrentChanged,
            saving: this.saving
          },
          name: "pvg",
          body: "pvg"
        }]
      }
    },
    //--------------------------------------
    Schema() {
      let schema = {
        list: {
          comType: "WnList",
          comConf: {
            dftLabelHoverCopy: false,
            checkable: false,
            multi: false,
            onBeforeChangeSelect: this.OnBeforeChangeSelect,
            data: this.myObjs,
            display: [
              "@<thumb>",
              "title|nm::is-nowrap flex-auto",
              {
                key: "pvg",
                transformer: pvg => {
                  let list = []
                  _.forEach(pvg, (v, k) => {
                    let mdObj = Wn.Obj.parseMode(v)
                    let mode = Wn.Obj.modeFromObj(mdObj)
                    let str = Wn.Obj.modeToStr(mode)
                    list.push(`${k}${str.substring(6)}`)
                  })
                  if (!_.isEmpty(list)) {
                    return list.join(",")
                  }
                },
                comConf: {
                  className: "as-tip-block flex-none"
                }
              },
              {
                key: "id",
                transformer: (v) => {
                  if (v == this.myCurrentId && this.isCurrentChanged) {
                    return "*"
                  }
                },
                comConf: {
                  className: function ({ value }) {
                    if ("*" == value) {
                      return "is-error"
                    }
                  }
                }
              }
            ]
          }
        }
      }
      if (this.hasCurrent) {
        schema.pvg = {
          comType: "WnObjPvg",
          comConf: {
            loadSite: this.mySite,
            value: this.CurrentObjPvgValue
          }
        }
      } else {
        schema.pvg = {
          comType: "TiLoading",
          comConf: {
            className: "as-big-mask",
            icon: "zmdi-arrow-left",
            text: "请选择一个对象"
          }
        }
      }
      return schema
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnBeforeChangeSelect() {
      return await Ti.Fuse.fire()
    },
    //--------------------------------------
    OnListSelect({ currentId }) {
      this.myCurrentId = currentId
      if (currentId) {
        this.myCurrentPvg = undefined
      }
    },
    //--------------------------------------
    OnPvgChange(pvg) {
      //console.log("OnPvgChange", pvg)
      this.myCurrentPvg = _.isEmpty(pvg)
        ? undefined
        : pvg
    },
    //--------------------------------------
    async OnSaveCurrentPvg() {
      if (this.isCurrentChanged) {
        let cmdText;
        // Update pvg
        if (this.myCurrentPvg) {
          let pvgJson = JSON.stringify({ pvg: this.myCurrentPvg })
          cmdText = `o id:${this.myCurrentId} @update '${pvgJson}' @json -cqn`
        }
        // Remove pvg
        else {
          cmdText = `o id:${this.myCurrentId} @update '"!pvg":true' @json -cqn`
        }
        //console.log(cmdText)
        this.saving = true
        let reo = await Wn.Sys.exec2(cmdText, { as: "json" })
        //console.log(reo)
        this.myObjs = _.map(this.myObjs, obj => {
          if (obj.id == this.myCurrentId) {
            return reo
          }
          return obj
        })
        this.myCurrentPvg = undefined
        this.saving = false
      }
    },
    //--------------------------------------
    async OnViewCurrentObj() {
      if (this.hasCurrent) {
        let meta = this.CurrentObj;
        await Wn.EditObjMeta(meta, {
          fields: "auto", autoSave: true
        })
      }
    },
    //--------------------------------------
    async doLoadBy(by) {
      let re = {}
      // Dynamic load
      if (by && _.isString(by)) {
        re = await Wn.Sys.exec2(by, { as: "json" })
      }
      // Already loaded
      else if (_.isObject(by) || _.isArray(by)) {
        re = _.cloneDeep(by)
      }
      return re
    },
    //--------------------------------------
    async doLoadObjs() {
      return await this.doLoadBy(this.loadObj)
    },
    //--------------------------------------
    async doLoadSite() {
      return await this.doLoadBy(this.loadSite)
    },
    //--------------------------------------
    async reload() {
      this.loading = true

      this.myObjs = await this.doLoadObjs()
      this.mySite = await this.doLoadSite()

      this.loading = false
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "loadObj": "doLoadObjs",
    "loadSite": "doLoadSite"
  },
  //////////////////////////////////////////
  mounted: async function () {
    //......................................
    await this.reload()
    //......................................
    Ti.Fuse.getOrCreate().add({
      key: this.tiComId,
      everythingOk: () => {
        return !this.isCurrentChanged
      },
      fail: () => {
        Ti.Toast.Open("请先保持设置的定制权限", "warn")
      }
    })
    //......................................
  },
  //////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Fuse.get().remove(this.tiComId)
  }
  //////////////////////////////////////////
}
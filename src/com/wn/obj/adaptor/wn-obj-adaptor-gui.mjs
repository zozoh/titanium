/////////////////////////////////////////////
const _M = {
  ///////////////////////////////////////////
  data: () => ({
  }),
  ///////////////////////////////////////////
  computed: {
    //--------------------------------------
    GuiStdLayout() {
      return {
        desktop: {
          "type": "cols",
          "border": true,
          "blocks": [
            {
              "name": "search",
              "size": "62%",
              "type": "rows",
              "border": true,
              "blocks": [
                {
                  "name": "filter",
                  "size": 43,
                  "body": "filter"
                },
                {
                  "name": "list",
                  "size": "stretch",
                  "overflow": "cover",
                  "body": "list"
                },
                {
                  "name": "pager",
                  "size": "auto",
                  "body": "pager"
                }
              ]
            },
            {
              "name": "meta",
              "size": "stretch",
              "body": "meta"
            }]
        },
        tablet: "desktop",
        phone: "desktop"
      }
    },
    //--------------------------------------
    GuiStdSchema() {
      return {
        filter: {
          "comType": "TiFilterbar",
          "comConf": {
            "className": "is-nowrap",
            "placeholder": "i18n:search",
            "filter": "=filter",
            "sorter": "=sorter",
            "dialog": {
              "icon": "fas-search",
              "title": "i18n:search-adv",
              "position": "top",
              "width": "6.4rem",
              "height": "90%"
            },
            "majors": [],
            "matchKeywords": [
              {
                "test": "^[\\d\\w:]{26,}$",
                "key": "id"
              },
              {
                "test": "^[\\d\\w:.-_]+$",
                "key": "nm",
                "mode": "=~"
              },
              {
                "key": "title",
                "mode": "~~"
              }
            ],
            "filterTags": {
              "id": ":->ID【${val}】",
              "nm": ":=val",
              "title": ":=val",
              "ct": ":=>Ti.DateTime.formatMsDateRange(val, 'yyyy年M月d日','未知日期范围','至','','从','','')",
              "lm": ":=>Ti.DateTime.formatMsDateRange(val, 'yyyy年M月d日','未知日期范围','至','','从','','')"
            },
            "sorterConf": {
              "options": [
                {
                  "value": "ct",
                  "text": "i18n:wn-key-ct"
                },
                {
                  "value": "lm",
                  "text": "i18n:wn-key-lm"
                },
                {
                  "value": "nm",
                  "text": "i18n:wn-key-nm"
                }
              ]
            }
          }
        },
        list: {
          "comType": "WnAdaptlist",
          "comConf": {
            "rowNumberBase": 1,
            "meta": "=oDir",
            "data": {
              "list": "=list",
              "pager": "=pager"
            },
            "currentId": "=currentId",
            "checkedIds": "=checkedIds",
            "status": "=status",
            "exposeHidden": "=exposeHidden",
            "viewType": "=viewType",
            "routers": {
              /*"reload": `dispatch:${this.moduleName}/reloadData`*/
            },
            "tableViewConf": {
              "columnResizable": true,
              "canCustomizedFields": true,
              "keepCustomizedTo": "->WnObjAdaptorTableState-${oDir.id}"
            },
            "itemStatus": "=itemStatus",
            "afterUpload": async (checkedIds) => {
              let currentId = _.first(checkedIds)
              await this.dispatch("queryList")
              await this.dispatch("selectMeta", { currentId, checkedIds })
            }
          }
        },
        pager: {
          "comType": "TiPagingJumper",
          "comConf": {
            "value": "=pager",
            "valueType": "longName"
          }
        },
        meta: {
          "comType": "WnObjDetail",
          "comConf": {
            "value": "=meta",
            "fieldStatus": "=fieldStatus"
          }
        }
      }
    },
    //--------------------------------------
    GuiExplainContext() {
      return {
        moduleName: this.moduleName,
        //------------------------------
        dirId: this.dirId,
        oDir: this.oDir,
        //------------------------------
        fixedMatch: this.fixedMatch,
        filter: this.filter,
        sorter: this.sorter,
        list: this.list,
        currentId: this.currentId,
        checkedIds: this.checkedIds,
        pager: this.pager,
        //------------------------------
        meta: this.meta,
        content: this.content,
        contentData: this.contentData,
        //------------------------------
        status: this.status,
        fieldStatus: this.fieldStatus,
        itemStatus: this.itemStatus,
        //------------------------------
        viewType: this.viewType,
        exposeHidden: this.exposeHidden,
      }
    },
    //--------------------------------------
    GuiLayout() {
      let c = this.GuiExplainContext
      let layout = this.layout
      if (_.isEmpty(layout)) {
        layout = this.GuiStdLayout
      }
      return Ti.Util.explainObj(c, layout)
    },
    //--------------------------------------
    GuiSchema() {
      let c = this.GuiExplainContext
      let names = _.keys(this.GuiStdSchema)
      _.forEach(this.schema, (_, k) => names.push(k))
      names = _.uniq(names)

      // Merge schame
      let schema = {}
      for (let bodyName of names) {
        // Guard
        if (/^(components)$/.test(bodyName)) {
          continue
        }
        // Merge from std schema
        let com = _.cloneDeep(this.GuiStdSchema[bodyName]) || {}
        _.defaults(com, { comConf: {} })

        // Get customized configration
        let cus = _.get(this.schema, bodyName)
        if (cus && !_.isEmpty(cus)) {
          schema[bodyName] = com
          let { comType, comConf, mergeMode = "merge" } = cus;
          // ComType
          com.comType = comType || com.comType
          // ComConf
          if ("merge" == mergeMode) {
            _.merge(com.comConf, comConf)
          }
          // Assign
          else if ("assign" == mergeMode) {
            _.assign(com.comConf, comConf)
          }
          // Reset
          else {
            com.comConf = comConf
          }
        }

        // Join to schema
        schema[bodyName] = com
      }

      return Ti.Util.explainObj(c, schema)
    },
    //--------------------------------------
    GuiVars() {
      return {}
    },
    //--------------------------------------
    GuiLoadingAs() {
      return {
        "reloading": {
          icon: "fas-spinner fa-spin",
          text: "i18n:loading"
        },
        "doing": {
          icon: "zmdi-settings fa-spin",
          text: "i18n:doing"
        },
        "saving": {
          icon: "zmdi-settings fa-spin",
          text: "i18n:saving"
        },
        "deleting": {
          icon: "zmdi-refresh fa-spin",
          text: "i18n:del-ing"
        },
        "publishing": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:publishing"
        },
        "restoring": {
          icon: "zmdi-time-restore zmdi-hc-spin",
          text: "i18n:thing-restoring"
        },
        "cleaning": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:thing-cleaning"
        }
      }
    },
    //--------------------------------------
    GuiIsLoading() {
      return (this.status.reloading
        || this.status.doing
        || this.status.saving
        || this.status.deleting
        || this.status.publishing
        || this.status.restoring
        || this.status.cleaning)
        ? true
        : false;
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {

  }
  ///////////////////////////////////////////
}
export default _M;
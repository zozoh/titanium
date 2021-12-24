const _M = {
  ///////////////////////////////////////////
  data: () => ({
  }),
  ///////////////////////////////////////////
  computed: {
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
        //------------------------------
        status: this.status,
        fieldStatus: this.fieldStatus,
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
        layout = {
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
      }
      return Ti.Util.explainObj(c, layout)
    },
    //--------------------------------------
    GuiSchema() {
      let c = this.GuiExplainContext
      let schema = _.merge({
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
                  "text": "i18n:wn-key-ct"
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
              "reload": `dispatch:${this.moduleName}/reloadData`
            },
            "tableViewConf": {
              "columnResizable": true,
              "canCustomizedFields": true,
              "keepCustomizedTo": "->WnObjAdaptorTableState-${oDir.id}"
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
            "value": "=meta"
          }
        }
      }, _.omit(this.schema, "components"))
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
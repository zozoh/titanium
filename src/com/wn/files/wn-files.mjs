export default {
  ////////////////////////////////////////////////////
  data: () => ({
    isLoadingGui: false,
    detailGuiSetups: {}
  }),
  ////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "guiPathDefault": {
      type: String
    },
    "guiPath": {
      type: String
    },
    "filterConf": {
      type: Object,
      default: () => ({})
    },
    "schemaDetail": {
      type: Object,
      default: () => ({
        comType: "TiTextRaw",
        comConf: {
          value: "=content"
        }
      })
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "fileIcon": {
      type: [String, Boolean, Object],
      default: true
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    GuiLayout() {
      return {
        "type": "cols",
        "border": true,
        "blocks": [
          {
            "name": "search",
            "size": "38%",
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
            "name": "detail",
            "size": "stretch",
            "body": "detail"
          }
        ]
      };
    },
    //------------------------------------------------
    GuiSchemaFilter() {
      return {
        comType: "TiFilterbar",
        comConf: _.assign(
          {
            className: "is-nowrap",
            placeholder: "ID/标题",
            filter: "=filter",
            sorter: "=sorter",
            dialog: {
              "icon": "fas-search",
              "title": "i18n:search-adv",
              "position": "top",
              "width": "6.4rem",
              "height": "90%"
            },
            majors: [],
            matchKeywords: [
              {
                "test": "^[\\d\\w:]{26,}$",
                "key": "id"
              },
              {
                "test": "^[a-zA-Z0-9._-]+$",
                "key": "nm",
                "mode": ":=~"
              },
              {
                "key": "title",
                "mode": "~~"
              }
            ],
            filterTags: {
              "id": ":->ID【${val}】",
              "nm": ":=val",
              "title": ":=val"
            },
            sorterConf: {
              dropWidth: "1.6rem",
              options: [
                { "value": "nm", "text": "i18n:wn-key-nm" },
                { "value": "title", "text": "i18n:wn-key-title" },
                { "value": "sort", "text": "i18n:sort" },
                { "value": "ct", "text": "i18n:wn-key-ct" },
                { "value": "lm", "text": "i18n:wn-key-lm" }
              ]
            }
          },
          this.filterConf
        )
      };
    }, // The Filter
    //------------------------------------------------
    GuiSchemaDetail() {
      //console.log(this.currentId)
      if (this.isLoadingGui) {
        return {
          comType: "TiLoading",
          comConf: {
            className: "as-cover",
            text: "i18n:loading-gui",
            icon: "fas-cog fa-spin"
          }
        };
      }
      if (!this.currentId) {
        return {
          comType: "TiLoading",
          comConf: {
            className: "as-big",
            text: "i18n:nil-detail",
            icon: "zmdi-arrow-left"
          }
        };
      }
      // Load from configuration
      let gui = this.detailGuiSetups[this.currentId] || this.defaultDetail;
      if (!_.isEmpty(gui)) {
        return Ti.Util.explainObj(this, gui);
      }

      // Show default detail
      return Ti.Util.explainObj(this, this.schemaDetail);
    },
    //------------------------------------------------
    WallItemBadges() {
      return {
        "NW": (o) => {
          return this.getFileIcon(o);
        }
      };
    },
    //------------------------------------------------
    TableHeadDisplay() {
      if (_.isBoolean(this.fileIcon)) {
        if (this.fileIcon) {
          return [
            {
              key: "..",
              transformer: ({ rawData } = {}) => {
                return this.getFileIcon(rawData);
              },
              comType: "TiIcon"
            }
          ];
        }
      } else {
        return _.concat([], this.fileIcon);
      }
    },
    //------------------------------------------------
    TableFields() {
      return [
        {
          title: "i18n:wn-key-title",
          display: "rawData.title|nm"
        },
        {
          title: "i18n:wn-key-nm",
          candidate: true,
          display: "rawData.nm"
        },
        {
          title: "i18n:wn-key-tp",
          display: "rawData.tp"
        },
        {
          title: "i18n:wn-key-mime",
          candidate: true,
          display: "rawData.mime"
        },
        {
          title: "i18n:wn-key-len",
          candidate: false,
          display: {
            key: "rawData.len",
            transformer: "Ti.S.sizeText",
            comConf: {
              className: "as-tip-block align-right flex-auto"
            }
          }
        },
        {
          title: "i18n:wn-key-ct",
          candidate: true,
          display: {
            key: "rawData.ct",
            transformer: "Ti.Types.formatDate('yy年MM月dd日 HH:mm')"
          }
        },
        {
          title: "i18n:wn-key-lm",
          candidate: true,
          display: {
            key: "rawData.lm",
            transformer: "Ti.Types.formatDate('yy年MM月dd日 HH:mm')"
          }
        }
      ];
    },
    //------------------------------------------------
    CurrentOfficialDoc() {
      return this.meta;
    },
    //------------------------------------------------
    GuiSchema() {
      return {
        filter: this.GuiSchemaFilter,
        list: {
          comConf: {
            itemBadges: this.WallItemBadges,
            tableFields: this.TableFields,
            tableViewConf: {
              headDisplay: this.TableHeadDisplay
            }
          }
        },
        detail: this.GuiSchemaDetail
      };
    },
    //------------------------------------------------
    GuiEvents() {
      return {
        "detail::change": (payload) => {
          //console.log("OnDetailChange", payload)
          let $a = this.getObjAdaptor();
          $a.dispatch("changeContent", payload);
        }
      };
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    // OnDetailChange(payload) {
    //   // let $a = this.getObjAdaptor()
    //   // $a.commit("setListItem", od)
    //   console.log("OnDetailChange", payload)
    // },
    //------------------------------------------------
    getFileIcon(o, dft = "fas-cog") {
      return Ti.Icons.get(o, dft);
    },
    //------------------------------------------------
    //
    // Utility Methods
    //
    //------------------------------------------------
    getObjAdaptor() {
      return this.findComBy(($com) => {
        return "WnObjAdaptor" == $com.tiComType;
      });
    },
    //------------------------------------------------
    async reloadDetailGuiSetup() {
      //console.log("reloadDetailGuiSetup")
      if (this.isLoadingGui) {
        return;
      }
      // Guard
      if (!this.meta) {
        return;
      }
      // Reload meta GUI
      let metaId = this.meta.id;

      // Match cache
      if (this.detailGuiSetups[metaId]) {
        return;
      }

      // Prepare the vars
      let vars = {
        ...this.meta,
        major: Ti.Util.getMajorName(this.meta.nm)
      };

      this.isLoadingGui = true;
      // Get gui path
      let oGuiDetail;
      let guiPath =
        this.meta.gui_path || _.get(this.oDir, "gui_path") || this.guiPath;
      if (guiPath) {
        let ph = Ti.S.renderBy(guiPath, vars);
        oGuiDetail = await Wn.Io.loadMeta(ph);
      }

      // Use the default GUI Path
      if (!oGuiDetail) {
        guiPath = _.get(this.oDir, "gui_path_dft") || this.guiPathDefault;
        if (guiPath) {
          let ph = Ti.S.renderBy(guiPath, vars);
          oGuiDetail = await Wn.Io.loadMeta(ph);
        }
      }

      // Load GUI Detail Content
      if (oGuiDetail) {
        let guiDetail = await Wn.Io.loadContent(oGuiDetail, { as: "json" });
        guiDetail = guiDetail || {};
        this.detailGuiSetups = _.assign(
          {
            [metaId]: guiDetail
          },
          this.detailGuiSetups
        );
        // Load components ...
        if (!_.isEmpty(guiDetail.components)) {
          await Ti.App(this).loadView({
            components: guiDetail.components
          });
        }
      }
      // Set the Empty
      else {
        this.detailGuiSetups = _.assign(
          {
            [metaId]: {}
          },
          this.detailGuiSetups
        );
      }
      this.$nextTick(() => {
        this.isLoadingGui = false;
      });
    },
    //------------------------------------------------
    // Delegates
    //------------------------------------------------
    async doCreate() {
      let $a = this.getObjAdaptor();
      return await $a.doCreate();
    },
    async doRename() {
      let $a = this.getObjAdaptor();
      return await $a.doRename();
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "meta": {
      handler: "reloadDetailGuiSetup",
      immediate: true
    }
  }
  ////////////////////////////////////////////////////
};

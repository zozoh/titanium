//////////////////////////////////////////////////////
export default {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "list": {
      type: Array,
      default: () => []
    },
    "loading": {
      type: Boolean,
      default: false
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    GUILayout() {
      return {
        type: "rows",
        border: true,
        blocks: [
          {
            name: "filter",
            size: ".43rem",
            body: "filter"
          },
          {
            name: "list",
            size: "stretch",
            body: "list"
          },
          {
            name: "pager",
            size: "auto",
            body: "pager"
          }
        ]
      }
    },
    //------------------------------------------------
    GUISchema() {
      return {
        //................................
        filter: {
          comType: "TiFilterbar",
          comConf: {
            className: "is-nowrap",
            filter: this.filter,
            sorter: this.sorter,
            placeholder: this.placeholder,
            dialog: _.assign({
              "icon": "fas-search",
              "title": "i18n:search-adv",
              "position": "top",
              "width": "6.4rem",
              "height": "90%"
            }, this.dialog),
            majors: this.majors,
            matchKeywords: this.matchKeywords,
            filterTags: _.assign({
              "th_live": "i18n:thing-recycle-bin",
              "id": "->ID【${val}】",
              "nm": "=val",
              "title": "=val",
              "abbr": "=val",
              "ct": "<MsDateRange>",
              "lm": "<MsDateRange>"
            }, this.filterTags),
            advanceForm: this.advanceForm,
            advanceComponents: this.advanceComponents,
            sorterConf: this.sorterConf
          }
        },
        //................................
        list: {
          comType: this.listComType,
          comConf: _.assign({}, this.listComConf, {
            data: this.list
          })
        },
        //................................
        pager: {
          comType: "TiPagingJumper",
          comConf: {
            value: this.pager,
            valueType: this.pagerValueType
          }
        }
        //................................
      }
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------

    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
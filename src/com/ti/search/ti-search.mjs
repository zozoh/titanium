//////////////////////////////////////////////////////
export default {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "filter": {
      type: Object,
      default: () => ({})
    },
    "sorter": {
      type: Object,
      default: () => ({})
    },
    //------------------------------------------------
    // Behavior
    //------------------------------------------------
    "majors": {
      type: Array,
      default: () => []
    },
    "matchKeywords": {
      type: Array,
      default: () => []
    },
    "advanceForm": {
      type: Object
    },
    "advanceComponents": {
      type: Array,
      default: () => []
    },
    "sorterConf": {
      type: Object
    },
    "listComType": {
      type: String,
      default: "TiList"
    },
    "listComConf": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "placeholder": {
      type: String,
      default: "i18n:search"
    },
    "dialog": {
      type: Object
    },
    "filterTags": {
      type: Object
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
      //.............................................
      let dateRangeFilterTag = [
        ":=>Ti.DateTime.formatMsDateRange(val",
        "'i18n:date-fmt'",
        "'i18n:dt-range-unknown'",
        "'i18n:dt-range-to'",
        "''",
        "'i18n:dt-range-from'",
        "''",
        "'')"
      ].join(",")
      //.............................................
      return {
        //................................
        filter: {
          comType: "TiFilterbar",
          comConf: {
            className: "is-nowrap",
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
              "id": ":->ID【${val}】",
              "nm": ":=val",
              "title": ":=val",
              "abbr": ":=val",
              "ct": dateRangeFilterTag,
              "lm": dateRangeFilterTag
            }, this.filterTags),
            advanceForm: this.advanceForm,
            advanceComponents: this.advanceComponents,
            sorterConf: this.sorterConf
          }
        },
        //................................
        list: {
          comType: this.listComType,
          comConf: this.listComConf
        },
        //................................
        pager: {
          comType: "TiPagingJumper",
          
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
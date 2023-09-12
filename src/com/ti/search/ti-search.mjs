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
      return this.getTopClass();
    },
    //------------------------------------------------
    GUILayout() {
      let blocks = [
        {
          name: "filter",
          size: "auto",
          body: "filter"
        },
        {
          name: "list",
          size: "stretch",
          body: "list"
        }
      ];
      if (this.pager) {
        blocks.push({
          name: "pager",
          size: "auto",
          body: "pager"
        });
      }
      return {
        type: "rows",
        border: true,
        blocks
      };
    },
    //------------------------------------------------
    GUISchema() {
      return {
        //................................
        filter: {
          comType: this.filterComType,
          comConf: _.assign(
            {
              dialog: {
                "icon": "fas-search",
                "title": "i18n:search-adv",
                "position": "top",
                "width": "6.4rem",
                "height": "90%"
              },
              matchKeywords: [
                {
                  "test": "^[\\d\\w:]{26,}$",
                  "key": "id"
                },
                {
                  "key": "title",
                  "mode": "~~"
                }
              ],
              filterTags: {
                "th_live": "i18n:thing-recycle-bin",
                "id": "->ID【${val}】",
                "nm": "=val",
                "title": "=val",
                "abbr": "=val",
                "ct": "<MsDateRange>",
                "lm": "<MsDateRange>"
              },
              sorterConf: {
                options: [
                  {
                    "value": "nm",
                    "text": "i18n:wn-key-nm"
                  },
                  {
                    "value": "ct",
                    "text": "i18n:wn-key-ct"
                  },
                  {
                    "value": "lm",
                    "text": "i18n:wn-key-lm"
                  }
                ]
              }
            },
            this.filterComConf,
            {
              filter: this.filter,
              sorter: this.sorter
            }
          )
        },
        //................................
        list: {
          comType: this.listComType,
          comConf: _.assign(
            {
              multi: this.multi
            },
            this.listComConf,
            {
              data: this.list
            }
          )
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
      };
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
};

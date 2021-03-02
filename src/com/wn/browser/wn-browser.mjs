export default {
  ////////////////////////////////////////////////////
  data : ()=>({
    myList  : [],
    myPager : {},
    /*{filter: {}, sorter: {ct: -1}}*/
    mySearch : {}
  }),
  ////////////////////////////////////////////////////
  props : {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "meta" : {
      type : Object
    },
    "data" : {
      type : Object
    },
    "search" : {
      type : Object
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    //------------------------------------------------
    // Behavior
    //------------------------------------------------
    "autoSelect" : {
      type : Boolean,
      default : false
    },
    // TODO ... need to apply those settins below
    // in __on_events
    // "notifyName" : {
    //   type : String,
    //   default : "change"
    // },
    // "notifyWhen" : {
    //   type : String,
    //   default : "select"
    // },
    // "notifyPayload" : {
    //   type : [Object, Function]
    // },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "filter" : {
      type : Object,
      default : ()=>({
        comType : "WnThingFilter",
        comConf : {
          "placeholder" : "i18n:filter",
          "status" : "=status",
          "value": "=mySearch",
          "sorter": {
            "options": [
              { "value": "nm", "text": "i18n:wn-key-nm" },
              { "value": "ct", "text": "i18n:wn-key-ct" }
            ]
          }
        }
      })
    },
    "list" : {
      type : Object,
      default : ()=>({
        comType : "WnAdaptlist",
        comConf : {
          "meta" : "=meta",
          "data" : {
            list : "=myList",
            pager : "=myPager"
          },
          "multi" : true,
          "status" : "=status"
        }
      })
    },
    "pager" : {
      type : Object,
      default : ()=>({
        comType : "TiPagingJumper",
        comConf : {
          "value" : "=myPager",
          "mapping" : "longName"
        }
      })
    },
    "detail" : {
      type : Object,
      default : ()=>({
        comType : "TiLabel",
        comConf : {
          "value" : "I am detail"
        }
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    ComFilter() {return Ti.Util.explainObj(this, this.filter)},
    ComList() {
      let com = Ti.Util.explainObj(this, this.list)
      _.merge(com, {
        comConf : {
          onInit : this.OnListInit
        }
      })
      return com
    },
    ComPager() {return Ti.Util.explainObj(this, this.pager)},
    ComDetail() {return Ti.Util.explainObj(this, this.detail)},
    //------------------------------------------------
    TheLayout() {
      let left = []
      if(this.ComFilter) {
        left.push({
          name : "filter",
          size : 43,
          body : "filter"
        })
      }
      left.push({
        name : "list",
        size : "stretch",
        overflow : "cover",
        body : "list"
      })
      if(this.ComPager) {
        left.push({
          name : "pager",
          size : "auto",
          body : "pager"
        })
      }
      if(this.ComDetail) {
        return {
          type : "cols",
          border: true,
          blocks: [{
              type : "rows",
              size : "61.8%",
              border : true,
              blocks : left
            }, {
              name : "detail",
              size : "38.2%",
              body : "detail"
            }]
        }
      }
      return {
        type : "rows",
        size : "61.8%",
        blocks : left
      }
    },
    //------------------------------------------------
    TheSchema() {
      return {
        filter : this.ComFilter,
        list   : this.ComList,
        pager  : this.ComPager,
        detail : this.ComDetail
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnListInit($adaptlist) {
      this.$adaptlist = $adaptlist
    },
    //------------------------------------------------
    // Delegate methods
    selectItem(id) {
      this.$adaptlist.selectItem(id)
    },
    selectItemByIndex(id) {
      this.$adaptlist.selectItemByIndex(id)
    },
    invokeList(methodName) {
      this.$adaptlist.invokeList(methodName)
    },
    getCurrentItem() {
      return this.$adaptlist.getCurrentItem()
    },
    getCheckedItems() {
      return this.$adaptlist.getCheckedItems()
    },
    async openCurrentMeta() {
      return this.$adaptlist.openCurrentMeta()
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //------------------------------------------------
    "data" : {
      handler : function() {
        this.myList = _.get(this.data, "list")
        this.myPager = _.get(this.data, "pager")
      },
      immediate : true
    },
    "ComList" : function() {
      if(this.autoSelect) {
        this.$nextTick(()=>{
          _.delay(()=>{
            this.selectItemByIndex(0)
          }, 100)
        })
      }
    },
    "search" : {
      handler : function() {
        this.mySearch = this.search
      },
      immediate : true
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
}
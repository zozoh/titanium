export default {
  ////////////////////////////////////////////////////
  data : ()=>({
    myList  : [],
    myPager : {},
    /*{filter: {}, sorter: {ct: -1}}*/
    mySearch : {},
    myCurrentId : undefined
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
    "multi" : {
      type : Boolean
    },
    "reloadBy" : {
      type : [String, Function],
      default : "current/query"
    },
    "viewType" : String,
    "exposeHidden" : Boolean,
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
    "tableFields" : undefined,
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
          "multi" : "=multi",
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
          "valueType" : "longName"
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
          onInit : this.OnListInit,
          viewType : this.viewType,
          exposeHidden : this.exposeHidden,
          tableFields : this.tableFields
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
    OnFilterChange(filter) {
      this.reload({filter, pager:{pageNumber:1}})
    },
    //------------------------------------------------
    OnSorterChange(sorter) {
      this.reload({sorter, pager:{pageNumber:1}})
    },
    //------------------------------------------------
    OnPagerChange(pager) {
      this.reload({pager})
    },
    //------------------------------------------------
    OnListViewTypeChange() {
      return {name:"listviewtype:change", stop:false}
    },
    //------------------------------------------------
    OnSelectItem({currentId}) {
      this.myCurrentId = currentId
      return {name:"select", stop:false}
    },
    //------------------------------------------------
    doAutoSelectItem() {
      // Guard
      if(!this.autoSelect) 
        return
      // Try the last current Id
      if(this.myCurrentId) {
        let row = this.$adaptlist.findRowById(this.myCurrentId)
        if(row) {
          this.selectItem(row.id)
          return
        }
      }
      // Default use the first item
      this.selectItemByIndex(0)
    },
    //------------------------------------------------
    async reload({filter, sorter, pager}={}) {
      if(_.isString(this.reloadBy)) {
        return await Ti.App(this).dispatch(this.reloadBy, {
          filter, sorter, pager
        })
      }
      // Customized reloading
      return await this.reloadBy({filter, sorter, pager})
    },
    //------------------------------------------------
    // Delegate methods
    setItem(newItem) {
      this.$adaptlist.setItem(newItem)
    },
    selectItem(id) {
      this.$adaptlist.selectItem(id)
    },
    selectItemByIndex(id) {
      this.$adaptlist.selectItemByIndex(id)
    },
    checkItem(id) {
      this.$adaptlist.checkItem(id)
    },
    toggleItem(id) {
      this.$adaptlist.toggleItem(id)
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
    async doDelete(confirm) {
      return this.$adaptlist.doDelete(confirm)
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //------------------------------------------------
    "data" : {
      handler : function(newVal, oldVal) {
        if(_.isUndefined(oldVal) || !_.isEqual(newVal, oldVal)) {
          this.myList = _.get(this.data, "list")
          this.myPager = _.get(this.data, "pager")
          this.$nextTick(()=>{
            _.delay(()=>{
              this.doAutoSelectItem()
            }, 100)
          })
        }
      },
      immediate : true
    },
    "search" : {
      handler : function() {
        this.mySearch = _.cloneDeep(this.search)
      },
      immediate : true
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    this.$nextTick(()=>{
      _.delay(()=>{
        this.doAutoSelectItem()
      }, 100)
    })
  }
  ////////////////////////////////////////////////////
}
const _M = {
  ////////////////////////////////////////////////////
  data: ()=>({
    "myShown": {},
    "myList": [],
    "myHisRecord": null,
    "myFilterKeyword": null,
    "myFilterMatch": {},
    "mySort": {
      createTime: -1
    },
    "myPager": {
      pn: 1,
      pgsz: 20
    },
    "loading": false
  }),
  ////////////////////////////////////////////////////
  props : {
    "meta": {
      type: Object,
      default: ()=>({})
    },
    "data": {
      type: Object,
      default: ()=>({})
    },
    "status": {
      type: Object,
      default: ()=>({})
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    HistoryItems() {
      let items = []
      _.forEach(this.data.list, it=> {
        let name  = Ti.Util.getMajorName(it.nm)
        let title = it.title
        if(!title) {
          title =  "_history" == name
            ? "i18n:default"
            : name
        }
        items.push({name, title})
      })
      // Update shown
      if(!_.isEmpty(items)) {
        this.myShown = _.assign({
          [_.first(items).name] : true
        }, this.myShown)
      }
      // Return
      return items
    },
    //------------------------------------------------
    CurrentHistory() {
      return _.first(Ti.Util.truthyKeys(this.myShown))
    },
    //------------------------------------------------
    Layout() {
      let blocks = []
      for(let hi of this.HistoryItems) {
        blocks.push({
          type: "cols",
          title: hi.title,
          name : hi.name,
          border: true,
          blocks: [{
            type: "rows",
            size: "65%",
            blocks: [{
              "type": "cols",
              "size": ".44rem",
              "blocks": [{
                  "name": "filter",
                  "flex": "both",
                  "body": "filter"
                }, {
                  "name": "sorter",
                  "flex": "none",
                  "body": "sorter"
                }]
              }, {
                "name" : "list",
                "size" : "stretch",
                "overflow" : "cover",
                "body" : "list"
              }, {
                "name" : "pager",
                "size" : "auto",
                "body" : "pager"
              }]
          }, {
            name: "form",
            body: "form"
          }]
        })
      }
      return {type: "tabs", blocks}
    },
    //------------------------------------------------
    Schema() {
      return {
        //............................................
        filter : {
          comType : "TiComboFilter",
          comConf : {
            placeholder : "i18n:wn-en-his-flt-tip",
            dropWidth: -500,
            form: {
              fields: [{
                  title: "i18n:wn-en-his-ct",
                  name: "createTime",
                  comType: "ti-input-daterange",
                  comConf: {
                    valueType: "ms-range"
                  }
                },{
                  title: "i18n:wn-en-his-utp",
                  name: "userType",
                  comType: "ti-input"
                },{
                  title: "i18n:wn-en-his-tid",
                  name: "targetId",
                  comType: "ti-input"
                },{
                  title: "i18n:wn-en-his-tnm",
                  name: "targetName",
                  comType: "ti-input"
                },{
                  title: "i18n:wn-en-his-ttp",
                  name: "targetType",
                  comType: "ti-input"
                },{
                  title: "i18n:wn-en-his-opt",
                  name: "operation",
                  comType: "ti-input"
                }]
            },
            value: {
              keyword: this.myFilterKeyword,
              match: this.myFilterMatch
            }
          }
        },
        //............................................
        sorter: {
          comType: "TiComboSorter",
          comConf: {
            dropWidth : 200,
            options: [
              {value:"createTime",   text:"i18n:wn-en-his-ct"},
              {value:"userType",     text:"i18n:wn-en-his-utp"},
              {value:"targetType",   text:"i18n:wn-en-his-ttp"}],
            value: this.mySort
          }
        },
        //............................................
        list: {
          comType: "TiTable",
          comConf: {
            data: this.myList,
            fields: [{
              title:"i18n:wn-en-his-usr",
              display: ["userName","userType:[${val}]"]
            },{
              title:"i18n:wn-en-his-ct",
              display: {
                key:"createTime",
                transformer: "Ti.DateTime.format"
              }
            },{
              title:"i18n:wn-en-his-tar",
              display: ["targetName","targetType:[${val}]"]
            },{
              title:"i18n:wn-en-his-opt",
              display: "operation"
            }]
          }
        },
        //............................................
        pager : {
          comType : "TiPagingJumper",
          comConf : {
            value : this.myPager
          }
        },
        //............................................
        form: {
          comType: "TiForm",
          comConf: {
            data: this.myHisRecord,
            autoShowBlank: true,
            fields: [{
                title:"ID",
                name: "id"
              },{
                title:"i18n:wn-en-his-uid",
                name: "userId"
              },{
                title:"i18n:wn-en-his-unm",
                name: "userName"
              },{
                title:"i18n:wn-en-his-utp",
                name: "userType"
              },{
                title:"i18n:wn-en-his-ct",
                name: "createTime",
                type: "AMS"
              },{
                title:"i18n:wn-en-his-tid",
                name: "targetId"
              },{
                title:"i18n:wn-en-his-tnm",
                name: "targetName"
              },{
                title:"i18n:wn-en-his-ttp",
                name: "targetType"
              },{
                title:"i18n:wn-en-his-opt",
                name: "operation"
              },{
                title:"i18n:wn-en-his-mor",
                name: "more"
              }]
          }
        }
        //............................................
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnShownChange(shown) {
      this.myShown = shown
    },
    //------------------------------------------------
    OnSelect({current}) {

      this.myHisRecord = current
    },
    //------------------------------------------------
    async OnFilterChange({match,keyword}={}) {
      this.myFilterMatch = match
      this.myFilterKeyword = keyword
      await this.reloadList()
    },
    //------------------------------------------------
    async OnSorterChange(sort) {
      this.mySort = sort
      await this.reloadList()
    },
    //------------------------------------------------
    async OnPagerChange(page) {
      _.assign(this.myPager, page)
      await this.reloadList()
    },
    //------------------------------------------------
    async reloadList() {
      // Prepare the command
      let hisName = this.CurrentHistory
      if("_history" == hisName) {
        hisName = ""
      }
      let cmds = [`history ${hisName} query`]

      // Sort
      if(!_.isEmpty(this.mySort)) {
        let sort = JSON.stringify(this.mySort)
        cmds.push(`-sort '${sort}'`)
      }
      
      // Pager
      cmds.push(`-pn ${this.myPager.pn}`)
      cmds.push(`-pgsz ${this.myPager.pgsz}`)
      cmds.push("-cqn")

      // Filter
      let flt = _.assign({}, this.myFilterMatch)
      if(this.myFilterKeyword) {
        if(Wn.Io.isFullObjId(this.myFilterKeyword)) {
          flt.userId = this.myFilterKeyword
        } else {
          flt.userName = this.myFilterKeyword
        }
      }
      let input = JSON.stringify(flt)

      // Load
      this.loading = true
      let reo = await Wn.Sys.exec2(cmds.join(" "), {
        input, as:"json"
      })

      // Update
      this.myList = reo.list
      this.myPager = reo.pager
      this.loading = false
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "CurrentHistory": function(){
      this.reloadList()
    }
  }
  ////////////////////////////////////////////////////
}
export default _M;
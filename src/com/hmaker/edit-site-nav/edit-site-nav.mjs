export default {
  //////////////////////////////////////////
  data: ()=>({
    myCurrentIndex : -1,
    myCurrentId : null,
    myCheckedIds : {},
    myActionStatus : {
      "remove"   : false,
      "moveUp"   : false,
      "moveDown" : false,
    }
  }),
  //////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TableData() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        list.push(_.assign({
          id : `N${index}`
        }, it))
      })
      return list
    },
    //--------------------------------------
    TableLastIndex() {
      return this.TableData.length - 1
    },
    //--------------------------------------
    TableFields() {
      return [{
        title : "i18n:hmaker-nav-k-display",
        display : [{
            key : "icon",
            comType : "ti-icon"
          }, "title"],
        width   : -150
      }, {
        title : "i18n:hmaker-nav-k-type",
        name  : "type",
        width   : -100,
        display : [{
          comType : "ti-icon",
          transformer : {
            name : "toStr",
            args : {
              page : "zmdi-file",
              href : "zmdi-link",
              dispatch : "zmdi-flash-auto"
            }
          }
        }, {
          transformer : {
            name : "toStr",
            args : {
              page : "i18n:hmaker-nav-tp-page",
              href : "i18n:hmaker-nav-tp-href",
              dispatch : "i18n:hmaker-nav-tp-dispatch"
            }
          }
        }]
      }, {
          title : "i18n:hmaker-nav-k-value",
          display : "value"
        }]
    },
    //--------------------------------------
    FormBlankAs() {
      return {
        icon : "zmdi-long-arrow-return zmdi-hc-rotate-90",
        text : "i18n:hmaker-nav-blank-item"
      }
    },
    //--------------------------------------
    FormFields() {
      return [{
          title : "i18n:hmaker-nav-k-title",
          name  : "title",
          comType : "ti-input"
        }, {
          title : "i18n:hmaker-nav-k-icon",
          name  : "icon",
          comType : "ti-input-icon"
        }, {
          title : "i18n:hmaker-nav-k-type",
          name  : "type",
          comType : "ti-switcher",
          comConf : {
            options : [{
              icon  : "zmdi-file",
              text  : "i18n:hmaker-nav-tp-page",
              value : "page"
            }, {
              icon  : "zmdi-link",
              text  : "i18n:hmaker-nav-tp-href",
              value : "href"
            }, {
              icon  : "zmdi-flash-auto",
              text  : "i18n:hmaker-nav-tp-dispatch",
              value : "dispatch"
            }]
          }
        }, {
          title : "i18n:hmaker-nav-k-value",
          name  : "value",
          comType : "ti-input"
        }]
    },
    //--------------------------------------
    FormData() {
      if(this.myCurrentIndex >= 0) {
        return this.TableData[this.myCurrentIndex]
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnRowSelected({currentId, checkedIds, currentIndex}) {
      //console.log(currentId, current)
      this.myCurrentIndex = currentIndex
      this.myCurrentId = currentId
      this.myCheckedIds = checkedIds

      _.assign(this.myActionStatus, {
        moveUp   : currentIndex > 0,
        moveDown : currentIndex >= 0 && currentIndex < this.TableLastIndex,
        remove   : currentIndex >= 0
      })
    },
    //--------------------------------------
    OnFormChanged({name, value}={}) {
      //console.log("onFormChanged", {name, value})
      if(this.myCurrentIndex>=0) {
        let data = _.cloneDeep(this.data)
        data[this.myCurrentIndex][name] = value
        this.notifyChange(data)
      }
    },
    //--------------------------------------
    updateParentActionMenu() {
      this.$emit("actions:updated", {
        data : [{
            key  : "create",
            text : "i18n:add-item",
            type : "action",
            icon : "zmdi-plus",
            action : "$parent:callChild(createNewOne)"
          }, {
            type : "line"
          }, {
            key  : "remove",
            type : "action",
            icon : "zmdi-delete",
            action : "$parent:callChild(removeChecked)",
            enableBy : "remove"
          }, {
            type : "line"
          }, {
            key  : "moveUp",
            type : "action",
            icon : "zmdi-long-arrow-up",
            action : "$parent:callChild(moveUp)",
            enableBy : "moveUp"
          }, {
            key  : "moveDown",
            type : "action",
            icon : "zmdi-long-arrow-down",
            action : "$parent:callChild(moveDown)",
            enableBy : "moveDown"
          }],
        status : this.myActionStatus
      })
    },
    //--------------------------------------
    notifyChange(data=[]) {
      let list = []
      _.forEach(data, (it)=>{
        list.push(_.pick(it, "icon", "title", "type", "value"))
      })
      this.$emit("change", list)
    },
    //--------------------------------------
    __recover_selected(pos, len) {
      let ids = {}
      for(let i=0; i<len; i++) {
        ids[`N${pos+i}`] = true
      }
      console.log(ids)
      this.$nextTick(()=>{
        this.onRowSelected({
          currentId  : `N${pos}`,
          currentIndex : pos,
          checkedIds : ids
        })
     })
    },
    //--------------------------------------
    moveUp() {
      let data = _.cloneDeep(this.TableData)
      let items = _.remove(data, ({id})=>this.myCheckedIds[id])
      if(!_.isEmpty(items)) {
        let firstIndex = _.first(items).id.substring(1) * 1
        let pos = Math.max(0, firstIndex - 1)
        if(pos>=0) {
          Ti.Util.insertToArray(data, pos, ...items)
          this.notifyChange(data)

          // Recover selected
          this.__recover_selected(pos, items.length)
        }
      }
    },
    //--------------------------------------
    moveDown() {
      let data = _.cloneDeep(this.TableData)
      let items = _.remove(data, ({id})=>this.myCheckedIds[id])
      if(!_.isEmpty(items)) {
        let firstIndex = _.first(items).id.substring(1) * 1
        let pos = firstIndex + 1
        if(pos<=(this.TableData.length-items.length)) {
          Ti.Util.insertToArray(data, pos, ...items)
          this.notifyChange(data)

          // Recover selected
          this.__recover_selected(pos, items.length)
        }
      }
    },
    //--------------------------------------
    removeChecked() {
      let data = _.filter(this.TableData, ({id})=>!this.myCheckedIds[id])
      this.notifyChange(data)
      this.myCurrentIndex = -1
      this.myCurrentId = null
      this.myCheckedIds = {}
    },
    //--------------------------------------
    createNewOne() {
      let data = _.cloneDeep(this.TableData)
      Ti.Util.insertToArray(data, this.myCurrentIndex, {
        title : Ti.I18n.get("new-item"),
        type  : "page"
      })
      console.log(data)
      this.notifyChange(data)
    }
    //--------------------------------------
  },
  mounted : function() {
    this.updateParentActionMenu()
  }
  //////////////////////////////////////////
}
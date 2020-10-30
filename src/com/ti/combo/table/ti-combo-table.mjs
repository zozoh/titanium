const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({   
    myCurrentData : undefined,
    myCurrentId : undefined,
    myCurrentIndex : -1,
    myCheckedIds : {}
  }),
  ////////////////////////////////////////////////////
  props : {
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //------------------------------------------------
    ActionItems() {
      return [{
        icon : "fas-plus",
        text : "i18n:new-item",
        action : ()=>{
          this.doAddNewItem()
        }
      }, {
        type : "line"
      }, {
        icon : "far-trash-alt",
        tip : "i18n:del-checked",
        action : ()=>{
          this.removeChecked()
        }
      }, {
        icon : "far-edit",
        tip : "i18n:edit",
        action : ()=>{
          this.doEditCurrent()
        }
      }, {
        type : "line"
      }, {
        icon : "fas-long-arrow-alt-up",
        tip : "i18n:move-up",
        action : ()=>{
          this.moveCheckedUp()
        }
      }, {
        icon : "fas-long-arrow-alt-down",
        tip : "i18n:move-down",
        action : ()=>{
          this.moveCheckedDown()
        }
      }]
    },
    //------------------------------------------------
    TableConfig() {
      let config = _.cloneDeep(this.list)
      config.data = this.value
      _.defaults(config, {
        blankAs    : this.blankAs,
        blankClass : this.blankClass
      })
      return config
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnTableRowSelect({currentId, current, currentIndex, checkedIds}) {
      this.myCurrentData = current
      this.myCurrentId = currentId
      this.myCurrentIndex = currentIndex
      this.myCheckedIds = checkedIds
    },
    //-----------------------------------------------
    async OnTableRowOpen({index, rawData}) {
      let reo = await this.openDialog(rawData);

      // User cancel
      if(_.isUndefined(reo))
        return

      // Join to 
      let list = _.cloneDeep(this.value||[])
      list.splice(index, 1, reo)
      this.notifyChange(list)
    },
    //-----------------------------------------------
    async doAddNewItem() {
      let reo = await this.openDialog();

      // User cancel
      if(_.isUndefined(reo))
        return

      // Join to 
      let val = _.concat(this.value||[], reo)
      this.notifyChange(val)
    },
    //-----------------------------------------------
    async doEditCurrent() {
      if(!this.myCurrentData) {
        return await Ti.Toast.Open("i18n:nil-item", "warn")
      }

      let reo = await this.openDialog(this.myCurrentData);

      // User cancel
      if(_.isUndefined(reo))
        return

      // Join to 
      let list = _.cloneDeep(this.value||[])
      list.splice(this.myCurrentIndex, 1, reo)
      this.notifyChange(list)
    },
    //-----------------------------------------------
    removeChecked() {

    },
    //-----------------------------------------------
    moveCheckedUp() {

    },
    //-----------------------------------------------
    moveCheckedDown() {
      
    },
    //-----------------------------------------------
    async openDialog(result={}) {
      let dialog = _.cloneDeep(this.dialog);
      _.assign(dialog, {
        result,
        model : {prop:"data", event:"change"},
        comType : "TiForm",
        comConf : this.form
      })

      return await Ti.App.Open(dialog);
    },
    //-----------------------------------------------
    notifyChange(val=[]) {
      this.$notify("change", val)
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //----------------------------------------------- 
    //-----------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;
export default {
  ///////////////////////////////////////////
  props : {
    "data" : {
      type : Object,
      default : ()=>({
        pn : 0,
        pgsz : 0,
        pgc : 0,
        sum : 0,
        count : 0
      })
    }
  },
  ///////////////////////////////////////////
  computed : {
    pnClass() {
      return this.data.pgc > 1
              ? "is-enabled"
              : "is-disabled"
    },
    sumClass() {
      return this.data.pgsz > 0
              ? "is-enabled"
              : "is-disabled"
    }
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    isInvalidPageNumber(pageNumber) {
      return pageNumber <=0 
        || pageNumber > this.data.pgc
        || pageNumber == this.data.pn
    },
    //--------------------------------------
    btnClass(pageNumber) {
      if(this.isInvalidPageNumber(pageNumber)) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    //--------------------------------------
    jumpTo(pageNumber) {
      if(!this.isInvalidPageNumber(pageNumber)) {
        this.$emit("change:pn", pageNumber)
      }
    },
    //--------------------------------------
    async onClickCurrent() {
      // No Necessary
      if(this.data.pgc <= 1)
        return
      // Ask new pageNumber
      let msg = Ti.I18n.getf("ti-paging-change-pn", this.data)
      let str = await Ti.Prompt(msg, {
        value : this.data.pn
      })
      // NoChange
      if(!str || str == this.data.pn)
        return
      // verify the str
      let pn = parseInt(str)
      if(isNaN(pn) || pn<=0 || pn>this.data.pgc) {
        msg = Ti.I18n.getf("ti-paging-change-pn-invalid", this.data)
        await Ti.Alert(msg, {
          title : "i18n:warn",
          type  : "warn",
          icon  : "im-warning",
          width : 420
        })
        return 
      }
      // 通知修改
      this.$emit("change:pn", pn)
    },
    //--------------------------------------
    async onClickSum(){
      let msg = Ti.I18n.getf("ti-paging-change-pgsz", this.data)
      let str = await Ti.Prompt(msg, {
        value : this.data.pgsz
      })
      // NoChange
      if(!str || str == this.data.pgsz)
        return
      // verify the str
      let pgsz = parseInt(str)
      if(isNaN(pgsz) || pgsz<=0) {
        await Ti.Alert("i18n:ti-paging-change-pgsz-invalid", {
          title : "i18n:warn",
          type  : "warn",
          icon  : "im-warning",
          width : 420
        })
        return 
      }
      // 通知修改
      this.$emit("change:pgsz", pgsz)
    }
  }
  ///////////////////////////////////////////
}
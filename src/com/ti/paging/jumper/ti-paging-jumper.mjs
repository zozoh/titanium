export default {
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasValue() {
      return !_.isEmpty(this.PageValue) && this.PageValue.pn > 0
    },
    //--------------------------------------
    PageNumberClass() {
      return this.hasValue && this.PageValue.pgc > 1
              ? "is-enabled"
              : "is-disabled"
    },
    //--------------------------------------
    SumClass() {
      return this.hasValue && this.PageValue.pgsz > 0
              ? "is-enabled"
              : "is-disabled"
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    isInvalidPageNumber(pageNumber) {
      return pageNumber <=0 
        || pageNumber > this.PageValue.pgc
        || pageNumber == this.PageValue.pn
    },
    //--------------------------------------
    getBtnClass(pageNumber) {
      if(!this.hasValue || this.isInvalidPageNumber(pageNumber)) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    //--------------------------------------
    OnJumpTo(pageNumber) {
      if(!this.isInvalidPageNumber(pageNumber)) {
        console.log("OnJumpTo", pageNumber)
        this.notifyChange({
          skip :  this.PageValue.pgsz * (pageNumber-1),
          limit :  this.PageValue.pgsz, 
          pn   : pageNumber, 
          pgsz : this.PageValue.pgsz
        })
      }
    },
    //--------------------------------------
    async OnClickCurrent() {
      // No Necessary
      if(this.PageValue.pgc <= 1)
        return
      // Ask new pageNumber
      let msg = Ti.I18n.getf("paging-change-pn", this.PageValue)
      let str = await Ti.Prompt(msg, {
        value : this.PageValue.pn
      })
      // NoChange
      if(!str || str == this.PageValue.pn)
        return
      // verify the str
      let pn = parseInt(str)
      if(isNaN(pn) || pn<=0 || pn>this.PageValue.pgc) {
        msg = Ti.I18n.getf("paging-change-pn-invalid", this.PageValue)
        await Ti.Alert(msg, {
          title : "i18n:warn",
          type  : "warn",
          icon  : "im-warning",
          width : 420
        })
        return 
      }
      // 通知修改
      this.notifyChange({
        skip :  this.PageValue.pgsz * (pn-1),
        limit :  this.PageValue.pgsz, 
        pn   : pn, 
        pgsz : this.PageValue.pgsz
      })
    },
    //--------------------------------------
    async OnClickSum(){
      let msg = Ti.I18n.getf("paging-change-pgsz", this.PageValue)
      let str = await Ti.Prompt(msg, {
        value : this.PageValue.pgsz
      })
      // NoChange
      if(!str || str == this.PageValue.pgsz)
        return
      // verify the str
      let pgsz = parseInt(str)
      if(isNaN(pgsz) || pgsz<=0) {
        await Ti.Alert("i18n:paging-change-pgsz-invalid", {
          title : "i18n:warn",
          type  : "warn",
          icon  : "im-warning",
          width : 420
        })
        return 
      }
      // 通知修改
      this.$notify("change:pgsz", pgsz)
      this.notifyChange({
        skip  : 0,
        limit : pgsz,
        pn    : 1, 
        pgsz  : pgsz
      })
    }
  }
  ///////////////////////////////////////////
}
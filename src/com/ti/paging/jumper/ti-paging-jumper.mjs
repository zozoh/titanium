export default {
  ///////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({
        pn : 0,     // Page Number
        pgsz : 0,   // PageSize
        pgc : 0,    // page count
        sum : 0,    // Total
        count : 0   // Record in page
      })
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasValue() {
      return !_.isEmpty(this.value) && this.value.pn > 0
    },
    //--------------------------------------
    PageNumberClass() {
      return this.hasValue && this.value.pgc > 1
              ? "is-enabled"
              : "is-disabled"
    },
    //--------------------------------------
    SumClass() {
      return this.hasValue && this.value.pgsz > 0
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
        || pageNumber > this.value.pgc
        || pageNumber == this.value.pn
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
        this.$notify("change", {
          skip :  this.value.pgsz * (pageNumber-1),
          limit :  this.value.pgsz, 
          pn   : pageNumber, 
          pgsz : this.value.pgsz
        })
      }
    },
    //--------------------------------------
    async OnClickCurrent() {
      // No Necessary
      if(this.value.pgc <= 1)
        return
      // Ask new pageNumber
      let msg = Ti.I18n.getf("paging-change-pn", this.value)
      let str = await Ti.Prompt(msg, {
        value : this.value.pn
      })
      // NoChange
      if(!str || str == this.value.pn)
        return
      // verify the str
      let pn = parseInt(str)
      if(isNaN(pn) || pn<=0 || pn>this.value.pgc) {
        msg = Ti.I18n.getf("paging-change-pn-invalid", this.value)
        await Ti.Alert(msg, {
          title : "i18n:warn",
          type  : "warn",
          icon  : "im-warning",
          width : 420
        })
        return 
      }
      // 通知修改
      this.$notify("change", {
        skip :  this.value.pgsz * (pn-1),
        limit :  this.value.pgsz, 
        pn   : pn, 
        pgsz : this.value.pgsz
      })
    },
    //--------------------------------------
    async OnClickSum(){
      let msg = Ti.I18n.getf("paging-change-pgsz", this.value)
      let str = await Ti.Prompt(msg, {
        value : this.value.pgsz
      })
      // NoChange
      if(!str || str == this.value.pgsz)
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
      this.$notify("change", {
        skip  : 0,
        limit : pgsz,
        pn    : 1, 
        pgsz  : pgsz
      })
    }
  }
  ///////////////////////////////////////////
}
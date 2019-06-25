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
      return this.data.pgsz > 0
              ? "is-enabled"
              : "is-disabled"
    }
  },
  ///////////////////////////////////////////
  methods : {
    btnClass(pageNumber) {
      if(pageNumber <=0 
        || pageNumber > this.data.pgc
        || pageNumber == this.data.pn) {
        return "is-disabled"
      }
      return "is-enabled"
    }
  }
  ///////////////////////////////////////////
}
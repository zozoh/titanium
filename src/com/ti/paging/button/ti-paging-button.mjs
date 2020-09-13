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
    },
    "maxNumber": {
      type : Number,
      default : 10
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-first" : 1 == this.PN,
        "is-last"  : this.PN == this.LastPN
      })
    },
    //--------------------------------------
    // 1base
    PN() {
      return _.get(this.value, "pn")
    },
    //--------------------------------------
    // 1base
    LastPN() {
      return _.get(this.value, "pgc")
    },
    //--------------------------------------
    isFirstPage() {
      return 1 == this.PN
    },
    //--------------------------------------
    isLastPage() {
      return this.LastPN == this.PN
    },
    //--------------------------------------
    BtnList() {
      let fullnb = this.maxNumber-2
      let remain = this.LastPN - 2
      let list = []
      if(remain < fullnb) {
        for(let pn = 1; pn<=this.LastPN; pn++) {
          list.push(this.genBtn(pn))
        }
      }
      // Move view port
      else {
        let half = fullnb / 2
        let from = Math.round(this.PN - half)
        let to   = Math.round(this.PN + half)
        if(from<=1) {
          to += (1-from)
          from = 2
        } else if(to>=this.LastPN){
          from -= (to - this.LastPN)
          to = this.LastPN - 1
        }
        else {
          to --
        }
        list.push(this.genBtn(1))
        if(from>2) {
          list.push(this.genBtn(".."))
        }
        for(let i=from; i<=to; i++) {
          list.push(this.genBtn(i))
        }
        if(to < (this.LastPN-2)) {
          list.push(this.genBtn(".."))
        }
        list.push(this.genBtn(this.LastPN))
      }

      return list
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    genBtn(pn) {
      if(".." == pn) {
        return {ellipsis:true}
      }
      return {
        value: pn, 
        className: {
          "is-current" : this.PN == pn
        }
      }
    },
    //--------------------------------------
    JumpTo(pn) {
      if(pn!=this.PN && pn>=1 && pn<=this.LastPN) {
        this.$notify("change", {
          skip :  this.value.pgsz * (pn-1),
          limit :  this.value.pgsz, 
          pn   : pn, 
          pgsz : this.value.pgsz
        })
      }
    }
  }
  ///////////////////////////////////////////
}
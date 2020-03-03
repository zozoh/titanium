export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "myCandidates" : []
  }),
  ///////////////////////////////////////////////////////
  props : {
    "candidates" : {
      type : [String, Array, Function],
      default : ()=>[]
    },
    "loadingIcon" : {
      type : String,
      default : "zmdi-settings zmdi-hc-spin"
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    theCandidateComType() {
      return this.candidateComType || "wn-list"
    },
    //---------------------------------------------------
    theCheckedComType() {
      return this.checkedComType || "wn-list"
    },
    //---------------------------------------------------
    theFilterBy() {
      if(_.isArray(this.filterBy)) {
        return this.filterBy
      }
      return "$emit:filter"
    },
    //------------------------------------------------
    theValueBy() {
      return this.valueBy || "id"
    },
    //------------------------------------------------
    theDisplay() {
      return this.dropDisplay || ["@<thumb>", "title", "nm"]
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalCandidates(query, val) {
      this.loading = true
      console.log(query, val)
      this.myCandidates = await Wn.Util.queryBy(query, val)
      console.log(this.myCandidates)
      this.loading = false
    },
    //-----------------------------------------------
    async onFilterChanged(val) {
      if(val) {
        await this.evalCandidates(this.filterBy, val)
      } else {
        await this.evalCandidates(this.candidates)
      }
    }
    //---------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : async function() {
    await this.evalCandidates(this.candidates)
  }
  ///////////////////////////////////////////////////////
}
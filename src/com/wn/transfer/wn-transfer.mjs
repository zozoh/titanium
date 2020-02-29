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
      this.myCandidates = await Wn.Util.queryBy(query, val)
      this.loading = false
    },
    //-----------------------------------------------
    async onFilterChanged(val) {
      this.myCandidates = val 
        ? await this.evalCandidates(this.filterBy, val)
        : await this.evalCandidates(this.candidates)
    }
    //---------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : async function() {
    await this.evalCandidates(this.candidates)
  }
  ///////////////////////////////////////////////////////
}
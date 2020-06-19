const _M = {
  /////////////////////////////////////////
  props : {
    "payOk" : {
      type : Boolean,
      default : false
    },
    "errMsg" : {
      type : String,
      default : "Name have page personal assume actually study else. Court response"
    },
    "orderId": {
      type: String,
      default: undefined
    }
  },
  //////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-ok": this.payOk,
        "is-fail": !this.payOk
      })
    },
    //----------------------------------------------
    TheIcon() {
      return this.payOk
        ? this.okIcon
        : this.failIcon
    },
    //----------------------------------------------
    TheText() {
      return this.payOk
        ? this.okText
        : this.failText
    },
    //----------------------------------------------
    TheLinks() {
      let list = _.cloneDeep(this.payOk
        ? _.concat(this.okLinks, this.doneLinks)
        : _.concat(this.failLinks, this.doneLinks))

      let links = []
      _.forEach(list, li=> {
        links.push(_.defaults(Ti.Util.explainObj(this, li), {
          icon: 'zmdi-chevron-right'
        }))
      })
      return links
    },
    //----------------------------------------------
    hasLinks() {
      return !_.isEmpty(this.TheLinks)
    }
    //----------------------------------------------
  },
  //////////////////////////////////////////////////
  methods: {
    OnClickLink({path, params}={}) {
      if(path) {
        this.$notify("nav:to", {
          value: path,
          params
        })
      }
    }
  }
  //////////////////////////////////////////////////
}
export default _M;
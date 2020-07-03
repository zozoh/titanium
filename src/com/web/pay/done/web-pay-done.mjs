const _M = {
  /////////////////////////////////////////
  props : {
    "payOk" : {
      type : Boolean,
      default : undefined
    },
    "errMsg" : {
      type : String,
      default : undefined
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
        "is-wait" : this.isWait,
        "is-ok"   : !this.isWait && this.payOk,
        "is-fail" : !this.isWait && !this.payOk
      })
    },
    //----------------------------------------------
    isWait() {
      return _.isUndefined(this.payOk)
    },
    //----------------------------------------------
    TheIcon() {
      if(_.isUndefined(this.payOk)) {
        return this.waitIcon
      }
      return this.payOk
        ? this.okIcon
        : this.failIcon
    },
    //----------------------------------------------
    TheText() {
      if(_.isUndefined(this.payOk)) {
        return this.waitText
      }
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
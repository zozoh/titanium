export default {
  ////////////////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : undefined
    },
    "viewReady" : {
      type : Boolean,
      default : false
    },
    "match" : {
      type : Object,
      default : undefined
    },
    "sort" : {
      type : Object,
      default : ()=>({
        nm : 1
      })
    },
    "skip" : {
      type : Number,
      default: 0
    },
    "limit" : {
      type : Number,
      default: 100
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass();
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async reloadChildren(obj=this.meta) {
      if(!obj || !obj.id)
        return []

      let match = _.cloneDeep(this.match) || {}
      match.pid = obj.id

      let reo = await Wn.Io.find({
        match,
        skip  : this.skip,
        limit : this.limit,
        sort  : this.sort
      })

      return reo.list || []
    },
    //------------------------------------------------
    async _try_reload() {
      if(_.isFunction(this.reload) && this.meta && this.viewReady) {
        await this.reload()
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "meta" : {
      handler : function(newVal, oldVal) {
        if(!_.isEqual(newVal, oldVal)) {
          this._try_reload()
        }
      }
    },
    "viewReady" : {
      handler : "_try_reload",
      immediate : true
    }
  }
  ////////////////////////////////////////////////////
}
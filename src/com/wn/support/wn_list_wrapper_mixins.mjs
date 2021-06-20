export default {
  ///////////////////////////////////////////////////
  data : ()=>({
    myData : []
  }),
  ///////////////////////////////////////////////////
  props : {
    // The context of the data if dynamic
    "value" : {
      type: Object,
      default: ()=>({})
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    explainDisplayItems(display=[]) {
      let displayItems = _.concat(display)
      let list = []
      _.forEach(displayItems, (it)=>{
        // Guard
        if(Ti.Util.isNil(it)) {
          return
        }
        // Quick: table.field.display:: thumb->icon
        if(_.isString(it)) {
          let m = /^@<thumb(:([^>:]*))?(:([^>]*))?>$/.exec(it)
          if(m) {
            let candidateIcon = m[2] || undefined
            let key = m[4]
            if(!key) {
              key = ["icon", "thumb", "tp", "mime", "race", "__updated_time"]
            } else {
              key = key.split(",")
              if(key.length == 1) {
                key = key[0]
              }
            }
            list.push({
              key,
              type : "Object",
              transformer : {
                name : "Ti.Types.toObject",
                args : {
                  icon  : "icon",
                  thumb : "thumb",
                  type  : "tp",
                  mime  : "mime",
                  race  : "race",
                  timestamp : "__updated_time"
                }
              },
              comType  : "wn-obj-icon",
              comConf : {
                "..." : "${=value}",
                "candidateIcon" : candidateIcon,
                //"className"   : "thing-icon"
              }
            })
            return
          }
        }
        // Other, just join
        list.push(it)
      })
      return list
    },
    //-----------------------------------------------
    async evalMyData() {
      // Just array data
      if(_.isArray(this.data)) {
        this.myData = _.cloneDeep(this.data)
        return
      }
      // Process function
      let reo = this.data
      while(_.isFunction(reo)) {
        reo = await data(this.value)
      }
      // Process command
      if(_.isString(reo)) {
        let cmdText = Ti.S.renderBy(reo, this.value)
        reo = await Wn.Sys.exec2(cmdText, {as:"json"})
      }
      // Update my data
      if(_.isArray(reo)) {
        this.myData = reo
      } else if(_.isArray(reo.list)) {
        this.myData = reo.list
      } else {
        this.myData = [reo]
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data": {
      handler : "evalMyData",
      immediate: true
    }
  }
  ///////////////////////////////////////////////////
}
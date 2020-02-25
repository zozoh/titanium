export default {
  ///////////////////////////////////////////////////
  methods : {
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
          let m = /^@<thumb(:([^>]*))?>$/.exec(it)
          if(m) {
            let defaultIcon = m[2] || undefined
            list.push({
              key : ["icon", "thumb", "tp", "mime", "race", "__updated_time"],
              type : "Object",
              transformer : {
                name : "toObject",
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
                "defaultIcon" : defaultIcon,
                "className"   : "thing-icon"
              }
            })
            return
          }
        }
        // Other, just join
        list.push(it)
      })
      return list
    }
  }
  ///////////////////////////////////////////////////
}
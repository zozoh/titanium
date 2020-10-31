export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    myList : [],
    dataReady : false
  }),
  ////////////////////////////////////////////////////
  props : {
    "comType" : {
      type : String,
      default : undefined
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TabsGUILayout() {
      let gui = {
        type : "tabs",
        blocks : []
      }
      _.forEach(this.myList, o => {
        console.log(o, this.dataReady)
        let comConf = Ti.Util.explainObj({
          dataReady : this.dataReady,
          home : this.meta,
          meta : o
        }, this.comConf)
        let li = {
          title : o.title || o.nm,
          name  : o.nm,
          icon  : o.icon,
          body : {
            comType : this.comType,
            comConf
          }
        }
        gui.blocks.push(li)
      })

      return gui
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async reload() {
      this.dataReady = false
      this.myList = await this.reloadChildren()
      this.dataReady = true
    } 
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    myShown : {},
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
    },
    "keepShownTo" : {
      type : String,
      default : "keep_shown_${id}"
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

      if(gui.blocks.length == 1) {
        this.myShown = {
          [gui.blocks[0].name] : true
        }
      }

      return gui
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnGuiInit($gui) {
      this.$gui = $gui
    },
    //------------------------------------------------
    OnShownChange(shown) {
      this.myShown = shown

      let shownKey = this.getShownKey()
      if(shownKey) {
        Ti.Storage.session.setObject(shownKey, shown)
      }
    },
    //------------------------------------------------
    $MainBlock() {
      let keys = [];
      _.forEach(this.myShown, (v, k)=>{
        if(v)
        keys[0] = k
      })
      let key = _.nth(keys, 0)
      if(key) {
        return this.$gui.$block(key)
      }
    },
    //------------------------------------------------
    $MainCom() {
      let $b = this.$MainBlock()
      if($b)
        return $b.$main()
    },
    //------------------------------------------------
    getShownKey() {
      if(this.keepShownTo && this.meta) {
        return Ti.S.renderBy(this.keepShownTo, this.meta)
      }
    },
    //------------------------------------------------
    async reload() {
      this.dataReady = false
      console.log("do reload")
      this.myList = await this.reloadChildren()
      this.dataReady = true

      let shownKey = this.getShownKey()
      if(shownKey) {
        this.myShown = Ti.Storage.session.getObject(shownKey)
      }
    } 
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
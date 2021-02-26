export default {
  /////////////////////////////////////////
  data: ()=>({
    oHome : undefined
  }),
  /////////////////////////////////////////
  props : {
    "home" : {
      type: [String, Object],
      default: undefined
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    isViewReady() {
      return this.oHome ? true : false
    },
    //------------------------------------
    FilesetListConf() {
      return {
        meta : "=meta",
        viewReady : this.isViewReady,
        metaType : null,
        createTip : "请输入新项目的名称",
        listTitle : "映射列表",
        listSize : 200,
        detailIcon  : "fas-traffic-light",
        detailTitle : "映射详情",
        detailType : "HmConfigIoDetail",
        detailConf : {
          
        }
      }
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnTabsInit($tabs) {
      this.$tabs = $tabs;
    },
    //------------------------------------------------
    doCreate(payload) {
      let $mcom = this.$tabs.$MainCom()
      if($mcom) {
        $mcom.doCreate(payload)
      }
    },
    //------------------------------------------------
    doDelete(payload) {
      let $mcom = this.$tabs.$MainCom()
      if($mcom) {
        $mcom.doDelete(payload)
      }
    },
    //------------------------------------------------
    doRename(payload) {
      let $mcom = this.$tabs.$MainCom()
      if($mcom) {
        $mcom.doRename(payload)
      }
    },
    //------------------------------------------------
    async openContentEditor() {
      let $mcom = this.$tabs.$MainCom()
      if($mcom && $mcom.hasCurrent) {
        return await $mcom.openContentEditor()
      }
    },
    //------------------------------------------------
    async openCurrentMeta() {
      let $mcom = this.$tabs.$MainCom()
      if($mcom && $mcom.hasCurrent) {
        return await $mcom.openCurrentMeta()
      }
      await Ti.App(this).dispatch("current/openMetaEditor")
    },
    //------------------------------------------------
    async reloadAll() {
      Ti.App(this).commit("current/setStatus", {reloading:true})
      // Reload self
      await this.reload()

      // Reload tabs
      await this.$tabs.reload()

      // Reload main
      let $mcom = this.$tabs.$MainCom()
      if($mcom) {
        await $mcom.reload()
      }
      Ti.App(this).commit("current/setStatus", {reloading:false})
    },
    //------------------------------------
    async reload() {
      if(this.home) {
        if(_.isString(this.home)) {
          this.oHome = await Wn.Io.loadMeta(this.home)
        } else {
          this.oHome = _.cloneDeep(this.home)
        }
      }
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  watch : {
    "home" : {
      handler : "reload",
      immediate : true
    }
  }
  /////////////////////////////////////////
}
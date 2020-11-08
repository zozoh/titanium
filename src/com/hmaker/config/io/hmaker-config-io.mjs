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
        listTitle : "映射列表",
        listSize : 200,
        detailIcon  : "fas-traffic-light",
        detailTitle : "映射详情",
        detailType : "HmakerConfigIoDetail",
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
    //------------------------------------
    async reloadHome() {
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
      handler : "reloadHome",
      immediate : true
    }
  }
  /////////////////////////////////////////
}
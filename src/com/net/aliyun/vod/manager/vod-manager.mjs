export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    reloading: false,
    list: [],
    pager: {},
    scrollToken: null
  }),
  ///////////////////////////////////////////////////////
  props : {
    "meta": {
      type: Object,
      default: ()=>({})
    },
    "fields": {
      type: String,
      default: "Title,CoverURL,Duration,CateName,Size"
    },
    "pageSize": {
      type: Number,
      default: 20
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    ConfName() {
      return _.get(this.meta, "vodConfigName")
    },
    //---------------------------------------------------
    WallItemDisplay() {
      return {
        key : "..",
        comType : 'ti-obj-thumb',
        comConf : it => ({
          id: it.videoId,
          title: it.title,
          preview: {
            type: "image",
            value: it.coverURL
          } 
        })
      }
    },
    //---------------------------------------------------
    GuiLayout(){
      return {
        type: "cols",
        border:true,
        blocks: [{
            type:"rows",
            size:"61.8%",
            blocks: [{
                name: "filter",
                size: 40,
                body: "pcFilter"
              }, {
                name: "list",
                body: "pcList"
              }, {
                name: "pager",
                size: 50,
                body: "pcPager"
              }]
          }, {
            icon: "zmdi-tv-alt-play",
            title: "i18n:detail",
            name: "video",
            body: "pcVideo"
          }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        pcFilter: {
          comType: "ti-input",
          comConf: {}
        },
        pcList: {
          comType: "ti-wall",
          comConf: {
            data: this.list,
            idBy: "videoId",
            display: this.WallItemDisplay
          }
        },
        pcPager: {
          comType : "ti-paging-jumper",
          comConf : {
            value : this.pager
          }
        },
        pcVideo: {
          comType: "ti-label",
          comConf: {
            value: this.scrollToken
          }
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    //---------------------------------------------------
    async reloadVideos() {
      this.reloading = true
      // prepare the command
      let cmds = ["aliyunvod"]
      if(this.ConfName) {
        cmds.push(this.ConfName)
      }
      cmds.push("search", "-fields", `'${this.fields}'`)
      cmds.push("-pgsz", this.pageSize)
      cmds.push("-as page -cqn")

      // Run
      let reo = await Wn.Sys.exec2(cmds.join(" "), {as:"json"})
      this.list  = reo.list
      this.pager = reo.pager
      this.scrollToken = reo.scrollToken

      // Mark
      this.reloading = false
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    this.reloadVideos()
  }
  ///////////////////////////////////////////////////////
}
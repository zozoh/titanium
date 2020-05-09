export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    reloading: false,
    list: [],
    pager: {},
    scrollToken: null,
    myCurrentId: null,
    myCurrentVideo: null
  }),
  ///////////////////////////////////////////////////////
  props : {
    "meta": {
      type: Object,
      default: ()=>({})
    },
    "fields": {
      type: String,
      default: "Title,CoverURL,Duration,CateName,Size,Description,RegionID"
    },
    "pageSize": {
      type: Number,
      default: 20
    },
    "multi": {
      type: Boolean,
      default: true
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
    CmdPrefix() {
      if(this.ConfName) {
        return `aliyunvod ${this.ConfName}`
      }
      return "aliyunvod"
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
            border:true,
            blocks: [{
                name: "filter",
                size: 40,
                body: "pcFilter"
              }, {
                name: "list",
                body: "pcList"
              }, {
                name: "pager",
                size: 40,
                body: "pcPager"
              }]
          }, {
            icon: "zmdi-tv-alt-play",
            title: "i18n:video",
            name: "video",
            body: "pcVideo"
          }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        pcFilter: {
          comType: "ti-combo-filter",
          comConf: {
            className: "as-spacing-tiny",
            placeholder: "i18n:net-flt-nil",
            form: {
              fields: [{
                title: "i18n:net-ct",
                name: "createTime",
                type: "Array",
                comType: "ti-input-daterange",
                comConf: {}
              }]
            }
          }
        },
        pcList: {
          comType: "ti-wall",
          comConf: {
            data: this.list,
            idBy: "videoId",
            multi: this.multi,
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
          comType: "net-aliyun-vod-video-info",
          comConf: {
            value: this.myCurrentVideo
          }
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnFilterChange(payload) {
      console.log("FilterChange", payload)
    },
    //---------------------------------------------------
    async OnListSelect({currentId, checkedIds, checked}) {
      this.myCurrentId = currentId
      // Select some thing
      if(currentId) {
        this.myCurrentVideo = await this.reloadVideoInfo(currentId)
        this.$notify("change", {
          currentId  : this.myCurrentId,
          current    : this.myCurrentVideo,
          checkedIds, checked
        })
      }
      // Select nothing
      else {
        this.myCurrentVideo = null
        this.$notify("change", undefined)
      }
    },
    //---------------------------------------------------
    async OnVideoPreview({title, videoId, coverURL}={}){
      // Request the playAuth
      let playAuth = await this.requestPlayAuth(videoId)

      // Open player
      await Ti.App.Open({
        icon: "zmdi-tv-alt-play",
        title: `Preview: ${title}`,
        textOk: null,
        textCancel: "i18n:close",
        position: "top",
        width: "90%",
        height: "90%",
        comType: "NetAliyunVodVideoPlayer",
        comConf: {
          videoId, playAuth,
          coverUrl: coverURL
        },
        components: "@com:net/aliyun/vod/video/player"
      })
    },
    //---------------------------------------------------
    async requestPlayAuth(videoId) {
      this.reloading = true
      let cmds = [this.CmdPrefix, "playauth", videoId, "-cqn"]
      let reo = await Wn.Sys.exec2(cmds.join(" "), {as:"json"})
      this.reloading = false

      return reo.playAuth
    },
    //---------------------------------------------------
    async reloadVideoInfo(videoId) {
      this.reloading = true
      let cmds = [this.CmdPrefix, "video", videoId, "-cqn"]
      let reo = await Wn.Sys.exec2(cmds.join(" "), {as:"json"})
      this.reloading = false

      return reo
    },
    //---------------------------------------------------
    async reloadVideos() {
      this.reloading = true
      // prepare the command
      let cmds = [this.CmdPrefix]
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
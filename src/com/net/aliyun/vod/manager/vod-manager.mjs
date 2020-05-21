export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    reloading: false,
    list: [],
    pager: {},
    scrollToken: null,
    myCurrentId: null,
    myCurrentVideo: null,
    myFilter: {
      match: {},
      sort: {by:"CreationTime", as:-1}
    }
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
    "form": {
      type: Object,
      default: ()=>({
        fields: [{
            title: "i18n:net-ct",
            name: "CreationTime",
            type: "Array",
            comType: "ti-input-daterange"
          // }, {
          //   title: "i18n:net-vod-cate",
          //   name : "CateName",
          //   comType: "ti-input"
          }, {
            title: "i18n:net-vod-duration",
            name: "Duration",
            comType: "ti-switcher",
            comConf: {
              autoSplitValue: false,
              options: [
                {value: "[0, 600]",    text:"i18n:net-vod-du-short"},
                {value: "(600, 4800]", text:"i18n:net-vod-du-tv"},
                {value: "(4800, )",    text:"i18n:net-vod-du-long"},
              ]
            }
          }]
      })
    },
    "sorter": {
      type: Object,
      default: ()=>({
        text: "i18n:net-ct",
        __options: [
          {value:"CreationTime", text:"i18n:net-ct"},
          {value:"CateName",     text:"i18n:net-vod-cate"},
          {value:"Duration",     text:"i18n:net-vod-duration"},
          {value:"Size",         text:"i18n:net-vod-size"},]
      })
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
    ThePageNumber() {
      return _.get(this.pager, "pn") || 1
    },
    //---------------------------------------------------
    ThePageSize() {
      return _.get(this.pager, "pgsz") || this.pageSize
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
            form: this.form,
            sorter: this.sorter,
            value: this.myFilter
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
    async OnFilterChange(filter) {
      this.myFilter = filter
      this.pager = _.assign({}, this.pager, {pn:1})
      await this.reloadVideos()
    },
    //---------------------------------------------------
    async OnPagerChange(pg) {
      this.pager = _.assign({}, this.pager, pg)
      await this.reloadVideos()
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
    toAliyunTime(tm) {
      return 
    },
    //---------------------------------------------------
    toMatchStr(keyword, match={}) {
      let ss = []
      if(!Ti.S.isBlank(keyword)) {
        ss.push(`Title in ('${keyword.replace(/'/g,"")}')`)
      }

      // March
      _.forEach(match, (val, key)=>{
        if(Ti.Util.isNil(val)) {
          return
        }
        //......................................
        // Region
        if(_.isString(val) && /^[\[(].+[)\]]$/.test(val)) {
          ss.push(`${key}=${val}`)
        }
        //......................................
        // Time
        else if(/time/i.test(key)) {
          let tfmt = "yyyy-MM-dd'T'HH:mm:ss'Z'"
          let times = Ti.Types.formatDateTime(val, tfmt)
          times = _.concat(times)

          // All day
          if(times.length == 1) {
            times.push(times[0])
          }

          // Move the last date
          let lastDay = Ti.Types.toDate(times[1]).getTime() + 86400000;
          times[1] = Ti.Types.formatDateTime(lastDay, tfmt)
          
          // Add scope
          ss.push(`${key}=['${times[0]}', '${times[1]}')`)
        }
                //......................................
        // In list
        else if(_.isArray(val)) {
          let vv = _.map(val, v=> {
            if(_.isString(v))
              return  v.replace(/'/g,"")
            return v
          })
          ss.push(`${key} in (${vv.join(",")})`)
        }
        //......................................
        // String
        else if(_.isString(val)) {
          ss.push(`${key} in ('${val.replace(/'/g,"")}')`)
        }
        //......................................
        // Others
        else {
          ss.push(`${key} = ${val}`)
        }
      })
      return ss.join(" and ")
    },
    //---------------------------------------------------
    async reloadVideos() {
      this.reloading = true
      // prepare the command
      let cmds = [this.CmdPrefix]
      //.................................................
      cmds.push("search", "-fields", `'${this.fields}'`)
      //.................................................
      // Join the Filter: Match/keyword
      let keyword = _.get(this.myFilter, "keyword")
      let match = _.get(this.myFilter, "match")
      if(!_.isEmpty(match) || !Ti.Util.isNil(keyword)) {
        try{
          cmds.push("-match", `"${this.toMatchStr(keyword, match)}"`)
        }catch(E) {
          console.error(E)
        }
      }
      //.................................................
      // Join the Filter: Sort
      let sort = _.get(this.myFilter, "sort")
      if(!_.isEmpty(sort)) {
        cmds.push("-sort", `'${sort.by}:${sort.as>0?"Asc":"Desc"}'`)
      }
      //.................................................
      // Join paging
      cmds.push("-pn", this.ThePageNumber)
      cmds.push("-pgsz", this.ThePageSize)
      cmds.push("-as page -cqn")

      //console.log("reloadVideo", cmds)
      //.................................................
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
export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    myCurrentId : undefined,
    ytConfig : undefined,
    ytPlaylists : [],
    ytVideos : undefined
  }),
  ///////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "meta" : {
      type : Object
    },
    "domain": {
      type : String
    },
    "channelId" : {
      type : String
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "notifyName" : {
      type : String
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    hasCurrent() {
      return this.myCurrentId ? true : false
    },
    //---------------------------------------------------
    CurrentVideo() {
      return this.getVideoObj(this.myCurrentId)
},
    //---------------------------------------------------
    GuiLayout(){
      return {
        type: "cols",
        border:true,
        blocks: [{
          name : "list",
          size : "62%",
          body : "pcList"
        }, {
          name : "detail",
          body : "pcDetail"
        }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        pcList: {
          comType: "TiWall",
          comConf: {
            data: this.WallItemList,
            idBy: "id",
            multi: false,
            display: {
              key : "..",
              comType : "ti-obj-thumb",
              comConf : {
                "..." : "${=value}"
              }
            }
          }
        },
        pcDetail: {
          comType: "NetYoutubeDetail",
          comConf: {
            value: this.CurrentVideo
          }
        }
      }
    },
    //---------------------------------------------------
    WallItemList() {
      if(!this.ytVideos)
        return
      let list = _.map(this.ytVideos, video=>{
        return {
          id : video.id,
          title : video.title,
          preview : video.thumbUrl,
          badges : {
            "SE" : {
              type : "text",
              className : "bchc-badge as-label",
              value : video.du_in_str
            }
          }
        }
      })
      return list
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnListSelect({currentId}) {
      this.myCurrentId = currentId
      let video = _.cloneDeep(this.CurrentVideo)
      if(this.notifyName) {
        this.$notify(this.notifyName, video)
      }
    },
    //---------------------------------------------------
    getVideoObj(videoId) {
      if(videoId && _.isArray(this.ytVideos)) {
        for(let video of this.ytVideos) {
          if(video.id == videoId) {
            return video
          }
        }
      }
    },
    //---------------------------------------------------
    async reload(force=false) {
      // Guard
      if(!this.domain || !this.channelId)
        return

      this.ytVideos = undefined

      // Reload config
      let config = await Wn.Youtube.loadConfig({
        domain : this.domain,
        channelId : this.channelId,
        force
      })

      let playlists = await Wn.Youtube.getAllPlaylists(config)
      let videos = await Wn.Youtube.getAllVideos(config)

      // Reload playlist
      this.ytConfig = config
      this.ytPlaylists = playlists
      this.ytVideos = videos 
    },
    //--------------------------------------------
    async openCurrentMeta() {
      let meta = this.CurrentVideo || this.meta

      if(!meta) {
        await Ti.Toast.Open("i18n:nil-obj")
        return
      }

      let fields = "auto"
      if(this.hasCurrent) {
        const V_FIELD = (name, title)=>{
          return {
            title, name,
            comType : "TiLabel"
          }
        }
        fields = [
          V_FIELD("id", "ID"),
          V_FIELD("title", "Title"),
          V_FIELD("description", "Description"),
          V_FIELD("publishedAt", "PublishedAt"),
          V_FIELD("tags", "Tags"),
          V_FIELD("duration", "Duration"),
          V_FIELD("du_in_sec", "Du in sec"),
          V_FIELD("du_in_str", "Du in str"),
          V_FIELD("definition", "Definition"),
          V_FIELD("categoryId", "CategoryId"),
        ]
      }

      await Wn.EditObjMeta(meta, {
        fields,
        textOk : null,
        autoSave : false
      })
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "domain" : "reload",
    "channelId" : "reload"
  },
  ///////////////////////////////////////////////////////
  mounted : async function() {
    await this.reload();
  }
  ///////////////////////////////////////////////////////
}
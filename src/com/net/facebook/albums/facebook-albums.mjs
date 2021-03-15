/////////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    myId : undefined,
    myLongLiveAK : undefined,
    myAlbumList : undefined,
    currentAlbumId : undefined,
    myPhotoList : []
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
    "appId" : {
      type : String
    },
    "appSecret" : {
      type : String
    },
    "longLiveAccessToken": {
      type : String
    },
    "tokenExpiresIn" : {
      type : Number,
    },
    "tokenType" : {
      type : String
    },
    "tokenExpaireAt" : {
      type : Number,
      default : 0
    },
    "userId" : {
      type : String
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "apiVersion" : {
      type : String,
      default : "v10.0"
    },
    "autoLogAppEvents" : {
      type : Boolean,
      default : true
    },
    "xfbml" : {
      type : Boolean,
      default : true
    },
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
    hasCurrentAlbum() {
      return this.currentAlbumId ? true : false
    },
    //---------------------------------------------------
    CurrentAlbum() {
      return this.getAlbum(this.currentAlbumId)
    },
    //---------------------------------------------------
    GuiLayout(){
      return {
        type: "rows",
        border:true,
        blocks: [{
            name : "photos",
            body : "photos"
          }, {
            name : "albums",
            size : "30%",
            body : "albums"
          }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        albums: {
          comType: "TiWall",
          comConf: {
            data: this.myAlbumList,
            idBy: "id",
            multi: false,
            display: {
              key : "..",
              comType : "ti-obj-thumb",
              comConf : {
                "id" : "${id}",
                "title" : "${name}",
                "preview" : {
                  type : "font",
                  value : "fas-images"
                },
                "badges" : {
                  "SW" : "fab-facebook-square"
                }
              }
            }
          }
        },
        photos: {
          comType: "WebShelfWall",
          comConf: {
            className : "ti-fill-parent flex-none item-space-sm",
            style : {
              "overflow" : "auto",
              "padding"  : ".1rem"
            },
            data: this.PhotoItemList,
            itemWidth : "2rem",
            itemHeight : "1.5rem",
            comType : "WebMediaImage",
            comConf : {
              "..." : "=..",
              style : {
                "border" : "3px solid #EEE",
                "border-radius" : "6px"
              }
            }
          }
        },
        // pcDetail: {
        //   comType: "NetYoutubeDetail",
        //   comConf: {
        //     value: this.CurrentVideo
        //   }
        // }
      }
    },
    //---------------------------------------------------
    PhotoItemList() {
      if(!this.myPhotoList)
        return
      let list = _.map(this.myPhotoList, photo=>{
        return {
          id : photo.id,
          text : photo.name,
          src : _.get(photo, "images.1.source")
        }
      })
      return list
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnAlbumSelect({currentId}) {
      this.currentAlbumId = currentId

      this.reloadPhotos()

      let album = _.cloneDeep(this.CurrentAlbum)
      if(this.notifyName) {
        this.$notify(this.notifyName, album)
      }
    },
    //---------------------------------------------------
    getAlbum(albumId) {
      if(_.isArray(this.myAlbumList)) {
        for(let ab of this.myAlbumList) {
          if(ab.id == albumId) {
            return ab
          }
        }
      }
    },
    //---------------------------------------------------
    FBAPI(path) {
      return `https://graph.facebook.com/${this.apiVersion}/${path}`
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
    async reloadPhotos() {
      if(!this.hasCurrentAlbum) {
        this.myPhotoList = []
        return
      }
      // Reload albums
      this.myPhotoList = undefined
      let url = this.FBAPI(`${this.currentAlbumId}/photos`)
      let reo = await Ti.Http.get(url, {
        params : {
          access_token : this.myLongLiveAK,
          fields : "id,name,width,height,images"
        },
        as : "json"
      })
      let {data, paging} = reo
      this.myPhotoList = data
    },
    //---------------------------------------------------
    async reloadAlbums() {
      // Reload albums
      let url = this.FBAPI(`${this.myId}/albums`)
      let reo = await Ti.Http.get(url, {
        params : {
          access_token : this.myLongLiveAK,
          fields : "id,name,place,created_time,description,link,cover_photo"
        },
        as : "json"
      })
      let {data, paging} = reo
      this.myAlbumList = data
    },
    //---------------------------------------------------
    async reloadLongLiveAccessToken(accessToken) {
      let url = this.FBAPI("oauth/access_token")
      let reo = await Ti.Http.get(url, {
        params : {
          "grant_type" : "fb_exchange_token",
          "client_id" : this.appId,
          "client_secret" : this.appSecret,
          "fb_exchange_token" : accessToken
        },
        as : "json"
      })
      // Grap Long live access token
      this.myLongLiveAK = reo.access_token

      // Save to remote
      if(reo.access_token) {
        let jsonToken = JSON.stringify({
          userId : this.myId,
          longLiveAccessToken : reo.access_token,
          tokenExpiresIn : reo.expires_in,
          tokenType : reo.token_type,
          tokenExpaireAt : Date.now() + reo.expires_in * 1000
        })
        let cmdText = `jsonx -qn @read ~/facebook -auto @set '${jsonToken}' > ~/facebook`
        await Wn.Sys.exec2(cmdText)
      }
      // Error
      else {
        console.error("Fail to reloadLongLiveAccessToken", reo)
      }
    },
    //---------------------------------------------------
    checkdLongLiveAccessToken() {
      // Refresh token before a day
      let expiAt = this.tokenExpaireAt - 86400000
      if(Date.now() > expiAt || !this.myId || !this.longLiveAccessToken) {
        FB.login(resp => {
          console.log("after login", resp)
          if (resp.authResponse) {
            let {accessToken, userID} = resp.authResponse
            this.myId = userID 
            // Get Long Live Access Token
            this.reloadLongLiveAccessToken(accessToken)
              .then(()=>{
                this.reloadAlbums()
              })
          }
        })
      }
      // Has a valid LongLiveAK
      else {
        this.myLongLiveAK = this.longLiveAccessToken
        this.reloadAlbums()
      }
    },
    //---------------------------------------------------
    initFBSdk() {
      // Get config file
      FB.init({
        appId            : this.appId,
        autoLogAppEvents : this.autoLogAppEvents,
        xfbml            : this.xfbml,
        version          : this.apiVersion
      });

      // Login
      this.checkdLongLiveAccessToken()
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "userId" : {
      handler : function(newVal){
        this.myId = newVal
      },
      immediate : true
    }
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    this.initFBSdk()
  }
  ///////////////////////////////////////////////////////
}
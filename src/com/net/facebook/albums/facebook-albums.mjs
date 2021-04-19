/////////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    myId : undefined,
    myName : undefined,
    myGrantedScopes : undefined,
    myLongLiveAK : undefined,
    myAlbumList : undefined,
    currentAlbumId : undefined,
    myPhotoList : [],
    myFilterKeyword : undefined
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
    "scope" : {
      type : String
    },
    "grantedScopes" : {
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
    "tokenExpireAt" : {
      type : Number,
      default : 0
    },
    "userId" : {
      type : String
    },
    "userName" : {
      type : String
    },
    "userAlbumIds" : {
      type : Array,
      default: ()=>[]
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
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "thumbMinHeight" : {
      type : Number,
      default : 320
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
    CurrentAlbumTitle() {
      return _.get(this.CurrentAlbum, "name") || "i18n:nil"
    },
    //---------------------------------------------------
    FilteredAlbumList() {
      let list = []
      let kwds = Ti.S.splitIgnoreBlank(_.toLower(this.myFilterKeyword), /[\s,;]+/g)
      _.forEach(this.myAlbumList, album=>{
        if(kwds.length == 0 || !album.name) {
          list.push(album)
        } else {
          let aName = _.toLower(album.name)
          for(let kwd of kwds) {
            if(aName.indexOf(kwd)>=0) {
              list.push(album)
              return
            }
          }
        }
      })
      return list
    },
    //---------------------------------------------------
    FilteredAlbumSummary() {
      let N = this.FilteredAlbumList.length
      let photoC = 0;
      for(let album of this.FilteredAlbumList) {
        photoC += album.count
      }
      return `Total ${N} albums ${photoC} photos`
    },
    //---------------------------------------------------
    ApiScope() {
      return this.scope || "public_profile"
    },
    //---------------------------------------------------
    ProfileSelectorIds() {
      return this.profileSelectorIds || this.userId || undefined
    },
    //---------------------------------------------------
    GuiLayout(){
      return {
        type: "cols",
        border:true,
        blocks: [{
            type : "rows",
            size : "50%",
            border : true,
            blocks : [{
                name : "filter",
                size : 52,
                style : {
                  padding: ".06rem"
                },
                body : "filter"
              }, {
                name : "albums",
                body : "albums"
              }, {
                name : "infos",
                size : 52,
                style : {
                  padding: ".06rem"
                },
                body : "infos"
              }]
          }, {
            icon : "fab-facebook-square",
            title : this.CurrentAlbumTitle,
            name : "photos",
            body : "photos"
          }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        filter : {
          comType : "TiInput",
          comConf : {
            placeholder : "Enter the album name to filter",
            value : this.myFilterKeyword
          }
        },
        infos : {
          comType : "TiLabel",
          comConf : {
            className : "align-right as-tip",
            value : this.FilteredAlbumSummary
          }
        },
        albums : {
          comType: "TiWall",
          comConf: {
            data: this.FilteredAlbumList,
            idBy: "id",
            multi: false,
            display: {
              key : "..",
              comType : "ti-obj-thumb",
              comConf : {
                "id" : "=item.id",
                "title" : "=item.name",
                "preview" : "=item.preview",
                "badges" : {
                  "NW" : "fab-facebook-square",
                  "SE" : {
                    type : "text",
                    className : "bchc-badge as-label",
                    value : "=item.count"
                  }
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
            data: this.myPhotoList,
            itemWidth : "2rem",
            itemHeight : "1.5rem",
            comType : "WebMediaImage",
            comConf : {
              text : "=name",
              src  : "=thumb_src",
              className : [
                "text-in", "at-bottom","ts-shadow","fs-sm",
                "of-con-visiable",
                "hover-to-up-img is-fit-auto"],
              imageStyle : {
                "border" : "3px solid #EEE",
                "border-radius" : "6px"
              }
            }
          }
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnFilterChange(val) {
      this.myFilterKeyword = _.trim(val) || undefined
    },
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
    ReloginFBAccount() {
      this.checkdLongLiveAccessToken(true)
    },
    //---------------------------------------------------
    FBAPI(path) {
      return `https://graph.facebook.com/${this.apiVersion}/${path}`
    },
    //--------------------------------------------
    async openCurrentMeta() {
      let meta = this.CurrentAlbum || this.meta

      if(!meta) {
        await Ti.Toast.Open("i18n:nil-obj")
        return
      }

      let fields = "auto"
      if(this.hasCurrentAlbum) {
        const V_FIELD = (name, title)=>{
          return {
            title, name,
            comType : "TiLabel"
          }
        }
        fields = [
          V_FIELD("id", "ID"),
          V_FIELD("title", "Title"),
          V_FIELD("created_time", "Created Time"),
          V_FIELD("link", "Link")
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

      this.myPhotoList = await Ti.Api.Facebook.getAlbumPhotoList({
        albumId : this.currentAlbumId,
        access_token : this.myLongLiveAK
      })

      // Save to cache
      if(!_.isEmpty(this.myPhotoList) && this.domain) {
        let input = JSON.stringify(this.myPhotoList)
        let fnm = `album.${this.currentAlbumId}.photos.json`
        let cmdText = `str > ~/.domain/facebook/${this.domain}/${fnm}`
        await Wn.Sys.exec2(cmdText, {input})
      }
    },
    //---------------------------------------------------
    async reloadAlbumsCover(albums=[], force=false) {
      // Load Cache
      let fnm = `user.${this.myId}.albums.cover_photos.json`
      let fph = `~/.domain/facebook/${this.domain}/${fnm}`
      let photos = {}
      if(!force) {
        let oPhotos = await Wn.Io.loadMeta(fph)
        if(oPhotos) {
          photos = await Wn.Io.loadContent(oPhotos, {as:"json"})
        }
      }
      // Set photos to each album obj
      let loadedPhoto = false
      for(let album of albums) {
        if(album && album.cover_photo && album.cover_photo.id) {
          let photoId = album.cover_photo.id
          let photo = photos[photoId];
          // Load from facebook
          if(!photo) {
            photo = await Ti.Api.Facebook.getPhoto({
              photoId,
              access_token : this.myLongLiveAK
            })
          }
          // Set to album
          if(photo && !_.isEmpty(photo.images)) {
            loadedPhoto = true
            photos[photoId] = photo
            Ti.Api.Facebook.setObjPreview(album, photo.images)
          }
        }
      }
      // Cache to local
      if(loadedPhoto) {
        let input = JSON.stringify(photos)
        await Wn.Sys.exec2(`str > ${fph}`, {input})
      }
    },
    //---------------------------------------------------
    async reloadAlbums() {
      this.myAlbumList = undefined
      let albums = await Ti.Api.Facebook.getAlbumList({
        userId : this.myId,
        access_token : this.myLongLiveAK
      })
      // Reload cover
      await this.reloadAlbumsCover(albums)
      this.myAlbumList = albums

      // Update albums Ids to profile
      let aIds = _.map(this.myAlbumList, al => al.id)
      if(!_.isEqual(aIds, this.userAlbumIds)) {
        let json = JSON.stringify({
          userAlbumIds : aIds
        })
        let cmdText = `jsonx -qn @read id:${this.meta.id} -auto @set '${json}' > id:${this.meta.id}`
        await Wn.Sys.exec2(cmdText)
      }
      // If current album out of the albumn list
      // Maybe user switch the account, then clean the photoList
      if(this.currentAlbumId) {
        let currentInAlbum = false
        for(let al of this.myAlbumList) {
          if(al.id == this.currentAlbumId) {
            currentInAlbum = true
            break
          }
        }
        if(!currentInAlbum) {
          this.currentAlbumId = null
          this.myPhotoList = []
        }
      }
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
        let expireAt = Date.now() + reo.expires_in * 1000
        // Update file content
        let jsonToken = JSON.stringify({
          userId : this.myId,
          userName : this.myName,
          scope : this.ApiScope,
          grantedScopes : this.myGrantedScopes,
          longLiveAccessToken : reo.access_token,
          tokenExpiresIn : reo.expires_in,
          tokenType : reo.token_type,
          tokenExpireAt : expireAt
        })
        let cmdText = `jsonx -qn @read id:${this.meta.id} -auto @set '${jsonToken}' > id:${this.meta.id}`
        await Wn.Sys.exec2(cmdText)
        // Update file meta
        let objMeta = JSON.stringify({
          title : this.myName,
          token_expire_at : expireAt
        })
        cmdText = `o id:${this.meta.id} @update`
        await Wn.Sys.exec2(cmdText, {input:objMeta})
      }
      // Error
      else {
        console.error("Fail to reloadLongLiveAccessToken", reo)
      }
    },
    //---------------------------------------------------
    checkdLongLiveAccessToken(force=false) {
      // Refresh token before a day
      let expiAt = this.tokenExpireAt - 86400000
      if(force || Date.now() > expiAt || !this.myId || !this.longLiveAccessToken) {
        FB.login(resp => {
          console.log("after login", resp)
          if (resp.authResponse) {
            let {accessToken, userID, grantedScopes} = resp.authResponse
            this.myId = this.userId || userID
            this.myGrantedScopes = grantedScopes
            FB.api('/'+this.myId, resp => {
              console.log('Good to see you, ' + resp.name + '.', resp);
              // Get Long Live Access Token
              this.myName = resp.name
              this.reloadLongLiveAccessToken(accessToken)
                .then(()=>{
                  this.reloadAlbums()
                })
            });
          }
        }, {
          scope: this.ApiScope,
          return_scopes: true,
          profile_selector_ids : this.ProfileSelectorIds
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
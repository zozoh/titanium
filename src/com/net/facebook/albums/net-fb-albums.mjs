/////////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////////
  data: () => ({
    appId: null,
    appSecret: null,
    grantedScopes: null,
    longLiveAccessToken: null,
    tokenExpiresIn: 5183967,
    tokenType: "bearer",
    tokenExpireAt: 0,

    myId: undefined,
    myName: undefined,
    myGrantedScopes: undefined,
    myLongLiveAK: undefined,

    myAlbumCoverCache: undefined,

    myAlbumList: undefined,
    myAlbumMoreLoading: false,
    myAlbumCursorAfter: undefined,
    currentAlbumId: undefined,

    myPhotoList: [],
    myPhotoMoreLoading: false,
    myPhotoCursorAfter: undefined,

    myFilterKeyword: undefined
  }),
  ///////////////////////////////////////////////////////
  props: {},
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    hasCurrentAlbum() {
      return this.currentAlbumId ? true : false
    },
    //---------------------------------------------------
    AlbumnCoverCachePath() {
      return `~/.domain/facebook/${this.domain}.cover.json`
    },
    //---------------------------------------------------
    AccountName() {
      return _.get(this.oDir, "nm")
    },
    //---------------------------------------------------
    CurrentAlbum() {
      return this.getAlbum(this.currentAlbumId)
    },
    //---------------------------------------------------
    CurrentAlbumTitle() {
      if (this.hasCurrentAlbum) {
        let title = _.get(this.CurrentAlbum, "name")
        let count = '..'
        if (_.isArray(this.myPhotoList)) {
          count = this.myPhotoList.length
        }
        return `(${count}/${this.CurrentAlbum.count})📷 ${title}`
      }
      return "i18n:nil"
    },
    //---------------------------------------------------
    FilteredAlbumList() {
      let list = []
      let kwds = Ti.S.splitIgnoreBlank(_.toLower(this.myFilterKeyword), /[\s,;]+/g)
      _.forEach(this.myAlbumList, album => {
        if (kwds.length == 0 || !album.name) {
          list.push(album)
        } else {
          let aName = _.toLower(album.name)
          for (let kwd of kwds) {
            if (aName.indexOf(kwd) >= 0) {
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
      for (let album of this.FilteredAlbumList) {
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
    isLoadingAlbums() {
      return _.isUndefined(this.myAlbumList) || this.myAlbumMoreLoading
    },
    //---------------------------------------------------
    isLoadingPhotos() {
      return this.hasCurrentAlbum
        && (_.isUndefined(this.myPhotoList) || this.myPhotoMoreLoading)
    },
    //---------------------------------------------------
    AlbumPhotoData() {
      if (!_.isArray(this.myPhotoList)) {
        return
      }
      let re = []
      _.forEach(this.myPhotoList, photo => {
        let p2 = _.cloneDeep(photo)
        Ti.WWW.FB.setObjPreview(p2, p2.images)
        re.push(p2)
      })
      return re
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //---------------------------------------------------
    OnFilterChange(val) {
      this.myFilterKeyword = _.trim(val) || undefined
    },
    //---------------------------------------------------
    async OnAlbumSelect({ currentId }) {
      this.currentAlbumId = currentId

      //await this.reloadAllPhotos()
      await this.loadNPhotos(2, { reset: true })

      let album = _.cloneDeep(this.CurrentAlbum)
      if (this.notifyName) {
        this.$notify(this.notifyName, album)
      }
    },
    //---------------------------------------------------
    async loadMoreAlbums() {
      let N = await Ti.Prompt('How many page you want to load');
      N = N * 1
      if (N > 0) {
        await this.doLoadMoreAlbums(N)
      }
    },
    //---------------------------------------------------
    async doLoadMoreAlbums(N = 1, { reset } = {}) {
      if (reset) {
        this.myAlbumList = []
        this.myAlbumCursorAfter = undefined
      }
      else if (!this.myAlbumCursorAfter) {
        Ti.Toast.Open("No more data", { position: "bottom", type: "info" })
        return false
      }
      this.myAlbumMoreLoading = true
      await this.loadNAlbums(N)
      this.myAlbumMoreLoading = false
      return true
    },
    //---------------------------------------------------
    async doLoadMorePhotos(N = 1) {
      if (!this.myPhotoCursorAfter) {
        Ti.Toast.Open("No more data", { position: "bottom", type: "info" })
        return false
      }
      this.myPhotoMoreLoading = true
      await this.loadNPhotos(N)

      // Set to data
      this.myPhotoMoreLoading = false
      return true
    },
    //---------------------------------------------------
    getAlbum(albumId) {
      if (_.isArray(this.myAlbumList)) {
        for (let ab of this.myAlbumList) {
          if (ab.id == albumId) {
            return ab
          }
        }
      }
    },
    //--------------------------------------------
    async viewLoadedAlbumsJson() {
      if (this.myAlbumList) {
        let json = JSON.stringify(this.myAlbumList, null, '    ')
        Ti.EditCode(json, { mode: "json", width: "90%", height: "80%" })
      }
    },
    //--------------------------------------------
    // 覆盖主菜单的属性
    async openCurrentMeta() {
      // 显示当前的相册
      if (this.CurrentAlbum) {
        let json = JSON.stringify(this.CurrentAlbum, null, '    ')
        let re = Ti.EditCode(json, { mode: "json", width: "90%", height: "80%" })
        console.log(re)
        return
      }

      // 显示集合属性
      await Ti.App(this).dispatch("main/openCurrentMetaEditor")
    },
    //---------------------------------------------------
    //
    //                  主要的数据操作接口
    //
    //---------------------------------------------------
    async loadNPhotos(N = 1, {
      reset = false,
      page = 1
    } = {}) {
      //console.log("reloadNPhotos", N)
      if (reset) {
        this.myPhotoList = []
        this.myPhotoCursorAfter = undefined
      }
      if (!this.hasCurrentAlbum) {
        return
      }

      let results = []
      // Read the first page
      let after = this.myPhotoCursorAfter
      let re = await this.reloadPhotos({ after })
      if (re.list) {
        results.push(...re.list)
      }
      // Reaload remain pages
      while (page < N && re.after) {
        re = await this.reloadPhotos({ after: re.after })
        page++
        if (re.list) {
          results.push(...re.list)
        }
      }

      this.myPhotoCursorAfter = re.after
      this.myPhotoList = _.concat(this.myPhotoList, results)
      return re.after ? true : false
    },
    //---------------------------------------------------
    async reloadPhotos({ after } = {}) {
      if (!this.hasCurrentAlbum) {
        return { list: [] }
      }
      // Reload albums
      let { data, paging } = await Wn.FbAlbum.loadPhotos(
        this.domain,
        this.currentAlbumId,
        { after }
      )

      return {
        list: data,
        before: _.get(paging, "cursors.before"),
        after: _.get(paging, "cursors.after")
      }
    },
    //---------------------------------------------------
    //
    //      加载相册接口
    //
    //---------------------------------------------------
    async initAlbumCoverCache() {
      if (Ti.Util.isNil(this.myAlbumCoverCache)) {
        let ph = this.AlbumnCoverCachePath
        let re = await Wn.Sys.exec2(`cat -quiet '${ph}'`)
        let cc = _.trim(re) ? JSON.parse(re) : {}
        this.myAlbumCoverCache = cc || {}
      }
    },
    //---------------------------------------------------
    async reloadAlbumsCover(albums = [], force = false) {
      // 确保加载了缓存
      await this.initAlbumCoverCache()
      // Set photos to each album obj
      let loader = []
      let cache = {}
      for (let album of albums) {
        if (album && album.cover_photo && album.cover_photo.id) {
          let photoId = album.cover_photo.id

          // match cache
          // {width,height,src,thumb_src, preview}
          let objImg = this.myAlbumCoverCache[photoId]
          if (objImg) {
            _.assign(album, objImg)
            continue
          }

          // load photo
          loader.push(
            Wn.FbAlbum.loadPhoto(this.domain, photoId, force)
              .then(photo => {
                if (!_.isEmpty(photo.images)) {
                  let objImg = Ti.WWW.FB.setObjPreview(album, photo.images)
                  cache[photoId] = objImg
                }
              })
          )
        }
      }
      await Promise.all(loader)

      // Save cache 
      if (!_.isEmpty(cache)) {
        console.log("save cache")
        cache = _.defaults(cache, this.myAlbumCoverCache)
        this.myAlbumCoverCache = cache
        let ph = this.AlbumnCoverCachePath
        await Wn.Sys.exec2(`str > ${ph}`, { input: JSON.stringify(cache) })
      }
    },
    //---------------------------------------------------
    async resetCoverAndLoadAlbums() {
      let ph = this.AlbumnCoverCachePath
      await Wn.Sys.exec2(`rm '${ph}'`)
      this.myAlbumCoverCache = undefined
      this.loadNAlbums(1, { reset: true })
    },
    //---------------------------------------------------
    async loadNAlbums(N = 1, {
      reset = false,
      page = 1
    } = {}) {
      //console.log("loadNAlbums", N, this.myAlbumMoreLoading)
      if (reset) {
        this.myAlbumList = []
        this.myAlbumCursorAfter = undefined
      }

      let results = []
      // Read the first page
      let after = this.myAlbumCursorAfter
      let re = await this.reloadAlbums({ after })
      if (re.list) {
        results.push(...re.list)
      }
      // Reaload remain pages
      while (page < N && re.after) {
        re = await this.reloadAlbums({ after: re.after })
        page++
        if (re.list) {
          results.push(...re.list)
        }
      }

      this.myAlbumCursorAfter = re.after

      // 确保不能加入重复的相册
      let list = _.cloneDeep(this.myAlbumList)
      let ids = {}
      _.forEach(this.myAlbumList, ({ id }) => ids[id] = true)
      _.forEach(results, ab => {
        if (!ids[ab.id]) {
          list.push(ab)
        }
      })
      this.myAlbumList = list

      this.checkCurrentAlbums()

      return re.after ? true : false
    },
    //---------------------------------------------------
    async reloadAlbums({ after } = {}) {
      // Invoke api
      let { data, paging } = await Wn.FbAlbum.loadAlbums(
        this.domain,
        this.myId,
        { after }
      )
      //console.log(data)
      await this.reloadAlbumsCover(data)

      return {
        list: data,
        before: _.get(paging, "cursors.before"),
        after: _.get(paging, "cursors.after")
      }
    },
    //---------------------------------------------------
    checkCurrentAlbums() {
      // If current album out of the albumn list
      // Maybe user switch the account, then clean the photoList
      if (this.currentAlbumId) {
        let currentInAlbum = false
        for (let al of this.myAlbumList) {
          if (al.id == this.currentAlbumId) {
            currentInAlbum = true
            break
          }
        }
        if (!currentInAlbum) {
          this.currentAlbumId = null
          this.myPhotoList = []
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    "userId": {
      handler: function (newVal) {
        this.myId = newVal
      },
      immediate: true
    }
  },
  ///////////////////////////////////////////////////////
  mounted: async function () {
    await this.initFBSdk()
  }
  ///////////////////////////////////////////////////////
}
/////////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    GuiActionStatus() {
      return {
        hasAlbum: this.hasCurrentAlbum,
        albumLoading: this.isLoadingAlbums,
        photoReloading: this.isLoadingPhotos
      }
    },
    //---------------------------------------------------
    GuiLayout() {
      return {
        type: "cols",
        border: true,
        blocks: [{
          type: "rows",
          size: "50%",
          border: true,
          blocks: [{
            name: "filter",
            size: 52,
            style: {
              padding: ".06rem"
            },
            body: "filter"
          }, {
            name: "albums",
            body: "albums"
          }, {
            name: "infos",
            size: 52,
            style: {
              padding: ".06rem"
            },
            body: "infos"
          }]
        }, {
          icon: "fab-facebook-square",
          title: this.CurrentAlbumTitle,
          actions: [{
            name: "photoReloading",
            icon: "zmdi-refresh",
            text: "i18n:refresh",
            altDisplay: {
              "icon": "zmdi-refresh zmdi-hc-spin"
            },
            enabled: "hasAlbum",
            action: async () => {
              await this.reloadAllPhotos(true)
            }
          }],
          name: "photos",
          body: "photos"
        }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        filter: {
          comType: "TiInput",
          comConf: {
            placeholder: "Enter the album name to filter",
            value: this.myFilterKeyword
          }
        },
        infos: {
          comType: "TiLabel",
          comConf: {
            className: "align-right as-tip",
            value: this.FilteredAlbumSummary
          }
        },
        albums: {
          comType: "TiWall",
          comConf: {
            data: this.FilteredAlbumList,
            idBy: "id",
            multi: false,
            autoLoadMore: true,
            display: {
              key: "..",
              comType: "ti-obj-thumb",
              comConf: {
                "id": "=item.id",
                "title": "=item.name",
                "preview": "=item.preview",
                "badges": {
                  "NW": "fab-facebook-square",
                  "SE": {
                    type: "text",
                    className: "bchc-badge as-label",
                    value: "=item.count"
                  }
                }
              }
            },
            showLoadMore: this.myAlbumCursorAfter ? true : false,
            moreLoading: this.myAlbumMoreLoading
          }
        },
        photos: {
          comType: "WebShelfWall",
          comConf: {
            className: "ti-fill-parent flex-none item-space-sm",
            style: {
              "overflow": "auto",
              "padding": ".1rem"
            },
            data: this.AlbumPhotoData,
            itemWidth: "2rem",
            itemHeight: "1.5rem",
            comType: "WebMediaImage",
            comConf: {
              text: "=name",
              src: "=thumb_src",
              className: [
                "text-in", "at-bottom", "ts-shadow", "fs-sm",
                "of-con-visiable",
                "hover-to-up-img is-fit-auto"],
              imageStyle: {
                "border": "3px solid #EEE",
                "border-radius": "6px"
              }
            },
            showLoadMore: this.myPhotoCursorAfter ? true : false,
            moreLoading: this.myPhotoMoreLoading
          }
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //---------------------------------------------------
    
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
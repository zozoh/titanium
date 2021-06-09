export default {
  //--------------------------------------
  explainWnImage($div) {
    let $imgs = Ti.Dom.findAll("img[wn-obj-id]", $div);
    for (let $img of $imgs) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($img, (key) => {
        if (key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let src = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey: "..",
        previewObj: "..",
        apiTmpl: this.apiTmpl,
        cdnTmpl: this.cdnTmpl,
        dftSrc: this.dftImgSrc
      })
      $img.src = src
    }
  },
  //--------------------------------------
  explainWnAttachment($div) {
    let $els = Ti.Dom.findAll(".wn-attachment", $div);
    for (let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key) => {
        if (key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let href = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey: "..",
        previewObj: "..",
        apiTmpl: this.downTmpl || this.apiTmpl
      })
      let $an = Ti.Dom.createElement({
        tagName: "A",
        className: "wn-attachment",
        attrs: { href }
      })
      let icon = Ti.Icons.get(obj, "fas-paperclip")
      let iconHtml = Ti.Icons.fontIconHtml(icon)
      let html = `<span class="as-icon">${iconHtml}</span>`
      if (obj.title) {
        html += `<span class="as-title">${obj.title}</span>`
      }
      $an.innerHTML = html
      Ti.Dom.replace($el, $an)
    }
  },
  //--------------------------------------
  explainWnMediaVideo($div) {
    let $els = Ti.Dom.findAll(".wn-media.as-video", $div);
    for (let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key) => {
        if (key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let src = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey: "..",
        previewObj: "..",
        apiTmpl: this.apiTmpl,
        cdnTmpl: this.cdnTmpl,
        dftSrc: this.dftImgSrc
      })
      let $video = Ti.Dom.createElement({
        tagName: "video",
        attrs: {
          src,
          controls: true
        },
        style: {
          width: "100%",
          height: "100%"
        }
      })
      $el.innerHTML = null
      Ti.Dom.appendTo($video, $el)
    }
  },
  //--------------------------------------
  explainWnMediaAudio($div) {
    let $els = Ti.Dom.findAll(".wn-media.as-audio", $div);
    for (let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key) => {
        if (key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let src = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey: "..",
        previewObj: "..",
        apiTmpl: this.apiTmpl,
        cdnTmpl: this.cdnTmpl,
        dftSrc: this.dftImgSrc
      })
      let $audio = Ti.Dom.createElement({
        tagName: "audio",
        attrs: {
          src,
          controls: true
        },
        style: {
          width: "100%",
          height: "100%"
        }
      })
      $el.innerHTML = null
      Ti.Dom.appendTo($audio, $el)
    }
  },
  //--------------------------------------
  explainWnMediaYoutube($div) {
    let $els = Ti.Dom.findAll(".wn-media.as-youtube", $div);
    for (let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key) => {
        if (key.startsWith("wn-yt-")) {
          return key.substring(6)
        }
      })
      //console.log(obj)
      // Eval the src
      let $frame = Ti.Dom.createElement({
        tagName: "iframe",
        attrs: {
          src: `//www.youtube.com/embed/${obj.id}`,
          allow: obj.allow,
          allowfullscreen: obj.allowfullscreen
        },
        style: {
          width: "100%",
          height: "100%"
        }
      })
      $el.innerHTML = null
      Ti.Dom.appendTo($frame, $el)
    }
  },
  //--------------------------------------
  async explainTiAlbum($div) {
    let $els = Ti.Dom.findAll(".ti-widget-album", $div);
    for (let $el of $els) {
      //
      // Get album setup by type
      //
      let setup = ({
        "album": {
          attrPrefix: "wn-obj-",
          itemToPhoto: {
            name: "=title",
            link: "#",
            src: (obj) => {
              return Ti.WWW.evalObjPreviewSrc(obj, {
                previewKey: "..",
                previewObj: "..",
                apiTmpl: this.apiTmpl,
                cdnTmpl: this.cdnTmpl,
                dftSrc: this.dftImgSrc
              })
            },
            thumb: (obj) => {
              return Ti.WWW.evalObjPreviewSrc(obj, {
                previewKey: "thumb",
                previewObj: "thumbObj",
                apiTmpl: this.apiTmpl,
                cdnTmpl: this.cdnTmpl,
                dftSrc: this.dftImgSrc
              })
            },
            brief: "=brief"
          }
        },
        "fb-album": {
          attrPrefix: "wn-fb-",
          itemToPhoto: {
            name: "=name",
            link: "=link",
            thumb: "=thumbSrc",  // "thumb_src" will be camelCase
            src: "=src"
          }
        },
        "yt-playlist": {
          attrPrefix: "wn-ytpl-",
          itemToPhoto: {
            name: "=title",
            link: `->${this.ytPlayerTmpl}`,
            thumb: "=thumbUrl",
            src: "=coverUrl",
            brief: "=description",
          }
        }
      })[$el.getAttribute("ti-album-type") || "album"]
      //
      // Create widget
      //
      let AB = Ti.Widget.Album.getOrCreate($el, _.assign(setup, {
        live: true
      }))

      // Get album info
      let album = AB.getData()
      let items;

      // Reload album data
      if(this.fbAlbumApiTmpl && "fb-album" == album.type) {
        console.log(album)
        console.log("local items", AB.getItems())

        let url = Ti.S.renderBy(this.fbAlbumApiTmpl, album)
        console.log(url)
        items = await Ti.Http.get(url, {as: "json"})
        console.log("server items", items)
        Ti.Api.Facebook.setObjListPreview(items)
      }
      // Get data from album DOM
      else {
        items = AB.getItems()
      }

      // Redraw
      //console.log(album, items)
      AB.renderItems(items)
    }
  },
  //--------------------------------------
  bindLiveWidgets($div) {
    let LIVE_WIDGETS = {
      "album-fullpreview": function ($el) {
        Ti.Widget.PhotoGallery.bind($el, {
          titleKey: $el.getAttribute("ti-live-title-key") || "title"
        })
      }
    }
    let $els = Ti.Dom.findAll('[ti-live-widget]', $div)
    for (let $el of $els) {
      let widgetType = $el.getAttribute("ti-live-widget")
      let initFunc = LIVE_WIDGETS[widgetType]
      if (_.isFunction(initFunc)) {
        initFunc($el)
      }
      // Invalid live widget type, warn user
      else {
        console.warn("Invalid widget type", widgetType)
      }
    }
  },
  //--------------------------------------
  async redrawContent() {
    // Guard
    if (!_.isElement(this.$refs.main))
      return false;

    // Create fragment 
    let $div = Ti.Dom.createElement({
      tagName: "div"
    })

    // Prepare HTML
    let html = this.ArticleHtml || ""
    html = html.replace("<script", "[SCRIPT")
    $div.innerHTML = html

    // Image
    this.explainWnImage($div)

    // Attachment
    this.explainWnAttachment($div)

    // Video
    this.explainWnMediaVideo($div)

    // Audio
    this.explainWnMediaAudio($div)

    // Youtube video
    this.explainWnMediaYoutube($div)

    // Album: (album/FbAlbum/YtPlaylist)
    await this.explainTiAlbum($div)

    // Update the article content
    this.$refs.main.innerHTML = $div.innerHTML

    // Found all outer resource
    let $imgs = Ti.Dom.findAll("img", this.$refs.main)
    let medias = []
    for (let i = 0; i < $imgs.length; i++) {
      let $img = $imgs[i]
      medias[i] = false
      $img.__resource_index = i
      $img.addEventListener("load", (evt) => {
        let img = evt.target || evt.srcElement
        let iX = img.__resource_index
        this.myMedias[iX] = true
        _.delay(() => {
          this.checkContentReady()
        })
      }, { once: true })
    }
    this.myMedias = medias

    // Bind Live widget
    this.bindLiveWidgets(this.$refs.main)

    // Customized redraw
    if (this.afterRedraw) {
      let fn = Ti.Util.genInvoking(this.afterRedraw)
      if (_.isFunction(fn)) {
        fn({
          $el: this.$el,
          $main: this.$refs.main
        })
      }
    }

    // Notify
    if (this.redrawnNotifyName) {
      this.$notify(this.redrawnNotifyName, {
        $el: this.$el,
        $main: this.$refs.main
      })
    }

    console.log("redraw article done")

    // Auto first open
    let selector = [
      '.ti-widget-album[wn-obj-fullpreview="true"][wn-obj-autoopen="true"]',
      '.ti-widget-album[wn-fb-fullpreview="true"][wn-fb-autoopen="true"]',
    ].join(",")
    let $album = Ti.Dom.find(selector, this.$refs.main)
    if ($album) {
      $album.click();
    }

    return true
  },
  //--------------------------------------
  checkContentReady() {
    for (let m of this.myMedias) {
      if (!m) {
        return
      }
    }

    // Customized redraw
    if (this.whenReady) {
      let fn = Ti.Util.genInvoking(this.whenReady)
      if (_.isFunction(fn)) {
        fn({
          $el: this.$el,
          $main: this.$refs.main
        })
      }
    }

    // Notify
    if (this.readyNotifyName) {
      this.$notify(this.readyNotifyName, {
        $el: this.$el,
        $main: this.$refs.main
      })
    }
  }
  //--------------------------------------
}
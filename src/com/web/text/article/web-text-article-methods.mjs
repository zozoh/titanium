export default {
  //--------------------------------------
  doInflateBlankParagraph($div) {
    let $ps = Ti.Dom.findAll("p", $div)
    for (let $p of $ps) {
      if (Ti.Util.isBlank($p.textContent)) {
        // Find the first empty span
        let $spans = Ti.Dom.findAll("span", $p)
        for (let $span of $spans) {
          if (Ti.Util.isBlank($span.textContent)) {
            $span.innerHTML = "&nbsp;"
            break
          }
        }
      }
    }
  },
  //--------------------------------------
  cleanMediaSize($div) {
    let $medias = Ti.Dom.findAll(".wn-media", $div)
    for (let $media of $medias) {
      // User force keep the style
      if('off' == $media.getAttribute('wn-raw-size')){
        continue;
      }
      let css = { width: "", height: "", margin: "" }
      if ($media.style.float && "none" != $media.style.float) {
        css.float = ""
        Ti.Dom.addClass($media, "as-phone-block")
      }
      Ti.Dom.updateStyle($media, css)
    }
  },
  //--------------------------------------
  deconstructTable($div) {
    let $tables = Ti.Dom.findAll(":scope > table, :scope > * > table", $div)
    let $freg = new DocumentFragment()
    const tidyHtml = function (el) {
      let html = el.innerHTML
      if (1 == el.childElementCount) {
        return html.replace(/(<p[^>]*>)|(<\/p>)/g, "")
      }
      return _.trim(html)
    }
    const createHr = function () {
      return Ti.Dom.createElement({
        tagName: "hr",
        className: "decon-table as-table-tr"
      })
    }
    for (let $table of $tables) {
      //
      // Table caption
      //
      let $caption = Ti.Dom.find("caption", $table)
      if ($caption) {
        let $caP = Ti.Dom.createElement({
          tagName: "p",
          className: "decon-table as-table-caption"
        })
        $caP.innerHTML = $caption.innerHTML
        $freg.appendChild(createHr())
        $freg.appendChild($caP)
      }
      //
      // Found thead
      //
      let $rows;
      let $thead = Ti.Dom.find('thead', $table)
      let headers = []
      if ($thead) {
        $rows = Ti.Dom.findAll('tr', $thead)
        if (!_.isEmpty($rows)) {
          for (let $row of $rows) {
            let $cells = Ti.Dom.findAll("td,th", $row)
            let offX = 0;
            for (let x = 0; x < $cells.length; x++) {
              let $cell = $cells[x]
              let span = $cell.getAttribute("colspan") * 1 || 1
              let cellHtml = tidyHtml($cell)
              for (let i = 0; i < span; i++) {
                let headHtml = headers[offX]
                if (headHtml && "&nbsp;" != headHtml) {
                  headHtml += " " + cellHtml
                } else {
                  headHtml = cellHtml
                }
                headers[offX] = headHtml
                offX++;
              }
            }
          }
        }
        Ti.Dom.remove($thead)
      }
      //console.log($table)
      // Begin Table
      $freg.appendChild(createHr())
      // Decon each row
      $rows = Ti.Dom.findAll("tr", $table)
      for (let $row of $rows) {
        // Each cell
        let $cells = Ti.Dom.findAll("td", $row)
        for (let i = 0; i < $cells.length; i++) {
          let $cell = $cells[i]
          let html = tidyHtml($cell)
          // Ignore the empty cell
          if (!html || "&nbsp;" == html) {
            continue;
          }
          let $p = Ti.Dom.createElement({
            tagName: "p",
            className: "decon-table as-table-cess"
          })
          let headHtml = _.get(headers, i)
          if (headHtml) {
            html = headHtml + '<span>:</span> ' + html
          }
          $p.innerHTML = html
          $freg.appendChild($p)
        }
        // End row
        $freg.appendChild(createHr())
      }
      // Insert before table
      $table.parentElement.insertBefore($freg, $table)
      Ti.Dom.remove($table)
    }
  },
  //--------------------------------------
  explainJsHref($div) {
    let $links = Ti.Dom.findAll("a[href]", $div);
    for (let $link of $links) {
      let href = $link.getAttribute("href")
      let m = /^js:(.+)$/.exec(href)
      if (m) {
        if (this.allowJsHref) {
          $link.setAttribute("href", `javascript:${m[1]}`)
        } else {
          $link.removeAttribute("href")
        }
      }
    }
  },
  //--------------------------------------
  explainWnImage($div) {
    let $imgs = Ti.Dom.findAll("img[wn-obj-id]", $div);
    for (let $img of $imgs) {
      //console.log($img)
      // Prepare the obj
      let obj = Ti.Dom.attrs($img, (key) => {
        if (key.startsWith("wn-obj-")) {
          return _.camelCase(key.substring(7))
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
          return _.camelCase(key.substring(7))
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
          return _.camelCase(key.substring(7))
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
          return _.camelCase(key.substring(7))
        }
      })
      //console.log(obj)
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
  getTiAlbumObj($el) {
    let albumType = $el.getAttribute("ti-album-type")
    let styleUrlRewrite;
    if (this.apiTmpl) {
      styleUrlRewrite = (bgUrl) => {
        let m = /^url\(['"]?\/o\/content\?str=id:([^&'")]+)([^)'"]*)['"]?\)?$/.exec(bgUrl)
        if (m) {
          let id = m[1]
          let src = Ti.S.renderBy(this.apiTmpl, { id })
          return `url('${src}')`
        }
        return bgUrl
      }
    }
    //
    // Get album setup by type
    //
    let setup = ({
      "album": {
        attrPrefix: "wn-obj-",
        itemToPhoto: {
          name: "=title",
          link: "=href",
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
        },
        styleUrlRewrite
      },
      "fb-album": {
        attrPrefix: "wn-fb-",
        itemToPhoto: {
          name: "=name",
          link: "=link",
          thumb: "=thumbSrc",  // "thumb_src" will be camelCase
          src: "=src"
        },
        styleUrlRewrite
      },
      "yt-playlist": {
        attrPrefix: "wn-ytpl-",
        itemToPhoto: {
          name: "=title",
          link: `->${this.ytPlayerTmpl}`,
          thumb: "=thumbUrl",
          src: "=coverUrl",
          brief: "=description",
        },
        styleUrlRewrite
      }
    })[albumType || "album"]

    //
    // Create widget
    //
    return Ti.Widget.Album.getOrCreate($el, _.assign(setup, {
      live: true
    }))
  },
  //--------------------------------------
  async explainTiAlbum($div) {
    let $els = Ti.Dom.findAll(".ti-widget-album", $div);
    for (let $el of $els) {
      //
      // Create widget
      //
      let AB = this.getTiAlbumObj($el)

      // Get album info
      let album = AB.getData()
      let items;

      // Reload album data
      if (this.fbAlbumApiTmpl && "fb-album" == album.type) {
        //console.log(album)
        //console.log("local items", AB.getItems())

        let url = Ti.S.renderBy(this.fbAlbumApiTmpl, album)
        //console.log(url)
        items = await Ti.Http.get(url, { as: "json" })
        //console.log("server items", items)
        Ti.WWW.FB.setObjListPreview(items)
      }
      // Get data from album DOM
      else {
        items = AB.getItems()
      }

      // Rewrite style
      Ti.Dom.setStyle($el, album.style)

      // Redraw
      //console.log(album, items)
      AB.renderItems(items)
    }
  },
  //--------------------------------------
  bindLiveWidgets($div) {
    let vm = this
    //................................................
    const OnWidgetBeforeClose = () => {
      if (vm.albumBeforeCloseNotifyName) {
        vm.$notify(vm.albumBeforeCloseNotifyName)
      }
      if (_.isFunction(vm.whenAlbumBeforeClose)) {
        vm.whenAlbumBeforeClose()
      }
    }
    //................................................
    const OnWidgetClosed = () => {
      if (vm.albumClosedNotifyName) {
        vm.$notify(vm.albumClosedNotifyName)
      }
      if (_.isFunction(vm.whenAlbumClosed)) {
        vm.whenAlbumClosed()
      }
    }
    //................................................
    let LIVE_WIDGETS = {
      "album-fullpreview": function ($el) {
        Ti.Widget.PhotoGallery.bind($el, {
          titleKey: $el.getAttribute("ti-live-title-key") || "title",
          showOpener: vm.photoGalleryShowOpener,
          ignoreSrcElement: ($el) => {
            if (Ti.Dom.closest($el, ".album-ex-link")) {
              return true
            }
            return false
          },
          getData: function () {
            let AB = vm.getTiAlbumObj($el)
            let photos = AB.getPhotos()
            return _.map(photos, (it, index) => {
              return {
                index,
                srcThumb: it.thumb,
                srcLarge: it.src,
                src: it.src,
                title: it.name,
                link: it.link
              }
            })
          },
          onBeforeClose: OnWidgetBeforeClose,
          onClosed: OnWidgetClosed
        })
      }
    }
    //
    // Open album photo gallery
    //
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
    //
    // Open image photo gallery
    // It will browser all page image as on gallery
    //
    if (this.showImageGallery) {
      $els = Ti.Dom.findAll('img.wn-media.as-image', $div)
      let arMediaImages = _.map($els, ($el, index) => {
        let src = $el.getAttribute("src")
        let $link = Ti.Dom.closest($el, "a.wn-media")
        let $alt = Ti.Dom.find($link, ".as-img-alt")
        let link, title;
        if ($link) {
          link = $link.getAttribute("href")
        }
        if ($alt) {
          title = $alt.innerText
        }
        return {
          $el, index, link, title,
          src, srcThumb: src, srcLarge: src,
        }
      })
      for (let arMI of arMediaImages) {
        if (arMI.link) {
          continue
        }
        Ti.Widget.PhotoGallery.bind(arMI.$el, {
          showOpener: vm.photoGalleryShowOpener,
          getData: function () {
            return arMediaImages
          },
          onBeforeClose: OnWidgetBeforeClose,
          onClosed: OnWidgetClosed
        })
      }
    }
  },
  //--------------------------------------
  async redrawContent() {
    // Guard
    if (!_.isElement(this.$refs.main))
      return false;

    // Prepare HTML
    let html = this.ArticleHtml || ""
    html = html.replace("<script", "[SCRIPT")
    if (this.ignoreBlank && Ti.S.isBlank(html)) {
      return
    }

    // Create fragment 
    let $div = Ti.Dom.createElement({
      tagName: "div"
    })
    $div.innerHTML = html

    // Auto Decon-Table
    if (this.deconTable) {
      this.deconstructTable($div)
    }

    // Media raw-size
    if (this.mediaRawSize) {
      this.cleanMediaSize($div)
    }

    // Image
    this.explainWnImage($div)
 
    // Image
    this.explainJsHref($div)

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

    if (this.inflateBlankP) {
      this.doInflateBlankParagraph($div)
    }

    // Update the article content
    this.$refs.main.innerHTML = $div.innerHTML
    //console.log("redrawContent", this.$el.className, `【${$div.innerHTML}】`)

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

    //console.log("redraw article done")

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
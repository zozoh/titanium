export default {
  //--------------------------------------
  explainWnImage($div) {
    let $imgs = Ti.Dom.findAll("img[wn-obj-id]", $div);
    for(let $img of $imgs) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($img, (key)=>{
        if(key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let src = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey : "..",
        previewObj : "..",
        apiTmpl : this.apiTmpl,
        cdnTmpl : this.cdnTmpl,
        dftSrc : this.dftImgSrc
      })
      $img.src = src
    }
  },
  //--------------------------------------
  explainWnAttachment($div) {
    let $els = Ti.Dom.findAll(".wn-attachment", $div);
    for(let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key)=>{
        if(key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let href = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey : "..",
        previewObj : "..",
        apiTmpl : this.downTmpl || this.apiTmpl
      })
      let $an = Ti.Dom.createElement({
        tagName : "A",
        className : "wn-attachment",
        attrs : {href}
      })
      let icon = Ti.Icons.get(obj, "fas-paperclip")
      let iconHtml = Ti.Icons.fontIconHtml(icon)
      let html = `<span class="as-icon">${iconHtml}</span>`
      if(obj.title) {
        html += `<span class="as-title">${obj.title}</span>`
      }
      $an.innerHTML = html
      Ti.Dom.replace($el, $an)
    }
  },
  //--------------------------------------
  explainWnMediaVideo($div) {
    let $els = Ti.Dom.findAll(".wn-media.as-video", $div);
    for(let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key)=>{
        if(key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let src = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey : "..",
        previewObj : "..",
        apiTmpl : this.apiTmpl,
        cdnTmpl : this.cdnTmpl,
        dftSrc : this.dftImgSrc
      })
      let $video = Ti.Dom.createElement({
        tagName : "video",
        attrs : {
          src,
          controls : true
        },
        style : {
          width : "100%",
          height : "100%"
        }
      })
      $el.innerHTML = null
      Ti.Dom.appendTo($video, $el)
    }
  },
  //--------------------------------------
  explainWnMediaAudio($div) {
    let $els = Ti.Dom.findAll(".wn-media.as-audio", $div);
    for(let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key)=>{
        if(key.startsWith("wn-obj-")) {
          return key.substring(7)
        }
      })
      // Eval the src
      let src = Ti.WWW.evalObjPreviewSrc(obj, {
        previewKey : "..",
        previewObj : "..",
        apiTmpl : this.apiTmpl,
        cdnTmpl : this.cdnTmpl,
        dftSrc : this.dftImgSrc
      })
      let $audio = Ti.Dom.createElement({
        tagName : "audio",
        attrs : {
          src,
          controls : true
        },
        style : {
          width : "100%",
          height : "100%"
        }
      })
      $el.innerHTML = null
      Ti.Dom.appendTo($audio, $el)
    }
  },
  //--------------------------------------
  explainWnMediaYoutube($div) {
    let $els = Ti.Dom.findAll(".wn-media.as-youtube", $div);
    for(let $el of $els) {
      // Prepare the obj
      let obj = Ti.Dom.attrs($el, (key)=>{
        if(key.startsWith("wn-yt-")) {
          return key.substring(6)
        }
      })
      //console.log(obj)
      // Eval the src
      let $frame = Ti.Dom.createElement({
        tagName : "iframe",
        attrs : {
          src : `//www.youtube.com/embed/${obj.id}`,
          allow : obj.allow,
          allowfullscreen : obj.allowfullscreen
        },
        style : {
          width : "100%",
          height : "100%"
        }
      })
      $el.innerHTML = null
      Ti.Dom.appendTo($frame, $el)
    }
  },
  //--------------------------------------
  explainTiAlbum($div) {
    let $els = Ti.Dom.findAll(".ti-widget-album", $div);
    for(let $el of $els) {
      //
      // Get album setup by type
      //
      let setup = ({
        "album" : {
          attrPrefix : "wn-obj-",
          itemToPhoto : {
            name : "=title|nm",
            link : "#",
            src  : (obj)=>{
              return Ti.WWW.evalObjPreviewSrc(obj, {
                previewKey : "..",
                previewObj : "..",
                apiTmpl : this.apiTmpl,
                cdnTmpl : this.cdnTmpl,
                dftSrc : this.dftImgSrc
              })
            },
            brief : "=brief"
          }
        },
        "fb-album" : {
          attrPrefix : "wn-fb-",
          itemToPhoto : {
            name : "=name",
            link : "=link",
            src  : "=thumbSrc"  // "thumb_src" will be camelCase
          }
        },
        "yt-playlist" : {
          attrPrefix : "wn-ytpl-",
          itemToPhoto : {
            name : "=title",
            link : "->https://www.youtube.com/watch?v=${id}",
            src  : "=thumbUrl",
            brief : "=description",
          }
        }
      })[$el.getAttribute("ti-album-type") || "album"]
      //
      // Create widget
      //
      let AB = Ti.Widget.Album.getOrCreate($el, setup)
      
      // Redraw
      let items = AB.getItems()
      //console.log(items)
      AB.renderItems(items)
    }
  },
  //--------------------------------------
  redrawContent() {
    // Guard
    if(!_.isElement(this.$refs.main))
      return false;

    // Create fragment 
    let $div = Ti.Dom.createElement({
      tagName : "div"
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
    this.explainTiAlbum($div)

    // Update the article content
    this.$refs.main.innerHTML = $div.innerHTML

    return true
  }
  //--------------------------------------
}
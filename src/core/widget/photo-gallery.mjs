////////////////////////////////////////////////
/*
$el
|-- ...
|   |-- A @href
|   |   |-- IMG @src @src-large
--------------------------------
DIV.ti-widget-photo-gallery
|-- DIV.photo-gallery-con
|   |-- DIV.as-viewport
|   |   |-- DIV.as-scroller
|   |   |   |-- A.as-tile
|   |   |   |   |-- IMG
|   |   |   |   |-- HEADER
|   |-- DIV.as-indicator
|   |   |-- UL
|   |   |   |-- LI
|   |   |   |   |-- IMG
|   |-- DIV.as-switcher
|   |   |-- DIV.as-switcher-btn is-prev
|   |   |   |-- SPAN
|   |   |   |   |-- I.zmdi-chevron-left
|   |   |-- DIV.as-switcher-btn is-next
|   |   |   |-- SPAN
|   |   |   |   |-- I.zmdi-chevron-right
|   |-- DIV.as-closer
|   |   |-- SPAN
|   |   |   |-- I.zmdi-close
*/
////////////////////////////////////////////////
class TiPhotoGallery {
  //---------------------------------------
  constructor($el, setup) {
    this.currentIndex = 0;
    this.$doc = $el.ownerDocument
    this.$el = $el
    this.setup = _.assign({
      className : "ti-widget-photo-gallery",
      topStyle         : {},
      viewportStyle    : {},
      scrollerStyle    : {},
      tileStyle        : {},
      imgStyle         : {},
      indicatorStyle   : {},
      indicatorUlStyle : {},
      indicatorLiStyle : {},
      indicatorLiImgStyle : {},
      thumbKey : "src",
      largeKey : "src-large",
      titleKey : "title"
    }, setup)
    // live element, if shown, it will be a Element
    this.$top = null
  }
  //---------------------------------------
  getData() {
    let {thumbKey, largeKey, titleKey} = this.setup
    let list = []
    let $imgs = Ti.Dom.findAll('img[src]', this.$el)
    for(let $img of $imgs) {
      let srcThumb = $img.getAttribute(thumbKey)
      let srcLarge = $img.getAttribute(largeKey)
      let title = $img.getAttribute(titleKey)
      let link;
      let $link = Ti.Dom.closest($img, "a[href]")
      if($link) {
        link = $link.getAttribute("href")
        if("#" == link || "void(0)" == link) {
          link = undefined
        }
      }
      list.push({
        $img, $link,
        srcThumb, srcLarge, link, title,
        src : srcLarge || srcThumb
      })
    }
    return list
  }
  //---------------------------------------
  findPhotoIndex($img, data=this.data) {
    if(_.isArray(data)) {
      for(let i=0; i<data.length; i++) {
        let it = data[i]
        if(it.$img == $img || it.$link == $img) {
          return i
        }
      }
    }
    return -1
  }
  //---------------------------------------
  scrollToPrev() {
    console.log("scrollToPrev")
    if(this.currentIndex>0) {
      this.scrollTo(this.currentIndex-1)
    }
  }
  //---------------------------------------
  scrollToNext() {
    console.log("scrollToNext")
    if(this.currentIndex<(this.data.length-1)) {
      this.scrollTo(this.currentIndex+1)
    }
  }
  //---------------------------------------
  scrollTo(index=this.currentIndex) {
    this.resizePhotos(this.$scroller)
    //
    // Scroller left
    //
    let w = this.$viewport.clientWidth
    let I = index || 0
    this.currentIndex = I
    let left = w * this.currentIndex * -1
    this.$scroller.style.left = `${left}px`

    //
    // Current Image
    //
    let $img = Ti.Dom.find(`.as-tile[gallery-index="${I}"] img`, this.$scroller)
    if($img) {
      let srcLarge = $img.getAttribute("src-large")
      if(srcLarge) {
        Ti.Dom.setAttrs($img, {src: srcLarge})
      }
    }

    //
    // Current indicator
    //
    let $li = Ti.Dom.find(`li.is-current`, this.$indicatorUl)
    if($li) {
      Ti.Dom.removeClass($li, "is-current")
    }
    $li = Ti.Dom.find(`li[gallery-index="${I}"]`, this.$indicatorUl)
    if($li) {
      Ti.Dom.addClass($li, "is-current")
    }
    

    //
    // Switcher btn
    //
    if(0 == this.currentIndex) {
      Ti.Dom.addClass(this.$top, "no-prev")
    } else {
      Ti.Dom.removeClass(this.$top, "no-prev")
    }
    if(this.currentIndex >= (this.data.length-1)) {
      Ti.Dom.addClass(this.$top, "no-next")
    } else {
      Ti.Dom.removeClass(this.$top, "no-next")
    }
  }
  //---------------------------------------
  resizePhotos($div=this.$scroller) {
    // Get the viewport width
    let w = this.$viewport.clientWidth
    let h = this.$viewport.clientHeight
    let tileW = `${w}px`
    let tileH = `${h}px`

    // Setup Each tile
    let $tiles = Ti.Dom.findAll(".as-tile", $div)
    for(let $tile of $tiles) {
      $tile.style.width  = tileW
      $tile.style.height = tileH
    }
  }
  //---------------------------------------
  renderPhotos(data=this.data) {
    let {
      tileStyle, imgStyle, 
      indicatorLiStyle, indicatorLiImgStyle
    } = this.setup
    let $div = Ti.Dom.createElement({
      tagName : "div"
    })
    let $ul = Ti.Dom.createElement({
      tagName : "ul"
    })
    if(_.isArray(data)) {
      let i=0;
      for(let it of data) {
        let index = i++
        //
        // Create Tile
        //
        let $an = Ti.Dom.createElement({
          $p: $div,
          tagName: "a",
          className : "as-tile",
          style : tileStyle,
          attrs: {
            galleryIndex: index,
            href: it.link,
            target: "_blank"
          }
        })
        // Image
        Ti.Dom.createElement({
          $p: $an,
          tagName: "img",
          style: imgStyle,
          attrs: {
            src: it.srcThumb,
            srcLarge: it.srcLarge
          }
        })
        // TITLE
        if(it.title) {
          Ti.Dom.createElement({
            $p: $an,
            tagName : "header"
          }).innerText = it.title.replace(/\r?\n/g, " ")
        }
        //
        // Create indicator
        //
        let $li = Ti.Dom.createElement({
          $p: $ul,
          tagName: "li",
          style: indicatorLiStyle,
          attrs : {
            galleryIndex: index
          }
        })
        Ti.Dom.createElement({
          $p: $li,
          tagName: "img",
          style: indicatorLiImgStyle,
          attrs: {
            src: it.srcThumb
          }
        })
      }
    }
    this.currentIndex = 0;
    this.$scroller.innerHTML = $div.innerHTML
    this.$indicatorUl.innerHTML = $ul.innerHTML
    this.resizePhotos()
  }
  //---------------------------------------
  redraw() {
    // Guard
    if(this.$top) {
      return
    }
    //......................................
    // Create top
    let {
      className, topStyle, viewportStyle, scrollerStyle,
      indicatorStyle, indicatorUlStyle
    } = this.setup
    this.$top = Ti.Dom.createElement({
      tagName : "div",
      className : className || "ti-widget-photo-gallery",
      style : topStyle
    })
    Ti.Dom.addClass(this.$top, "no-ready")
    //......................................
    this.$con = Ti.Dom.createElement({
      $p : this.$top,
      tagName : "div",
      className : "photo-gallery-con"
    })
    //......................................
    // Create viewport
    this.$viewport = Ti.Dom.createElement({
      $p : this.$con,
      tagName : "div",
      className : "as-viewport",
      style : viewportStyle
    })
    this.$scroller = Ti.Dom.createElement({
      $p : this.$viewport,
      tagName : "div",
      className : "as-scroller",
      style : scrollerStyle
    })
    //......................................
    // Create indicator
    this.$indicator = Ti.Dom.createElement({
      $p : this.$con,
      tagName : "div",
      className : "as-indicator",
      style : indicatorStyle
    })
    //......................................
    this.$indicatorUl = Ti.Dom.createElement({
      $p: this.$indicator,
      tagName: "ul",
      style: indicatorUlStyle
    })
    //......................................
    // Create switcher
    this.$switcher = Ti.Dom.createElement({
      $p : this.$con,
      tagName : "div",
      className : "as-switcher"
    })
    //......................................
    this.$btnPrev = Ti.Dom.createElement({
      $p : this.$switcher,
      tagName : "div",
      className : "as-switcher-btn is-prev"
    })
    this.$btnPrev.innerHTML = `<span><i class="zmdi zmdi-chevron-left"></i></span>`
    //......................................
    this.$btnNext = Ti.Dom.createElement({
      $p : this.$switcher,
      tagName : "div",
      className : "as-switcher-btn is-next"
    })
    this.$btnNext.innerHTML = `<span><i class="zmdi zmdi-chevron-right"></i></span>`
    //......................................
    // Create closer
    this.$closer = Ti.Dom.createElement({
      $p : this.$con,
      tagName : "div",
      className : "as-closer"
    })
    this.$closer.innerHTML = `<span><i class="zmdi zmdi-close"></i></span>`
    //......................................
    // Append to DOM
    Ti.Dom.appendTo(this.$top, this.$doc.body)
    //......................................
    // Get the data
    this.data = this.getData()
    //......................................
    // Render photos
    this.renderPhotos()
    //......................................
    // Bind Events
    this.$closer.addEventListener("click", ()=>this.close())
    //
    // Switch
    //
    Ti.Dom.find('span', this.$btnPrev).addEventListener("click", ()=>{
      this.scrollToPrev()
    })
    Ti.Dom.find('span', this.$btnNext).addEventListener("click", ()=>{
      this.scrollToNext()
    })
    //
    // Indicator
    //
    this.$indicator.addEventListener("click", ({srcElement})=>{
      let $tile = Ti.Dom.closest(srcElement, "[gallery-index]")
      if($tile) {
        let index = $tile.getAttribute("gallery-index") * 1
        if(index >= 0) {
          this.scrollTo(index)
        }
      }
    })
    //
    // Resize
    //
    let PG = this
    this.OnResize = function() {
      Ti.Dom.addClass(PG.$top, "is-resizing")
      PG.resizePhotos()
      PG.scrollTo()
      _.delay(()=>{
        Ti.Dom.removeClass(PG.$top, "is-resizing")
      }, 100)
    }
    this.$doc.defaultView.addEventListener("resize", this.OnResize)
    //......................................
    // render wrapper
    _.delay(()=>{
      Ti.Dom.removeClass(this.$top, "no-ready")
      Ti.Dom.addClass(this.$top, "is-ready")
    })
  }
  //---------------------------------------
  close() {
    if(this.$top) {
      this.$top.addEventListener("transitionend", ()=>{
        Ti.Dom.remove(this.$top)
        this.$top = null
      }, {once: true})
      Ti.Dom.removeClass(this.$top, "is-ready");
      Ti.Dom.addClass(this.$top, "no-ready");
      this.$doc.defaultView.removeEventListener("resize", this.OnResize)
    }
  }
  //---------------------------------------
}
////////////////////////////////////////////////
export const PhotoGallery = { 
  //---------------------------------------
  bind($el, setup={}) {
    if(!$el.__ti_photo_gallery) {
      // Create instance
      let PG = new TiPhotoGallery($el, setup)
      // listen events trigger
      $el.addEventListener("click", function(evt) {
        //console.log(evt, "Photo gallery", this, evt.srcElement)
        evt.preventDefault()
        evt.stopPropagation()
        PG.redraw()
        // Find photo index
        let $img = evt.srcElement
        PG.currentIndex = Math.max(0, PG.findPhotoIndex($img))
        PG.scrollTo()
      }, true)
      // bind the host element for multi-binding prevention.
      $el.__ti_photo_gallery = PG
    }
    return $el.__ti_photo_gallery
  },
  //---------------------------------------
}

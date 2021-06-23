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
|   |   |   |-- DIV.as-tile
|   |   |   |   |-- IMG
|   |   |   |   |-- HEADER
|   |   |-- DIV.as-opener
|   |   |   |-- A.href = Current.Link
|   |   |   |   |-- I.zmdi-open-in-new
|   |   |-- DIV.as-toolbar
|   |   |   |-- A.as-zoom-in
|   |   |   |   |-- I.zmdi-zoom-in
|   |   |   |-- A.as-zoom-out
|   |   |   |   |-- I.zmdi-zoom-out
|   |-- DIV.as-indicator
|   |   |-- DIV.as-indi-con
|   |   |   |-- UL
|   |   |   |   |-- A
|   |   |   |   |   |-- IMG
|   |   |-- DIV.as-indi-btn to-prev
|   |   |-- DIV.as-indi-btn to-next
|   |-- DIV.as-switcher
|   |   |-- DIV.as-switcher-btn is-prev
|   |   |   |-- SPAN
|   |   |   |   |-- I.zmdi-chevron-left
|   |   |-- DIV.as-switcher-btn is-next
|   |   |   |-- SPAN
|   |   |   |   |-- I.zmdi-chevron-right
|   |-- DIV.as-closer
|   |   |-- A
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
      indicatorItStyle : {},
      indicatorItImgStyle : {},
      thumbKey : "src",
      largeKey : "src-large",
      titleKey : "title",
      zoomStep : -0.1
    }, setup)
    // live element, if shown, it will be a Element
    this.$top = null
    // Current zoom level
    this.zoomScale = 1
    this.translateX = 0
    this.translateY = 0
  }
  //---------------------------------------
  getData() {
    let {thumbKey, largeKey, titleKey} = this.setup
    let list = []
    let $imgs = Ti.Dom.findAll('img[src]', this.$el)
    //console.log(`getData in ${$imgs.length} image elements`)
    for(let $img of $imgs) {
      let srcThumb = $img.getAttribute(thumbKey)
      let srcLarge = $img.getAttribute(largeKey)
      let title = $img.getAttribute(titleKey)
      let link;
      //console.log("before cloest")
      let $link = Ti.Dom.closest($img, "a[href]")
      //let $link = $($img).closest("a[href]")[0]
      //console.log("after cloest", $link)
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
    //console.log("get list data", list.length)
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
    //console.log("scrollToPrev")
    if(this.currentIndex>0) {
      this.scrollTo(this.currentIndex-1)
    }
  }
  //---------------------------------------
  scrollToNext() {
    //console.log("scrollToNext")
    if(this.currentIndex<(this.data.length-1)) {
      this.scrollTo(this.currentIndex+1)
    }
  }
  //---------------------------------------
  scrollTo(index=this.currentIndex) {
    let {imgStyle} = this.setup
    this.resizePhotos(this.$scroller)
    this.zoomScale = 1
    this.translateX = 0
    this.translateY = 0
    this.applyImageTransform()
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
    let $tile = this.getImageTile(I)
    if($tile) {
      if("yes" == $tile.getAttribute("img-nil")) {
        // Render image
        let srcThumb = $tile.getAttribute("src-thumb")
        let $nil = Ti.Dom.find("span", $tile)
        if($nil) {
          Ti.Dom.updateStyle($nil, {
            "backgroundImage": `url(${srcThumb})`
          })
        }
        let srcLarge = $tile.getAttribute("src-large")
        //$tile.innerHTML = ""
        let $img = Ti.Dom.createElement({
          $p: $tile,
          tagName: "img",
          style: imgStyle,
          attrs: {
            src: srcLarge
          }
        })
        $img.addEventListener("load", ()=>{
          $tile.removeAttribute("img-nil")
          $tile.setAttribute("img-loaded", "yes")
        }, {once:true})
        // Update href
        if(_.isElement(this.$opener)) {
          let href = _.trim($tile.getAttribute("href")) || null
          Ti.Dom.setAttrs(this.$opener, {href})
        }
      }
    }
    this.$currentImg = Ti.Dom.find("img", $tile)

    //
    // Current indicator
    //
    let $li = Ti.Dom.find(`a.is-current`, this.$indicatorUl)
    if($li) {
      Ti.Dom.removeClass($li, "is-current")
    }
    $li = Ti.Dom.find(`a[gallery-index="${I}"]`, this.$indicatorUl)
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
      Ti.Dom.addClass(this.$scroller, "no-next")
    } else {
      Ti.Dom.removeClass(this.$scroller, "no-next")
    }
  }
  //---------------------------------------
  scrollIndicatorToPage(direction=-1) {
    let left = Ti.Css.toPixel(this.$indicatorUl.style.left||0)
    let width = this.$indicatorCon.clientWidth
    this.scrollIndicatorTo(left + width * direction)
  }
  //---------------------------------------
  scrollIndicatorTo(x=0) {
    let minLeft = this.$indicatorCon.clientWidth - this.$indicatorCon.scrollWidth;
    let maxLeft = 0
    //console.log({minLeft, maxLeft})
    let left = _.clamp(x, minLeft, maxLeft)
    this.$indicatorUl.style.left = `${left}px`
  }
  //---------------------------------------
  getImageTile(index=this.currentIndex) {
    return Ti.Dom.find(`.as-tile[gallery-index="${index}"]`, this.$scroller)
  }
  //---------------------------------------
  applyImageTransform() {
    let css = {
      transform: this.zoomScale!=1 ? `scale(${this.zoomScale})` : "",
      left : this.translateX ? `${this.translateX}px` : "",
      top  : this.translateY ? `${this.translateY}px` : "",
    }
    Ti.Dom.updateStyle(this.$currentImg, css)
  }
  //---------------------------------------
  changeZoomScale(delta) {
    // Zoom in
    if(delta > 0) {
      this.zoomScale += (this.zoomScale * this.setup.zoomStep)
    }
    // Zoom out
    else if(delta<0) {
      this.zoomScale -= (this.zoomScale * this.setup.zoomStep)
      this.zoomScale = Math.max(0, this.zoomScale)
    }
    this.applyImageTransform()
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

    // The indicator overview
    let indi = this.$indicatorCon
    if(indi.scrollWidth > indi.clientWidth) {
      this.$indicator.setAttribute("item-overflow", "yes")
    } else {
      this.$indicator.removeAttribute("item-overflow")
    }
    
    // Only load photo image in indicator viewport
    this.renderClipIndicatorPhotos()
  }
  //---------------------------------------
  renderClipIndicatorPhotos() {
    let {indicatorItImgStyle} = this.setup
    let conRect = Ti.Rects.createBy(this.$indicatorCon)
    let $list = Ti.Dom.findAll("a[img-nil]", this.$indicatorUl)
    //console.log("viewport:", conRect.toString(), "find img-nil:", $list.length)
    for(let i=0; i<$list.length; i++) {
      let $li = $list[i]
      let liRect = Ti.Rects.createBy($li)
      //console.log(i, liRect.toString())
      if(conRect.isOverlap(liRect)) {
        let src = $li.getAttribute("src-thumb")
        $li.innerHTML = ""
        $li.removeAttribute("img-nil")
        Ti.Dom.createElement({
          $p: $li,
          tagName: "img",
          style: indicatorItImgStyle,
          attrs: {
            src
          }
        })
      }
    }
  }
  //---------------------------------------
  renderPhotos(data=this.data) {
    let {tileStyle, indicatorItStyle} = this.setup
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
          tagName: "div",
          className : "as-tile",
          style : tileStyle,
          attrs: {
            galleryIndex: index,
            href: it.link,
            target: "_blank",
            srcThumb: it.srcThumb,
            srcLarge: it.srcLarge,
            imgNil: "yes"
          }
        })
        // Image Placeholder
        let $nil = Ti.Dom.createElement({
          $p: $an,
          tagName: "span",
          className: "nil-img"
        })
        $nil.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`
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
          tagName: "a",
          style: indicatorItStyle,
          attrs : {
            href: `javascript:void(${index})`,
            galleryIndex: index,
            srcThumb: it.srcThumb,
            imgNil: "yes"
          }
        })
        Ti.Dom.createElement({
          $p: $li,
          tagName: "span",
          className: "nil-img"
        })
      }
    }
    this.currentIndex = 0;
    //console.log("before set InnerHTML")
    this.$scroller.innerHTML = $div.innerHTML
    this.$indicatorUl.innerHTML = $ul.innerHTML
    //console.log("after set InnerHTML")
    this.resizePhotos()
    //console.log("after resize")
  }
  //---------------------------------------
  redraw() {
    // Guard
    if(this.$top) {
      return
    }
    //......................................
    // Create top
    //console.log("enter redraw")
    let {
      className, topStyle, viewportStyle, scrollerStyle,
      indicatorStyle, indicatorUlStyle,
      showOpener
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
    //......................................
    this.$scroller = Ti.Dom.createElement({
      $p : this.$viewport,
      tagName : "div",
      className : "as-scroller",
      style : scrollerStyle
    })
    //......................................
    if(showOpener) {
      this.$opener = Ti.Dom.createElement({
        $p : this.$viewport,
        tagName : "a",
        className : "as-opener",
        attrs: {
          target: "_blank"
        }
      })
      this.$opener.innerHTML = `<i class="zmdi zmdi-open-in-new"></i>`
    }
    //......................................
    this.$toolbar = Ti.Dom.createElement({
      $p : this.$viewport,
      tagName : "div",
      className : "as-toolbar"
    })
    //......................................
    this.$zoomIn = Ti.Dom.createElement({
      $p : this.$toolbar,
      tagName : "a",
      className : "as-zoom-in",
      attrs: {
        href: "javascript:void(0)"
      }
    })
    this.$zoomIn.innerHTML = `<i class="fas fa-search-plus"></i>`
    //......................................
    this.$zoomOut = Ti.Dom.createElement({
      $p : this.$toolbar,
      tagName : "a",
      className : "as-zoom-out",
      attrs: {
        href: "javascript:void(0)"
      }
    })
    this.$zoomOut.innerHTML = `<i class="fas fa-search-minus"></i>`
    //......................................
    // Create indicator
    this.$indicator = Ti.Dom.createElement({
      $p : this.$con,
      tagName : "div",
      className : "as-indicator",
      style : indicatorStyle
    })
    //......................................
    // Create indicator
    this.$indicatorCon = Ti.Dom.createElement({
      $p : this.$indicator,
      tagName : "div",
      className : "as-indi-con"
    })
    //......................................
    this.$indicatorUl = Ti.Dom.createElement({
      $p: this.$indicatorCon,
      tagName: "ul",
      style: _.assign({left:0}, indicatorUlStyle)
    })
    //......................................
    this.$indiBtnToPrev = Ti.Dom.createElement({
      $p: this.$indicator,
      tagName: "div",
      className: "as-indi-btn to-prev"
    })
    this.$indiBtnToPrev.innerHTML = `<span><i class="fas fa-chevron-left"></i></span>`
    //......................................
    this.$indiBtnToNext = Ti.Dom.createElement({
      $p: this.$indicator,
      tagName: "div",
      className: "as-indi-btn to-next"
    })
    this.$indiBtnToNext.innerHTML = `<span><i class="fas fa-chevron-right"></i></span>`
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
    this.$closer.innerHTML = `<a href="javascript:void(0)"><i class="zmdi zmdi-close"></i></a>`
    //......................................
    // Append to DOM
    Ti.Dom.appendTo(this.$top, this.$doc.body)
    
    //......................................
    // Get the data
    //console.log("get data")
    this.data = this.getData()
    
    //......................................
    // Render photos
    //console.log("renderPhotos")
    this.renderPhotos()
    
    //......................................
    // Bind Events
    //console.log("bind event")
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
      //console.log("hahahah")
      // Scroll to photo
      let $tile = Ti.Dom.closest(srcElement, "[gallery-index]")
      if($tile) {
        let index = $tile.getAttribute("gallery-index") * 1
        if(index >= 0) {
          this.scrollTo(index)
        }
        return
      }
      // Scroll indicator UL
      let $btn = Ti.Dom.closest(srcElement, ".as-indi-btn")
      if($btn) {
        let direction = Ti.Dom.hasClass($btn, "to-prev") ? 1 : -1
        this.scrollIndicatorToPage(direction)
      }
    })
    //
    // Resize
    //
    let PG = this
    //console.log("Resize")
    //......................................
    this.OnResize = function() {
      Ti.Dom.addClass(PG.$top, "is-resizing")
      PG.resizePhotos()
      PG.scrollTo()
      _.delay(()=>{
        Ti.Dom.removeClass(PG.$top, "is-resizing")
      }, 100)
    }
    //......................................
    this.OnWheel = function(evt) {
      //let {deltaMode, deltaX, deltaY, deltaZ} = evt
      //console.log("wheel", {mode:deltaMode,x:deltaX,y:deltaY,z:deltaZ})
      evt.preventDefault()
      evt.stopPropagation()
      this.changeZoomScale(evt.deltaY)
    }
    //......................................
    // render wrapper
    //_.delay(()=>{
      Ti.Dom.removeClass(this.$top, "no-ready")
      Ti.Dom.addClass(this.$top, "is-ready")
    //}, 0)
  }
  //---------------------------------------
  watchEvents() {
    this.$doc.defaultView.addEventListener("resize", this.OnResize, true)
    this.$top.onwheel = (evt)=>{this.OnWheel(evt)}
    this.$top.ondblclick = (evt)=>{
      if(Ti.Dom.closest(evt.srcElement, ".as-toolbar")) {
        return
      }
      this.zoomScale = 1
      this.translateX = 0
      this.translateY = 0
      this.applyImageTransform()
    }
    this.$zoomIn.onclick = (evt)=>{
      evt.stopPropagation()
      this.changeZoomScale(-1)
    }
    this.$zoomOut.onclick = (evt)=>{
      evt.stopPropagation()
      this.changeZoomScale(1)
    }
    this.$indicatorUl.addEventListener("transitionend", _.debounce(()=>{
      this.renderClipIndicatorPhotos()
    }, 500))
    if("desktop" == this.$doc.documentElement.getAttribute("as")) {
      Ti.Be.Draggable(this.$top, {
        prepare: (drg)=>{
          drg.$event.preventDefault()
          drg._x = this.translateX
          drg._y = this.translateY
        },
        actived: ()=>{
          Ti.Dom.addClass(this.$scroller, "is-moving")
        },
        dragging: ({_x,_y,offsetX, offsetY})=>{
          this.translateX = _x + offsetX
          this.translateY = _y + offsetY
          this.applyImageTransform()
        },
        done: ()=>{
          Ti.Dom.removeClass(this.$scroller, "is-moving")
        }
      })
    }
  }
  //---------------------------------------
  unwatchEvents() {
    this.$doc.defaultView.removeEventListener("resize", this.OnResize, true)
  }
  //---------------------------------------
  close() {
    if(_.isFunction(this.setup.onBeforeClose)) {
      this.setup.onBeforeClose()
    }
    if(this.$top) {
      this.$top.addEventListener("transitionend", ()=>{
        Ti.Dom.remove(this.$top)
        this.$top = null
        if(_.isFunction(this.setup.onClosed)) {
          this.setup.onClosed()
        }
      }, {once: true})
      Ti.Dom.removeClass(this.$top, "is-ready");
      Ti.Dom.addClass(this.$top, "no-ready");
      
      this.unwatchEvents()
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
      //console.log("PhotoGallery bind click")
      $el.addEventListener("click", function(evt) {
        //console.log(evt, "Photo gallery", this, evt.srcElement)
        evt.preventDefault()
        evt.stopPropagation()
        //console.log("PG.redraw() >>>>>>>>>>>>")
        PG.redraw()
        PG.watchEvents()
        //console.log("<<<<<<<<<<<<<<<<< PG.redraw()")
        // Find photo index
        let $img = evt.srcElement
        PG.currentIndex = Math.max(0, PG.findPhotoIndex($img))
        //console.log("findPhotoIndex", PG.currentIndex)
        PG.scrollTo()
        //console.log("PG.scrollTo()")
      }, true)
      // bind the host element for multi-binding prevention.
      $el.__ti_photo_gallery = PG
    }
    return $el.__ti_photo_gallery
  },
  //---------------------------------------
}

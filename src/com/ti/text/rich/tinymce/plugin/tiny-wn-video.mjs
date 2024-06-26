////////////////////////////////////////////////////
async function pickVideoAndInsertToDoc(editor, {
  base = "~",
  autoCreate = null,
  fallbackPath,
}) {
  // Check base
  if (_.isPlainObject(autoCreate)) {
    let oBase = await Wn.Io.loadMeta(base)
    if (!oBase) {
      let pph = Ti.Util.getParentPath(base)
      let dnm = Ti.Util.getFileName(base)
      let baseMeta = _.assign({}, autoCreate, {
        race: 'DIR', nm: dnm
      })
      let baseJson = JSON.stringify(baseMeta)
      let cmdText = `o @create '${baseJson}' -p ${pph} -auto @json -cqn`
      oBase = await Wn.Sys.exec2(cmdText, { as: "json" })
    }
    base = oBase
  }

  // Show dialog
  let reo = await Wn.OpenObjSelector(base, {
    icon: "fas-film",
    title: "i18n:video-insert",
    position: "top",
    width: "95%",
    height: "95%",
    multi: false,
    fallbackPath
  })

  // User canceled
  if (_.isEmpty(reo)) {
    return
  }

  // Do insert image
  editor.execCommand("InsertVideo", editor, reo)
}
////////////////////////////////////////////////////
function GetVideoAttrsByElement(elVideo) {
  let style = Ti.Dom.getOwnStyle(elVideo)
  return {
    oid: elVideo.getAttribute("wn-obj-id"),
    sha1: elVideo.getAttribute("wn-obj-sha1"),
    mime: elVideo.getAttribute("wn-obj-mime"),
    tp: elVideo.getAttribute("wn-obj-tp"),
    thumb: elVideo.getAttribute("wn-obj-thumb"),
    video_cover: elVideo.getAttribute("wn-obj-video_cover"),
    naturalWidth: elVideo.getAttribute("wn-obj-width"),
    naturalHeight: elVideo.getAttribute("wn-obj-height"),
    duration: elVideo.getAttribute("wn-obj-duration"),
    rawSize: elVideo.getAttribute("wn-raw-size"),
    style
  }
}
////////////////////////////////////////////////////
function GetVideoAttrsByObj(oVideo) {
  return _.pickBy({
    "wn-obj-id": oVideo.id,
    "wn-obj-sha1": oVideo.sha1,
    "wn-obj-mime": oVideo.mime,
    "wn-obj-tp": oVideo.tp,
    "wn-obj-thumb": oVideo.thumb,
    "wn-obj-video_cover": oVideo.video_cover,
    "wn-obj-width": oVideo.width,
    "wn-obj-height": oVideo.height,
    "wn-obj-duration": oVideo.duration,
    "wn-raw-size": oVideo.rawSize,
  }, (v) => !_.isUndefined(v))
}
////////////////////////////////////////////////////
function UpdateVideoTagInnerHtml(elVideo) {
  let cover = elVideo.getAttribute("wn-obj-video_cover")
  if (!cover) {
    cover = elVideo.getAttribute("wn-obj-thumb")
  }
  if (cover && !cover.startsWith("id:")) {
    cover = "id:" + cover
  }
  let $inner = Ti.Dom.createElement({
    tagName: "div",
    className: "media-inner",
    style: {
      "background-image": `url("/o/content?str=${cover}")`
    }
  })
  $inner.innerHTML = `<i 
    class="media-font-icon zmdi zmdi-play"
    style="padding-left:.06rem;"></i>`
  elVideo.innerHTML = null
  elVideo.contentEditable = false
  Ti.Dom.appendTo($inner, elVideo)
}
////////////////////////////////////////////////////
function CmdInsertVideo(editor, oVideos) {
  if (_.isEmpty(oVideos))
    return

  // Prepare range
  let rng = editor.selection.getRng()

  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let frag = new DocumentFragment()
  for (let oVideo of oVideos) {
    let $video = Ti.Dom.createElement({
      tagName: "div",
      className: "wn-media as-video",
      attrs: GetVideoAttrsByObj(oVideo)
    }, $doc)
    UpdateVideoTagInnerHtml($video)
    frag.appendChild($video)
  }

  // Remove content
  if (!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode(frag)

}
////////////////////////////////////////////////////
function GetCurrentVideoElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el) => {
    return 'DIV' == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-video")
  }, { includeSelf: true })
}
///////////////////////////////////////////////////
function CmdSetVideoStyle(editor, css = {}) {
  let $video = GetCurrentVideoElement(editor)
  // Guard
  if (!_.isElement($video)) {
    return
  }
  // Clear float
  Ti.Dom.setStyle($video, css)
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
async function CmdShowVideoProp(editor, settings) {
  let $video = GetCurrentVideoElement(editor)
  // Guard
  if (!_.isElement($video)) {
    return
  }
  //console.log("stl", stl)
  // Gen the properties
  let data = GetVideoAttrsByElement($video)

  //console.log(data)
  // Show dialog
  let reo = await Ti.App.Open({
    icon: "fas-film",
    title: "i18n:hmk-w-edit-video-prop",
    width: "37%",
    height: "100%",
    position: "right",
    closer: "left",
    clickMaskToClose: true,
    result: data,
    model: { prop: "data", event: "change" },
    comType: "TiForm",
    comConf: {
      spacing: "comfy",
      fieldNameVAlign: "top",
      fields: [
        {
          title: "i18n:video",
          name: "oid",
          rowSpan: 3,
          comType: "WnObjPicker",
          comConf: {
            valueType: "id",
            base: settings.base,
            titleEditable: false
          }
        },
        Wn.Hm.getCssPropField("width", {
          name: "style.width",
          comConf: {
            placeholder: `${data.naturalWidth}px`
          }
        }),
        Wn.Hm.getCssPropField("height", {
          name: "style.height",
          comConf: {
            placeholder: `${data.naturalHeight}px`
          }
        }),
        Wn.Hm.getCssPropField("float", {
          name: "style.float"
        }),
        {
          title: "Raw Size",
          name: "rawSize",
          type: "String",
          defaultAs: 'auto',
          comType: "TiSwitcher",
          comConf: {
            options: ['auto', 'off']
          }
        },
        {
          title: "i18n:style-more",
        },
        {
          name: "style",
          type: "Object",
          colSpan: 10,
          comType: "HmPropCssRules",
          comConf: {
            rules: [
              /^((min|max)-)?(width|height)$/,
              /^(margin|border|box-shadow|float)$/
            ]
          }
        }
      ]
    },
    components: [
      "@com:wn/obj/picker"
    ]
  })

  // 用户取消
  if (!reo)
    return

  // Update image
  //................................................
  // src
  if (data.oid != reo.oid) {
    // Remove Video
    if (!reo.oid) {
      Ti.Dom.remove($video)
      return
    }
    // 读取对象详情
    let oVideo = await Wn.Io.loadMetaById(reo.oid)
    // Switch image src
    let attrs = GetVideoAttrsByObj(oVideo)
    Ti.Dom.setAttrs($video, attrs)

    UpdateVideoTagInnerHtml($video)

  }
  let attrs = GetVideoAttrsByObj(reo)
  console.log(attrs)
  Ti.Dom.setAttrs($video, attrs)
  //................................................
  // Styling
  let style = Ti.Css.renderCssRule(reo.style)
  //console.log("style:", style)
  $video.style = style
  //................................................
  // clean cache
  $video.removeAttribute("data-mce-src")
  $video.removeAttribute("data-mce-style")
  //................................................
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
export default {
  name: "wn-video",
  //------------------------------------------------
  init: function (conf = {}) {
  },
  //------------------------------------------------
  setup: function (editor, url) {
    //..............................................
    let settings = _.assign({
      base: "~"
    }, _.get(editor.settings, "wn_video_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Register plugin command
    editor.addCommand("InsertVideo", CmdInsertVideo)
    editor.addCommand("SetVideoStyle", CmdSetVideoStyle)
    editor.addCommand("ShowVideoProp", CmdShowVideoProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnVideoPick", {
      icon: "film-solid",
      tooltip: Ti.I18n.text("i18n:video-insert"),
      onAction: function (menuBtn) {
        pickVideoAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnVideoClrSize", {
      text: Ti.I18n.text("i18n:hmk-w-edit-video-clrsz"),
      onAction() {
        editor.execCommand("SetVideoStyle", editor, { width: "" })
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnVideoAutoFitWidth", {
      text: Ti.I18n.text("i18n:hmk-autofit"),
      onAction() {
        editor.execCommand("SetVideoStyle", editor, { width: "100%" })
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnVideoFloat', {
      text: Ti.I18n.text("i18n:hmk-float"),
      getSubmenuItems: function () {
        return [{
          type: "menuitem",
          icon: "align-left",
          text: Ti.I18n.text("i18n:hmk-float-left"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { float: "left" })
          }
        }, {
          type: "menuitem",
          icon: "align-right",
          text: Ti.I18n.text("i18n:hmk-float-right"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { float: "right" })
          }
        }, {
          type: "menuitem",
          text: Ti.I18n.text("i18n:hmk-float-clear"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { float: "" })
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnVideoMargin', {
      text: Ti.I18n.text("i18n:hmk-w-edit-video-margin"),
      getSubmenuItems: function () {
        const __check_margin_size = function (api, expectSize) {
          let $video = GetCurrentVideoElement(editor)
          let state = true
          if ($video) {
            let sz = $video.style.marginLeft || $video.style.marginRight
            state = expectSize == sz
          }
          api.setActive(state);
          return function () { };
        }
        return [{
          type: "togglemenuitem",
          text: Ti.I18n.text("i18n:hmk-margin-sm"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { margin: "1em" })
          },
          onSetup: function (api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type: "togglemenuitem",
          text: Ti.I18n.text("i18n:hmk-margin-md"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { margin: "2em" })
          },
          onSetup: function (api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type: "togglemenuitem",
          text: Ti.I18n.text("i18n:hmk-margin-lg"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { margin: "3em" })
          },
          onSetup: function (api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type: "menuitem",
          icon: "align-center",
          text: Ti.I18n.text("i18n:hmk-margin-center"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { margin: "0 auto" })
          }
        }, {
          type: "menuitem",
          icon: "square-6",
          text: Ti.I18n.text("i18n:hmk-margin-no"),
          onAction() {
            editor.execCommand("SetVideoStyle", editor, { margin: "" })
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnVideoProp", {
      text: Ti.I18n.text("i18n:hmk-w-edit-video-prop"),
      onAction() {
        editor.execCommand("ShowVideoProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-video", {
      update: function (el) {
        let $video = GetCurrentVideoElement(editor)
        // Guard
        if (!_.isElement($video)) {
          return []
        }
        return [
          "WnVideoClrSize WnVideoAutoFitWidth",
          "WnVideoFloat WnVideoMargin",
          "WnVideoProp"
        ].join(" | ")
      }
    })
    //..............................................
    let $vm = editor.__rich_tinymce_com
    $vm.registerContentCallback("wn-video", function () {
      //console.log("SetContent video")
      let els = editor.$('.wn-media.as-video')
      for (let i = 0; i < els.length; i++) {
        let el = els[i]
        UpdateVideoTagInnerHtml(el)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return {
          name: 'Wn Video plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}
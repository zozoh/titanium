////////////////////////////////////////////////////
async function pickWebImageAndInsertToDoc(editor, {
  base = "~", 
  autoCreate=null, 
  fallbackPath,
}) {
  // Check base
  if(_.isPlainObject(autoCreate)) {
    let oBase = await Wn.Io.loadMeta(base)
    if(!oBase) {
      let pph = Ti.Util.getParentPath(base)
      let dnm = Ti.Util.getFileName(base)
      let baseMeta = _.assign({}, autoCreate, {
        race: 'DIR', nm : dnm
      })
      let baseJson = JSON.stringify(baseMeta)
      let cmdText = `o @create '${baseJson}' -p ${pph} -auto @json -cqn`
      oBase = await Wn.Sys.exec2(cmdText, {as:"json"})
    }
    base = oBase
  }

  // Show dialog
  let reo = await Wn.OpenObjSelector(base, {
    icon  : "fas-image",
    title : "i18n:img-insert",
    position : "top",
    width  : "95%",
    height : "95%",
    multi : false,
    fallbackPath
  })

  // User canceled
  if(_.isEmpty(reo)) {
    return
  }

  // Do insert image
  editor.execCommand("InsertWebImage", editor, reo)
}
////////////////////////////////////////////////////
function GetElContext(el) {
  if(_.isElement(el)) {
    let con = Ti.Dom.closest(el, p=>Ti.Dom.hasClass(p, "as-image-con"))
    if(!con) {
      return {
        con : el,
        img : el
      }
    }
    else {
      return {
        con : con,
        img : Ti.Dom.find("img", con),
        alt : Ti.Dom.find("span.as-img-alt", con),
      }
    }
  }
  return el
}
////////////////////////////////////////////////////
function GetWebImageDataByElement(elOrCtx) {
  let IMC = GetElContext(elOrCtx)
  let obj = Ti.Dom.attrs(IMC.img, name=>{
    let m = /^(wn-obj-)(.+)$/.exec(name)
    if(m) {
      return _.camelCase(m[2])
    }
  })
  obj.imgStyle = _.assign({}, 
    Ti.Dom.getOwnStyle(IMC.con), 
    Ti.Dom.getOwnStyle(IMC.img))
  obj.altStyle = Ti.Dom.getOwnStyle(IMC.alt)
  return obj
}
////////////////////////////////////////////////////
function FormatWebImageObjData(obj) {
  return _.pick(obj, 
    "id","sha1","title","mime","tp","width","height",
    "imgStyle", "altStyle")
}
////////////////////////////////////////////////////
const OUTER_STYLE_NAMES = [
  "margin", "float", "width", "height",
  "minWidth", "minHeight",
  "maxWidth", "maxHeight"
]
////////////////////////////////////////////////////
function UpdateWebImageStyle(editor, el, data) {
  let IMC = GetElContext(el)
  //console.log(IMC)
  if(data) {
    let attrs = FormatWebImageObjData(data)
    attrs.imgStyle = null
    attrs.altStyle = null
    Ti.Dom.setAttrs(IMC.img, attrs, "wn-obj-")
  } else {
    data = GetWebImageDataByElement(IMC)
  }
  //console.log(data)
  //............................................
  Ti.Dom.formatStyle(data.imgStyle)
  Ti.Dom.formatStyle(data.altStyle)
  //............................................
  let conStyle = _.pick(data.imgStyle, OUTER_STYLE_NAMES)
  let imgStyle = _.omit(data.imgStyle, OUTER_STYLE_NAMES)
  let altStyle = Ti.Dom.renderCssRule(data.altStyle)
  conStyle = Ti.Dom.renderCssRule(conStyle)
  imgStyle = Ti.Dom.renderCssRule(imgStyle)
  //............................................
  let {con, img, alt} = IMC
  //............................................
  // Wrap image by span
  if(con == img && "IMG" == con.tagName) {
    if(!Ti.Dom.closest(con, $con => Ti.Dom.hasClass($con, "as-image-con"))) {
      let $con = Ti.Dom.createElement({
        tagName : "a",
        className : "wn-media as-image-con"
      })
      Ti.Dom.wrap(con, $con)
      con = $con
    }
  }
  //............................................
  if(img) {
    img.style = imgStyle
    Ti.Dom.setAttrs(img, {
      "ti-resize-target" : null
    })
  }
  //............................................
  if(alt) {
    if(!data.title || Ti.S.isBlank(data.title)) {
      Ti.Dom.remove(alt)
    } else {
      alt.style = altStyle
      alt.innerText = data.title || ""
    }
  } else if(data.title && !Ti.S.isBlank(data.title)) {
    alt = Ti.Dom.createElement({
      $p : con,
      tagName : "span",
      className : "as-img-alt",
    })
    alt.style = altStyle
    alt.innerText = data.title || ""
  }
  //............................................
  if(con) {
    con.style = conStyle
    con.contentEditable = false
    Ti.Dom.setAttrs(con, {
      "ti-tinymce-obj-resizable" : "style"
    })
    // Update resize handler
    editor.__rich_tinymce_com.redrawResizeHandler(con)
  }
}
////////////////////////////////////////////////////
function CmdInsertWebImage(editor, oImgs) {
  if(_.isEmpty(oImgs))
    return
  
  // Prepare range
  let rng = editor.selection.getRng()
  
  // Create image fragments
  let $doc = rng.commonAncestorContainer.ownerDocument
  let frag = new DocumentFragment()
  for(let oImg of oImgs) {
    let $con = Ti.Dom.createElement({
      tagName : "a",
      className : "wn-media as-image-con"
    })
    $con.contentEditable = false
    let $img = Ti.Dom.createElement({
      $p : $con,
      tagName : "img",
      className : "wn-media as-image",
      attrs : {
        src : `/o/content?str=id:${oImg.id}`
      }
    }, $doc)
    Ti.Dom.setAttrs($img, FormatWebImageObjData(oImg), "wn-obj-")
    
    frag.appendChild($con)

    // Update style
    UpdateWebImageStyle(editor, $con)
  }
  
  // Remove content
  if(!rng.collapsed) {
    rng.deleteContents()
  }

  // Insert fragments
  rng.insertNode(frag)
}
////////////////////////////////////////////////////
function GetCurrentWebImageElement(editor) {
  let sel = editor.selection
  let $nd = sel.getNode()
  // Guard
  return Ti.Dom.closest($nd, (el)=>{
    if(Ti.Dom.hasClass(el, "wn-media", "as-image-con")) {
      return true
    }
    if("IMG" == el.tagName && Ti.Dom.hasClass(el, "wn-media", "as-image")) {
      return true
    }
  })
}
////////////////////////////////////////////////////
function CmdSetWebImageStyle(editor, css={}) {
  let $con = GetCurrentWebImageElement(editor)
  let IMC = GetElContext($con)
  // Guard
  if(!_.isElement($con)) {
    return
  }
  // Save to element
  let data = GetWebImageDataByElement(IMC)
  data.imgStyle = _.assign({}, data.imgStyle, css)
  UpdateWebImageStyle(editor, IMC, data)
  
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
async function CmdShowWebImageProp(editor, settings) {
  let $img = GetCurrentWebImageElement(editor)
  let IMC = GetElContext($img)
  // Guard
  if(!_.isElement($img)) {
    return
  }
  // Get margin style
  let stl = Ti.Dom.getStyle($img, /^(float|(margin-(left|right|top|bottom)))$/)
  stl.float = stl.float || "none"
  //console.log("stl", stl)
  // Gen the properties
  let data = GetWebImageDataByElement($img)
  //console.log(data)

  // Show dialog
  let reo = await Ti.App.Open({
    icon  : "fas-image",
    title : "编辑图片属性",
    width  : "37%",
    height : "100%",
    position : "right",
    closer : "left",
    clickMaskToClose : true,
    result : data,
    model : {prop:"data", event:"change"},
    comType : "TiForm",
    comConf : {
      onlyFields : false,
      spacing : "tiny",
      fields : [{
        title : "图片信息",
        fields: [{
            title : "图片",
            name  : "id",
            comType : "WnObjPicker",
            comConf : {
              valueType : "id",
              base : settings.base,
              titleEditable : false
            }
          }, {
            title : "i18n:title",
            name  : "title",
            comType : "TiInput",
            comConf : {
              placeholder : "请输入图片的标题"
            }
          }]
      }, {
        title : "样式外观",
        fields : [
          Wn.Hm.getCssPropField("margin",{name:"imgStyle.margin"}),
            Wn.Hm.getCssPropField("width",{name:"imgStyle.width"}),
            Wn.Hm.getCssPropField("height",{name:"imgStyle.height"}),
            Wn.Hm.getCssPropField("float",{name:"imgStyle.float"}),
            Wn.Hm.getCssPropField("object-fit",{name:"imgStyle.objectFit"}),
          ]
      }, {
        title : "高级样式",
        fields : [{
            title : "图片样式",
            name  : "imgStyle",
            type  : "Object",
            emptyAs : null,
            comType : "HmPropCssRules",
            comConf : {
              rules : "#IMG"
            }
          }, {
            title : "标题样式",
            name  : "altStyle",
            type  : "Object",
            emptyAs : null,
            comType : "HmPropCssRules",
            comConf : {
              rules : "#TEXT-BLOCK"
            }
          }]
        }]
    },
    components : [
      "@com:wn/obj/picker"
    ]
  })

  // 用户取消
  if(!reo)
    return

  // Update image
  //................................................
  // src
  if(data.id != reo.id) {
    // Remove Image
    if(!reo.id) {
      Ti.Dom.remove(IMC.con)
      return
    }
    // 读取对象详情
    let oImg = await Wn.Io.loadMetaById(reo.id)
    reo = FormatWebImageObjData(_.assign(reo, oImg))
    // Switch image src
    IMC.img.src = `/o/content?str=id:${reo.id}`
  }
  //................................................
  //console.log(reo)
  UpdateWebImageStyle(editor, IMC, reo)
  //................................................
  // clean cache
  IMC.con.removeAttribute("data-mce-style")
  IMC.img.removeAttribute("data-mce-src")
  IMC.img.removeAttribute("data-mce-style")
  //................................................
  // Force sync content
  editor.__rich_tinymce_com.syncContent()
}
////////////////////////////////////////////////////
export default {
  name : "wn-web-image",
  //------------------------------------------------
  init : function(conf={}) {
  },
  //------------------------------------------------
  setup : function(editor, url){
    //..............................................
    let settings = _.assign({
        base : "~"
      }, _.get(editor.settings, "wn_web_image_config"));
    //console.log("setup", editor.settings)
    //..............................................
    // Register plugin command
    editor.addCommand("InsertWebImage",   CmdInsertWebImage)
    editor.addCommand("SetWebImageStyle", CmdSetWebImageStyle)
    editor.addCommand("ShowWebImageProp", CmdShowWebImageProp)
    //..............................................
    // Register toolbar actions
    editor.ui.registry.addButton("WnWebImgPick", {
      icon : "image",
      tooltip : Ti.I18n.text("i18n:img-insert"),
      onAction : function(menuBtn) {
        pickWebImageAndInsertToDoc(editor, settings)
      },
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnWebImgClrSize", {
      icon : "edit-image",
      text : "清除图片尺寸",
      onAction() {
        editor.execCommand("SetWebImageStyle", editor, {
          width: "", height: "",
          minWidth: "", minHeight: "",
          maxWidth: "", maxHeight: ""
        })
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnWebImgAutoFitWidth", {
      text : "自动适应宽度",
      onAction() {
        editor.execCommand("SetWebImageStyle", editor, {
          width: "100%", height: "",
          margin: "",
          minWidth: "", minHeight: "",
          maxWidth: "", maxHeight: ""
        })
      }
    })
    //..............................................
    editor.ui.registry.addMenuItem("WnWebImgAutoScaleByWidth", {
      text : "恢复比例",
      onAction() {
        let $con = GetCurrentWebImageElement(editor)
        let IMC = GetElContext($con)
        let scale = IMC.img.naturalWidth  / IMC.img.naturalHeight
        let {width, height} = Ti.Rects.createBy(IMC.img)
        height = Math.round(width / scale)
        
        editor.execCommand("SetWebImageStyle", editor, {
          width, height,
          margin: "",
          minWidth: "", minHeight: "",
          maxWidth: "", maxHeight: ""
        })
      }
    })
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnWebImgFloat', {
      text: '文本绕图',
      getSubmenuItems: function () {
        return [{
          type : "menuitem",
          icon : "align-left",
          text : "居左绕图",
          onAction() {
            editor.execCommand("SetWebImageStyle", editor, {float:"left"})
          }
        }, {
          type : "menuitem",
          icon : "align-right",
          text : "居右绕图",
          onAction() {
            editor.execCommand("SetWebImageStyle", editor, {float:"right"})
          }
        }, {
          type : "menuitem",
          text : "清除浮动",
          onAction() {
            editor.execCommand("SetWebImageStyle", editor, {float:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addNestedMenuItem('WnWebImgMargin', {
      text: '图片边距',
      getSubmenuItems: function () {
        const __check_margin_size = function(api, expectSize) {
          let $img = GetCurrentWebImageElement(editor)
          let IMC = GetElContext($img)
          let state = true
          if(IMC.con) {
            state = (expectSize == IMC.con.style.margin)
          }
          api.setActive(state);
          return function() {};
        }
        return [{
          type : "togglemenuitem",
          text : "小边距",
          onAction() {
            editor.execCommand("SetWebImageStyle", editor, {margin:"1em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '1em')
          }
        }, {
          type : "togglemenuitem",
          text : "中等边距",
          onAction() {
            editor.execCommand("SetWebImageStyle", editor, {margin:"2em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '2em')
          }
        }, {
          type : "togglemenuitem",
          text : "较大边距",
          onAction() {
            editor.execCommand("SetWebImageStyle", editor, {margin:"3em"})
          },
          onSetup: function(api) {
            return __check_margin_size(api, '3em')
          }
        }, {
          type : "menuitem",
          text : "清除边距",
          onAction() {
            editor.execCommand("SetWebImageStyle", editor, {margin:""})
          }
        }];
      }
    });
    //..............................................
    editor.ui.registry.addMenuItem("WnWebImgProp", {
      text : "图片属性",
      onAction() {
        editor.execCommand("ShowWebImageProp", editor, settings)
      }
    })
    //..............................................
    editor.ui.registry.addContextMenu("wn-web-image", {
      update: function (el) {
        let sel = editor.selection
        let $nd = sel.getNode()
        let IMC = GetElContext($nd)
        if(IMC && IMC.img && IMC.img.hasAttribute("wn-obj-id")
          && "IMG" == IMC.img.tagName
          && Ti.Dom.hasClass(IMC.img, "wn-media", "as-image")) {
          return [
            "WnWebImgClrSize WnWebImgAutoFitWidth WnWebImgAutoScaleByWidth",
            "WnWebImgFloat WnWebImgMargin",
            "WnWebImgProp"
          ].join(" | ")
        }
        return []
      }
    })
    //..............................................
    editor.on("SetContent", function() {
      //console.log("SetContent image")
      let els = editor.$('img[wn-obj-mime]')
      for(let i=0; i<els.length; i++) {
        let el = els[i]
        UpdateWebImageStyle(editor, el)
      }
    })
    //..............................................
    return {
      getMetadata: function () {
        return  {
          name: 'Wn Web Image plugin',
          url: 'http://site0.cn'
        };
      }
    };
    //..............................................
  }
  //------------------------------------------------
}
////////////////////////////////////////////////////////
const BORDER = {
  title : "i18n:hmk-css-border",
  name : "border",
  comType : "ti-input"
};
//------------------------------------------------------
const BORDER_RADIUS = {
  title : "i18n:hmk-css-border-radius",
  name : "borderRadius",
  comType : "ti-input"
};
//------------------------------------------------------
const MARGIN = {
  title : "i18n:hmk-css-margin",
  name : "margin",
  comType : "ti-input"
};
//------------------------------------------------------
const PADDING = {
  title : "i18n:hmk-css-padding",
  name : "padding",
  comType : "ti-input"
};
//------------------------------------------------------
const BACKGROUND = {
  title : "i18n:hmk-css-background",
  name : "background",
  comType : "ti-input"
};
//------------------------------------------------------
const COLOR = {
  title : "i18n:hmk-css-color",
  name : "color",
  comType : "ti-input-color"
};
//------------------------------------------------------
const BOX_SHADOW = {
  title : "i18n:hmk-css-box-shadow",
  name : "box-shadow",
  comType : "ti-input"
};
//------------------------------------------------------
const TEXT_SHADOW = {
  title : "i18n:hmk-css-text-shadow",
  name : "text-shadow",
  comType : "ti-input"
};
//------------------------------------------------------
const OVERFLOW = {
  title : "i18n:hmk-css-overflow",
  name : "overflow",
  comType : "ti-switcher",
  comConf : {
    options : [
      {value:"auto", text: "i18n:hmk-css-c-auto"},
      {value:"scroll", text: "i18n:hmk-css-overflow-scroll"},
      {value:"hidden", text: "i18n:hmk-css-overflow-hidden"},
      {value:"clip", text: "i18n:hmk-css-overflow-clip"},
      {value:"visible", text: "i18n:hmk-css-overflow-visible"}
    ]
  }
};
//------------------------------------------------------
const WIDTH = {
  title : "i18n:hmk-css-width",
  name : "width",
  comType : "ti-input"
};
//------------------------------------------------------
const HEIGHT = {
  title : "i18n:hmk-css-height",
  name : "height",
  comType : "ti-input"
};
//------------------------------------------------------
const MAX_WIDTH = {
  title : "i18n:hmk-css-max-width",
  name : "max-width",
  comType : "ti-input"
};
//------------------------------------------------------
const MAX_HEIGHT = {
  title : "i18n:hmk-css-max-height",
  name : "max-height",
  comType : "ti-input"
};
//------------------------------------------------------
const MIN_WIDTH = {
  title : "i18n:hmk-css-min-width",
  name : "min-width",
  comType : "ti-input"
};
//------------------------------------------------------
const MIN_HEIGHT = {
  title : "i18n:hmk-css-min-height",
  name : "min-height",
  comType : "ti-input"
};
//------------------------------------------------------
const LINE_HEIGHT = {
  title : "i18n:hmk-css-line-height",
  name : "line-height",
  comType : "ti-input"
};
//------------------------------------------------------
const LETTER_SPACING = {
  title : "i18n:hmk-css-letter-spacing",
  name : "letter-spacing",
  comType : "ti-input"
};
////////////////////////////////////////////////////////
const CSS_PROPS = {
  "background"     : BACKGROUND,
  "border"         : BORDER,
  "border-radius"  : BORDER_RADIUS,
  "box-shadow"     : BOX_SHADOW,
  "color"          : COLOR,
  "height"         : HEIGHT,
  "letter-spacing" : LETTER_SPACING,
  "line-height"    : LINE_HEIGHT,
  "margin"         : MARGIN,
  "max-height"     : MAX_HEIGHT,
  "max-width"      : MAX_WIDTH,
  "min-height"     : MIN_HEIGHT,
  "min-width"      : MIN_WIDTH,
  "overflow"       : OVERFLOW,
  "padding"        : PADDING,
  "text-shadow"    : TEXT_SHADOW,
  "width"          : WIDTH,
}
////////////////////////////////////////////////////////
const CSS_GROUPING = {
  texting : [
    "letter-spacing",
    "line-height",
    "text-shadow"],
  aspect : [
    "border",
    "background",
    "color",
    "border-radius",
    "box-shadow",
    "overflow"],
  measure : [
    "padding",
    "margin",
    "width",
    "height",
    "min-height",
    "min-width",
    "max-height",
    "max-width",
  ]
}
////////////////////////////////////////////////////////
export default {
  //----------------------------------------------------
  /**
   * Get css prop display text.
   * 
   * @param name {String} css prop name, must be kebabCase
   * 
   * @return  the prop display title text.
   */
  getCssPropTitle(name) {
    let fld = CSS_PROPS[name]
    if(fld) {
      return fld.title
    }
    return name
  },
  //----------------------------------------------------
  /**
   * 
   * @param filter {AutoMatch} css prop filter
   * 
   * @return `TiForm` fields setup
   */
  findCssPropFields(filter=true) {
    let am = Ti.AutoMatch.parse(filter)
    // Get the field list
    let fldMap = {}
    _.forEach(CSS_PROPS, (fld, name)=>{
      if(am(name)) {
        fldMap[name] = fld
      }
    })

    // Make group
    let re = []
    _.forEach(CSS_GROUPING, (names, gnm)=>{
      let fields = []
      for(let nm of names) {
        let fld = fldMap[nm]
        if(fld) {
          fields.push(fld)
        }
      }
      if(fields.length > 0) {
        re.push({
          title : `i18n:hmk-css-grp-${gnm}`,
          fields
        })
      }
    })

    // Done
    return re
  }
  //----------------------------------------------------
}
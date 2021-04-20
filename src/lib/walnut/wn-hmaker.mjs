////////////////////////////////////////////////////////
const BORDER = {
  title : "i18n:hmk-css-border",
  name : "border",
  comType : "ti-input"
};
//------------------------------------------------------
const BORDER_RADIUS = {
  title : "i18n:hmk-css-border-radius",
  name : "border-radius",
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
const FLOAT = {
  title : "i18n:hmk-css-float",
  name : "float",
  comType : "ti-switcher",
  comConf : {
    options : [
      {value: "none",  text: "i18n:hmk-css-float-none",  icon:"fas-align-justify"},
      {value: "left",  text: "i18n:hmk-css-float-left",  icon:"fas-align-left"},
      {value: "right", text: "i18n:hmk-css-float-right", icon:"fas-align-right"}
    ]
  }
};
//------------------------------------------------------
const TEXT_ALIGN = {
  title : "i18n:hmk-css-text-align",
  name : "text-align",
  comType : "ti-switcher",
  comConf : {
    options : [
      {value: "left",   tip: "i18n:hmk-css-align-left",   icon:"fas-align-left"},
      {value: "center", tip: "i18n:hmk-css-align-center", icon:"fas-align-center"},
      {value: "right",  tip: "i18n:hmk-css-align-right",  icon:"fas-align-right"},
      {value: "justify",tip: "i18n:hmk-css-align-justify",icon:"fas-align-justify"}
    ]
  }
};
//------------------------------------------------------
const WHITE_SPACE = {
  title : "i18n:hmk-css-white-space",
  name : "white-space",
  comType : "ti-droplist",
  comConf : {
    options : [
      {value: "normal",  text: "i18n:hmk-css-white-space-normal"},
      {value: "nowrap",  text: "i18n:hmk-css-white-space-nowrap"},
      {value: "pre",     text: "i18n:hmk-css-white-space-pre"},
      {value: "pre-wrap",text: "i18n:hmk-css-white-space-pre-wrap"},
      {value: "pre-line",text: "i18n:hmk-css-white-space-pre-line"},
      {value: "break-space",text: "i18n:hmk-css-white-space-break-space"}
    ]
  }
};
//------------------------------------------------------
const TEXT_OVERFLOW = {
  title : "i18n:hmk-css-text-overflow",
  name : "text-overflow",
  comType : "ti-switcher",
  comConf : {
    options : [
      {value: "clip", text: "i18n:hmk-css-text-overflow-clip", icon:"fas-cut"},
      {value: "ellipsis", text: "i18n:hmk-css-text-overflow-ellipsis", icon:"fas-ellipsis-h"}
    ]
  }
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
  fieldWidth : "100%",
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
const TEXT_TRANSFORM = {
  title : "i18n:hmk-css-text-transform",
  name : "text-transform",
  comType : "ti-switcher",
  comConf : {
    options : [
      {value:"capitalize",text: "i18n:hmk-css-text-transform-capitalize"},
      {value:"uppercase", text: "i18n:hmk-css-text-transform-uppercase"},
      {value:"lowercase", text: "i18n:hmk-css-text-transform-lowercase"}
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
//------------------------------------------------------
const FONT_SIZE = {
  title : "i18n:hmk-css-font-size",
  name : "font-size",
  comType : "ti-input"
};
////////////////////////////////////////////////////////
const CSS_PROPS = {
  "background"     : BACKGROUND,
  "border"         : BORDER,
  "border-radius"  : BORDER_RADIUS,
  "box-shadow"     : BOX_SHADOW,
  "color"          : COLOR,
  "float"          : FLOAT,
  "font-size"      : FONT_SIZE,
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
  "text-align"     : TEXT_ALIGN,
  "text-shadow"    : TEXT_SHADOW,
  "text-transform" : TEXT_TRANSFORM,
  "text-overflow"  : TEXT_OVERFLOW,
  "width"          : WIDTH,
  "white-space"    : WHITE_SPACE,
}
////////////////////////////////////////////////////////
const CSS_GROUPING = {
  aspect : [
    "margin",
    "padding",
    "border",
    "border-radius",
    "background",
    "color",
    "box-shadow",
    "float",
    "overflow"],
  measure : [
    "width",
    "height",
    "max-width",
    "max-height",
    "min-width",
    "min-height"],
  texting : [
    "text-align",
    "white-space",
    "text-overflow",
    "text-transform",
    "font-size",
    "letter-spacing",
    "line-height",
    "text-shadow"]
}
////////////////////////////////////////////////////////
const WnHMaker = {
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
  getCssPropField(name, setting={}) {
    let fld = _.cloneDeep(CSS_PROPS[name])
    if(fld) {
      return _.merge(fld, setting)
    }
  },
  //----------------------------------------------------
  /**
   * 
   * @param filter {AutoMatch} css prop filter
   * 
   * @return `TiForm` fields setup
   */
  findCssPropFields(filter=true) {
    // Quick name
    let qf = ({
      "#BLOCK" : [
        /^(margin|padding|border|overflow|background)-?/,
        /^(box-shadow|float)$/,
        /^((max|min)-)?(width|height)$/
      ],
      "#IMG" : [
        /^(margin|border|obj|background)-?/,
        /^(box-shadow|float)$/,
        /^((max|min)-)?(width|height)$/
      ],
      "#TEXT" : [
        /^(color|background(-.+)?)$/,
        /^(text-(align|transform|shadow|overflow))$/,
        /^(font-size|line-height|letter-spacing|white-space)$/,
      ],
      "#TEXT-BLOCK" : [
        /^(padding|border|color|background(-.+)?|overflow)$/,
        /^(text-(align|transform|shadow|overflow))$/,
        /^(font-size|line-height|letter-spacing|white-space)$/,
      ]
    })[filter]
    if(qf) {
      filter = qf
    }

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
        let className = ({
          aspect  : "as-vertical col-2",
          measure : "as-vertical col-2",
          texting : "as-vertical col-2"
        })[gnm]
        re.push({
          title : `i18n:hmk-css-grp-${gnm}`,
          className,
          fields
        })
      }
    })

    // Done
    return re
  }
  //----------------------------------------------------
}
////////////////////////////////////////////////////////
export default WnHMaker;
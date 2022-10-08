////////////////////////////////////////////////////////
const BORDER = {
  title: "i18n:hmk-css-border",
  name: "border",
  comType: "TiInput"
};
//------------------------------------------------------
const BORDER_RADIUS = {
  title: "i18n:hmk-css-border-radius",
  name: "border-radius",
  comType: "TiInput"
};
//------------------------------------------------------
const MARGIN = {
  title: "i18n:hmk-css-margin",
  name: "margin",
  comType: "TiInput"
};
//------------------------------------------------------
const PADDING = {
  title: "i18n:hmk-css-padding",
  name: "padding",
  comType: "TiInput"
};
//------------------------------------------------------
const BACKGROUND = {
  title: "i18n:hmk-css-background",
  name: "background",
  comType: "TiInput"
};
//------------------------------------------------------
const BACKGROUND_IMAGE = {
  title: "i18n:hmk-css-background-image",
  name: "background-image",
  fieldWidth: "100%",
  comType: "TiInput"
};
//------------------------------------------------------
const BACKGROUND_REPEAT = {
  title: "i18n:hmk-css-background-repeat",
  name: "background-repeat",
  comType: "TiDroplist",
  comConf: {
    placeholder: "i18n:no-set",
    options: "#CssBackgroundRepeats"
  }
};
//------------------------------------------------------
const BACKGROUND_POSITION = {
  title: "i18n:hmk-css-background-position",
  name: "background-position",
  comType: "TiDroplist",
  comConf: {
    options: "#CssBackgroundPositions"
  }
};
//------------------------------------------------------
const BACKGROUND_POSITION_X = {
  title: "i18n:hmk-css-background-position-x",
  name: "background-position-x",
  comType: "TiSwitcher",
  comConf: {
    options: "#CssBackgroundXPositions"
  }
};
//------------------------------------------------------
const BACKGROUND_POSITION_Y = {
  title: "i18n:hmk-css-background-position-y",
  name: "background-position-y",
  comType: "TiSwitcher",
  comConf: {
    options: "#CssBackgroundYPositions"
  }
};
//------------------------------------------------------
const BACKGROUND_SIZE = {
  title: "i18n:hmk-css-background-size",
  name: "background-size",
  width: "full",
  comType: "TiSwitcher",
  comConf: {
    options: "#CssBackgroundSizes"
  }
};
//------------------------------------------------------
const BACKGROUND_COLOR = {
  title: "i18n:hmk-css-background-color",
  name: "background-color",
  comType: "ti-input-color"
};
//------------------------------------------------------
const COLOR = {
  title: "i18n:hmk-css-color",
  name: "color",
  comType: "ti-input-color"
};
//------------------------------------------------------
const OPACITY = {
  title: "i18n:hmk-css-opacity",
  name: "opacity",
  type: "Float",
  defaultAs: 1.0,
  comType: "TiSlideBar",
  comConf: {
    className: "hdl-lg inner-color-0 hdl-color-0",
    width: "100%",
    textWidth: ".5rem",
    prefixText: false
  }
};
//------------------------------------------------------
const FLOAT = {
  title: "i18n:hmk-css-float",
  name: "float",
  comType: "TiSwitcher",
  comConf: {
    options: [
      { value: "none", text: "i18n:hmk-css-float-none", icon: "fas-align-justify" },
      { value: "left", text: "i18n:hmk-css-float-left", icon: "fas-align-left" },
      { value: "right", text: "i18n:hmk-css-float-right", icon: "fas-align-right" }
    ]
  }
};
//------------------------------------------------------
const TEXT_ALIGN = {
  title: "i18n:hmk-css-text-align",
  name: "text-align",
  comType: "TiSwitcher",
  comConf: {
    options: [
      { value: "left", tip: "i18n:hmk-css-align-left", icon: "fas-align-left" },
      { value: "center", tip: "i18n:hmk-css-align-center", icon: "fas-align-center" },
      { value: "right", tip: "i18n:hmk-css-align-right", icon: "fas-align-right" },
      { value: "justify", tip: "i18n:hmk-css-align-justify", icon: "fas-align-justify" }
    ]
  }
};
//------------------------------------------------------
const WHITE_SPACE = {
  title: "i18n:hmk-css-white-space",
  name: "white-space",
  comType: "TiDroplist",
  comConf: {
    options: [
      { value: "normal", text: "i18n:hmk-css-white-space-normal" },
      { value: "nowrap", text: "i18n:hmk-css-white-space-nowrap" },
      { value: "pre", text: "i18n:hmk-css-white-space-pre" },
      { value: "pre-wrap", text: "i18n:hmk-css-white-space-pre-wrap" },
      { value: "pre-line", text: "i18n:hmk-css-white-space-pre-line" },
      { value: "break-space", text: "i18n:hmk-css-white-space-break-space" }
    ]
  }
};
//------------------------------------------------------
const TEXT_OVERFLOW = {
  title: "i18n:hmk-css-text-overflow",
  name: "text-overflow",
  comType: "TiSwitcher",
  comConf: {
    options: [
      { value: "clip", text: "i18n:hmk-css-text-overflow-clip", icon: "fas-cut" },
      { value: "ellipsis", text: "i18n:hmk-css-text-overflow-ellipsis", icon: "fas-ellipsis-h" }
    ]
  }
};
//------------------------------------------------------
const OBJECT_FIT = {
  title: "i18n:hmk-css-object-fit",
  name: "object-fit",
  comType: "TiDroplist",
  comConf: {
    placeholder: "i18n:no-set",
    options: [
      { value: "fill", text: "i18n:hmk-css-object-fit-fill" },
      { value: "contain", text: "i18n:hmk-css-object-fit-contain" },
      { value: "cover", text: "i18n:hmk-css-object-fit-cover" },
      { value: "none", text: "i18n:hmk-css-object-fit-none" },
      { value: "scale-down", text: "i18n:hmk-css-object-fit-scale-down" }
    ]
  }
};
//------------------------------------------------------
const OBJECT_POSITION = {
  title: "i18n:hmk-css-object-position",
  name: "object-position",
  comType: "TiInput"
};
//------------------------------------------------------
const BOX_SHADOW = {
  title: "i18n:hmk-css-box-shadow",
  name: "box-shadow",
  comType: "TiInput"
};
//------------------------------------------------------
const TEXT_SHADOW = {
  title: "i18n:hmk-css-text-shadow",
  name: "text-shadow",
  comType: "TiInput"
};
//------------------------------------------------------
const OVERFLOW = {
  title: "i18n:hmk-css-overflow",
  name: "overflow",
  fieldWidth: "100%",
  comType: "TiSwitcher",
  comConf: {
    options: [
      { value: "auto", text: "i18n:hmk-css-c-auto" },
      { value: "scroll", text: "i18n:hmk-css-overflow-scroll" },
      { value: "hidden", text: "i18n:hmk-css-overflow-hidden" },
      { value: "clip", text: "i18n:hmk-css-overflow-clip" },
      { value: "visible", text: "i18n:hmk-css-overflow-visible" }
    ]
  }
};
//------------------------------------------------------
const TEXT_TRANSFORM = {
  title: "i18n:hmk-css-text-transform",
  name: "text-transform",
  comType: "TiSwitcher",
  comConf: {
    options: [
      { value: "capitalize", text: "i18n:hmk-css-text-transform-capitalize" },
      { value: "uppercase", text: "i18n:hmk-css-text-transform-uppercase" },
      { value: "lowercase", text: "i18n:hmk-css-text-transform-lowercase" }
    ]
  }
};
//------------------------------------------------------
const WIDTH = {
  title: "i18n:hmk-css-width",
  name: "width",
  comType: "TiInput"
};
//------------------------------------------------------
const HEIGHT = {
  title: "i18n:hmk-css-height",
  name: "height",
  comType: "TiInput"
};
//------------------------------------------------------
const MAX_WIDTH = {
  title: "i18n:hmk-css-max-width",
  name: "max-width",
  comType: "TiInput"
};
//------------------------------------------------------
const MAX_HEIGHT = {
  title: "i18n:hmk-css-max-height",
  name: "max-height",
  comType: "TiInput"
};
//------------------------------------------------------
const MIN_WIDTH = {
  title: "i18n:hmk-css-min-width",
  name: "min-width",
  comType: "TiInput"
};
//------------------------------------------------------
const MIN_HEIGHT = {
  title: "i18n:hmk-css-min-height",
  name: "min-height",
  comType: "TiInput"
};
//------------------------------------------------------
const LINE_HEIGHT = {
  title: "i18n:hmk-css-line-height",
  name: "line-height",
  comType: "TiInput"
};
//------------------------------------------------------
const LETTER_SPACING = {
  title: "i18n:hmk-css-letter-spacing",
  name: "letter-spacing",
  comType: "TiInput"
};
//------------------------------------------------------
const FONT_SIZE = {
  title: "i18n:hmk-css-font-size",
  name: "font-size",
  comType: "TiInput"
};
//------------------------------------------------------
const FONT_WEIGHT = {
  title: "i18n:hmk-css-font-weight",
  name: "font-weight",
  comType: "TiInput"
};
////////////////////////////////////////////////////////
const CSS_PROPS = {
  "background": BACKGROUND,
  "background-image": BACKGROUND_IMAGE,
  "background-position": BACKGROUND_POSITION,
  "background-position-x": BACKGROUND_POSITION_X,
  "background-position-y": BACKGROUND_POSITION_Y,
  "background-repeat": BACKGROUND_REPEAT,
  "background-size": BACKGROUND_SIZE,
  "background-color": BACKGROUND_COLOR,
  "border": BORDER,
  "border-radius": BORDER_RADIUS,
  "box-shadow": BOX_SHADOW,
  "color": COLOR,
  "float": FLOAT,
  "font-size": FONT_SIZE,
  "font-weight": FONT_WEIGHT,
  "height": HEIGHT,
  "letter-spacing": LETTER_SPACING,
  "line-height": LINE_HEIGHT,
  "margin": MARGIN,
  "max-height": MAX_HEIGHT,
  "max-width": MAX_WIDTH,
  "min-height": MIN_HEIGHT,
  "min-width": MIN_WIDTH,
  "object-fit": OBJECT_FIT,
  "object-positon": OBJECT_POSITION,
  "opacity": OPACITY,
  "overflow": OVERFLOW,
  "padding": PADDING,
  "text-align": TEXT_ALIGN,
  "text-shadow": TEXT_SHADOW,
  "text-transform": TEXT_TRANSFORM,
  "text-overflow": TEXT_OVERFLOW,
  "width": WIDTH,
  "white-space": WHITE_SPACE,
}
////////////////////////////////////////////////////////
const CSS_GROUPING = {
  aspect: [
    "margin",
    "padding",
    "border",
    "border-radius",
    "color",
    "box-shadow",
    "opacity",
    "object-fit",
    "object-positon",
    "float",
    "overflow"],
  background: [
    "background-color",
    "background-image",
    "background-position-x",
    "background-position-y",
    "background-size",
    "background-repeat"],
  measure: [
    "width",
    "height",
    "max-width",
    "max-height",
    "min-width",
    "min-height"],
  texting: [
    "text-align",
    "white-space",
    "text-overflow",
    "text-transform",
    "font-size",
    "font-weight",
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
    if (fld) {
      return fld.title
    }
    return name
  },
  //----------------------------------------------------
  getCssPropField(name, setting = {}) {
    let fld = _.cloneDeep(CSS_PROPS[name])
    if (fld) {
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
  findCssPropFields(filter = true) {
    // Quick name
    let qf = ({
      "#BLOCK": [
        /^(margin|padding|border|overflow|background)-?/,
        /^(box-shadow|float|opacity)$/,
        /^((max|min)-)?(width|height)$/
      ],
      "#IMG": [
        /^(margin|border|object|background)-?/,
        /^(box-shadow|float|opacity|overflow)$/,
        /^((max|min)-)?(width|height)$/
      ],
      "#TEXT": [
        /^(color|background(-.+)?)$/,
        /^((text|font)-.+|opacity)$/,
        /^(line-height|letter-spacing|white-space)$/,
      ],
      "#TEXT-BLOCK": [
        /^(margin|padding|color||overflow)$/,
        /^(border|background)(-.+)?/,
        /^((text|font)-.+|opacity)$/,
        /^(line-height|letter-spacing|white-space)$/,
        /^(width|height)$/,
      ]
    })[filter]
    if (qf) {
      filter = qf
    }

    let am = Ti.AutoMatch.parse(filter)
    // Get the field list
    let fldMap = {}
    _.forEach(CSS_PROPS, (fld, name) => {
      if (am(name)) {
        fldMap[name] = fld
      }
    })
    //console.log(fldMap)

    // Make group
    let re = []
    _.forEach(CSS_GROUPING, (names, gnm) => {
      let fields = []
      for (let nm of names) {
        let fld = fldMap[nm]
        if (fld) {
          fields.push(fld)
        }
      }
      if (fields.length > 0) {
        let gridColumnHint = ({
          aspect: [[2, 720], [1, 360], 0],
          background: [[2, 720], [1, 360], 0],
          measure: [[2, 720], [1, 360], 0],
          texting: [[2, 720], [1, 360], 0]
        })[gnm]
        re.push({
          title: `i18n:hmk-css-grp-${gnm}`,
          gridColumnHint,
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
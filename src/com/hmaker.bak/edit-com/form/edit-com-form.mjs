export default {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : undefined
    },
    "keepTabIndexBy" : {
      type : String,
      default : "hMakerEditComForm"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    FormConf() {
      return {
        //..................................
        mode: "tab",
        keepTabIndexBy: this.keepTabIndexBy,
        //..................................
        spacing: "tiny",
        //..................................
        data : this.value,
        //..................................
        fields : [
          //................................
          // Aspect
          {
            type : "Group",
            title : "i18n:hmk-aspect",
            fields : [{
                name: "title",
                title: "i18n:hmk-title",
                type : "String",
                comType : "ti-input"
              }, {
                name: "icon",
                title: "i18n:hmk-icon",
                type : "String",
                comType : "ti-input-icon"
              }, {
                name: "mode",
                title: "i18n:hmk-mode",
                type : "String",
                defaultAs: "all",
                comType : "ti-switcher",
                comConf : {
                  options: [
                    {value:"all", text:"i18n:hmk-mode-all"},
                    {value:"tab", text:"i18n:hmk-mode-tab"}]
                }
              }, {
                name: "tabAt",
                title: "i18n:hmk-tabAt",
                type : "String",
                defaultAs: "top-center",
                width: 240,
                hidden: {
                  "mode" : {
                    name: "isEqual",
                    args: "tab",
                    not: true
                  }
                },
                comType : "ti-droplist",
                comConf : {
                  placeholder: "i18n:hmk-tabAt-top-center",
                  autoI18n:true,
                  options: [
                    {value:"top-left",   text:"i18n:hmk-tabAt-top-left"},
                    {value:"top-center", text:"i18n:hmk-tabAt-top-center"},
                    {value:"top-right",  text:"i18n:hmk-tabAt-top-right"},
                    {value:"bottom-left",   text:"i18n:hmk-tabAt-bottom-left"},
                    {value:"bottom-center", text:"i18n:hmk-tabAt-bottom-center"},
                    {value:"bottom-right",  text:"i18n:hmk-tabAt-bottom-right"}]
                }
              }, {
                name: "currentTab",
                title: "i18n:hmk-currentTab",
                type : "Integer",
                defaultAs: 0,
                width : 120,
                hidden: {
                  "mode" : {
                    name: "isEqual",
                    args: "tab",
                    not: true
                  }
                },
                comType : "ti-input-num"
              }, {
                name: "spacing",
                title: "i18n:hmk-spacing",
                type : "String",
                defaultAs: "comfy",
                comType : "ti-switcher",
                comConf : {
                  options: [
                    {value:"comfy", text:"i18n:hmk-spacing-comfy"},
                    {value:"tiny",  text:"i18n:hmk-spacing-tiny"}]
                }
              }, {
                name: "adjustDelay",
                title: "i18n:hmk-adjustDelay",
                type : "Integer",
                defaultAs: 0,
                width : 120,
                comType : "ti-input-num"
              }, {
                name: "blankAs",
                title: "i18n:hmk-blankAs",
                type : "Object",
                comType : "ti-input"
              }]
          },
          //................................
          // Fields
          {
            type : "Group",
            title : "i18n:hmk-fields",
            fields : [{
                name: "fields",
                type: "Array",
                height: "100%",
                comType: "hmaker-edit-form-fieldset",
                comConf: {
                  className: "ti-fill-parent",
                  keepTabIndexBy : this.keepTabIndexBy
                }
              }]
          },
          //................................
          // Data
          {
            type : "Group",
            title : "i18n:hmk-data",
            fields : [{
              title: "i18n:hmk-form-data",
              name: "data",
              comType: "ti-input"
            }, {
              name: "fieldStatus",
              title: "i18n:hmk-fieldStatus",
              comType: "ti-input"
            }, {
              name: "onlyFields",
              title: "i18n:hmk-form-onlyFields",
              type: "Boolean",
              defaultAs: true,
              comType: "ti-toggle"
            }]
          },
          //................................
          // Measure
          {
            title: "i18n:hmk-measure",
            fields: [{
                title: "i18n:hmk-form-width",
                name: "width",
                comType: "ti-input"
              }, {
                title: "i18n:hmk-form-height",
                name: "height",
                comType: "ti-input"
              }]
          }]
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    
    //--------------------------------------
  },
  //////////////////////////////////////////
  created: async function() {
    Wn.Dict.hMakerComponents()
  }
  //////////////////////////////////////////
}
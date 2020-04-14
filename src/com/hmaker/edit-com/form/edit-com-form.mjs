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
            title : "i18n:hmk-form-aspect",
            fields : [{
                name: "title",
                title: "i18n:hmk-form-title",
                type : "String",
                comType : "ti-input"
              }, {
                name: "icon",
                title: "i18n:hmk-form-icon",
                type : "String",
                comType : "ti-input-icon"
              }, {
                name: "mode",
                title: "i18n:hmk-form-mode",
                type : "String",
                comType : "ti-switcher",
                comConf : {
                  options: [
                    {value:"all", text:"i18n:hmk-form-mode-all"},
                    {value:"tab", text:"i18n:hmk-form-mode-tab"}]
                }
              }, {
                name: "spacing",
                title: "i18n:hmk-form-spacing",
                type : "String",
                comType : "ti-switcher",
                comConf : {
                  options: [
                    {value:"comfy", text:"i18n:hmk-form-spacing-comfy"},
                    {value:"tiny",  text:"i18n:hmk-form-spacing-tiny"}]
                }
              }, {
                name: "currentTab",
                title: "i18n:hmk-form-current-tab",
                type : "Integer",
                defaultAs: 0,
                width : 120,
                comType : "ti-input-num"
              }, {
                name: "adjustDelay",
                title: "i18n:hmk-form-adjust-delay",
                type : "Integer",
                defaultAs: 0,
                width : 120,
                comType : "ti-input-num"
              }, {
                name: "blankAs",
                title: "i18n:hmk-form-blank-as",
                type : "Object",
                comType : "ti-input"
              }, {
                name: "fieldStatus",
                title: "i18n:hmk-form-field-status",
                comType: "ti-input"
              }]
          },
          //................................
          // Fields
          {
            type : "Group",
            title : "i18n:hmk-form-fields",
            fields : [{
                name: "fields",
                type: "Array",
                height: "100%",
                comType: "hmaker-edit-form-fieldset",
                comConf: {
                  className: "ti-fill-parent"
                }
              }]
          },
          //................................
          // Data
          {
            type : "Group",
            title : "i18n:hmk-form-data",
            fields : [{
              name: "data",
              height: "100%",
              comType: "ti-input-text",
              comConf: {
                height: "100%"
              }
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
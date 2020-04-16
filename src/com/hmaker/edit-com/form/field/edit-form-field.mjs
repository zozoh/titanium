export default {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : undefined
    },
    "keepTabIndexBy" : {
      type : String,
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    isEmpty() {
      return Ti.Util.isNil(this.value)
    },
    //--------------------------------------
    TheFormGeneralFields() {
      const gen_options = types => _.map(types, v => ({
        icon : Ti.I18n.get("hm-type-icons")[v],
        value: v,
        text : Ti.I18n.get(`hm-type-${v}`)
      }))
      return [
        //.................................
        // type
        {
          name: "type",
          title: "hmk-form-field-type",
          defaultAs: "String",
          comType: "ti-droplist",
          comConf: {
            placeholder: "i18n:hm-type-String",
            options: gen_options([
              "Object", "Number", "Integer", 
              "Boolean", "String", "Array" ]),
            dropDisplay: ["<icon>", "text", "value"]
          }
        },
        //.................................
        // name
        {
          name: "name",
          title: "hmk-form-field-name",
          comType: "ti-input"
        },
        //.................................
        // icon
        {
          name: "icon",
          title: "hmk-form-field-icon",
          comType: "ti-input-icon"
        },
        //.................................
        // title
        {
          name: "title",
          title: "hmk-form-field-title",
          comType: "ti-input"
        },
        //.................................
        // tip
        {
          name: "tip",
          title: "hmk-form-field-tip",
          comType: "ti-input"
        },
        //.................................
        // width
        {
          name: "width",
          title: "hmk-form-field-width",
          width: 120,
          comType: "ti-input"
        },
        //.................................
        // height
        {
          name: "height",
          title: "hmk-form-field-height",
          width: 120,
          comType: "ti-input"
        },
        //.................................
        // defaultAs
        {
          name: "defaultAs",
          title: "hmk-form-field-defaultAs",
          comType: "ti-input",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // com
        {
          name: ["comType","comConf"],
          title: "hmk-form-field-com",
          comType: "hmaker-edit-com"
        }
        //.................................
      ]
    },
    //--------------------------------------
    TheFormAdvanceFields() {
      return [
        //.................................
        // disabled
        {
          name: "disabled",
          title: "hmk-form-field-disabled",
          comType: "ti-input",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // hidden
        {
          name: "hidden",
          title: "hmk-form-field-hidden",
          comType: "ti-input",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // checkEquals
        {
          name: "checkEquals",
          title: "hmk-form-field-checkEquals",
          comType: "ti-toggle"
        },
        //.................................
        // transformer
        {
          name: "transformer",
          title: "hmk-form-field-transformer",
          comType: "ti-input-text",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // serializer
        {
          name: "serializer",
          title: "hmk-form-field-serializer",
          comType: "ti-input-text",
          comConf: {
            autoJsValue: true
          }
        }
        //.................................
      ]
    },
    //--------------------------------------
    TheForm() {
      return {
        //..................................
        // mode : "tab",
        // tabAt : "bottom-left",
        spacing : "tiny",
        keepTabIndexBy : this.keepTabIndexBy,
        //..................................
        fields: [{
            type: "Group",
            title: "i18n:hmk-form-fields-general",
            fields: this.TheFormGeneralFields
          }, {
            type: "Group",
            title: "i18n:hmk-form-fields-advance",
            fields: this.TheFormAdvanceFields
          }]
        //..................................
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    
    //--------------------------------------
  }
  //////////////////////////////////////////
}
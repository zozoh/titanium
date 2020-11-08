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
          hidden : this.isGroup,
          name: "type",
          title: "hmk-field-type",
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
        // title
        {
          name: "title",
          title: "hmk-field-title",
          comType: "ti-input"
        },
        //.................................
        // icon
        {
          name: "icon",
          title: "hmk-field-icon",
          comType: "ti-input-icon"
        },
        //.................................
        // name
        {
          hidden : this.isGroup,
          name: "name",
          title: "hmk-field-name",
          comType: "ti-input"
        },
        //.................................
        // tip
        {
          hidden : this.isGroup,
          name: "tip",
          title: "hmk-field-tip",
          comType: "ti-input"
        },
        //.................................
        // width
        {
          hidden : this.isGroup,
          name: "width",
          title: "hmk-field-width",
          width: 120,
          comType: "ti-input"
        },
        //.................................
        // height
        {
          hidden : this.isGroup,
          name: "height",
          title: "hmk-field-height",
          width: 120,
          comType: "ti-input"
        },
        //.................................
        // defaultAs
        {
          hidden : this.isGroup,
          name: "defaultAs",
          title: "hmk-field-defaultAs",
          comType: "ti-input",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // com
        {
          hidden : this.isGroup,
          name: ["comType","comConf"],
          title: "hmk-field-com",
          type: "Object",
          width: "auto",
          comType: "wn-combo-edit-com"
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
          title: "hmk-field-disabled",
          comType: "ti-input",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // hidden
        {
          name: "hidden",
          title: "hmk-field-hidden",
          comType: "ti-input",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // checkEquals
        {
          name: "checkEquals",
          title: "hmk-field-checkEquals",
          comType: "ti-toggle"
        },
        //.................................
        // transformer
        {
          name: "transformer",
          title: "hmk-field-transformer",
          comType: "ti-input-text",
          comConf: {
            autoJsValue: true
          }
        },
        //.................................
        // serializer
        {
          name: "serializer",
          title: "hmk-field-serializer",
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
            title: "i18n:hmk-fields-general",
            fields: this.TheFormGeneralFields
          }, {
            type: "Group",
            title: "i18n:hmk-fields-advance",
            hidden : this.isGroup,
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
    isGroup(fld) {
      return _.isArray(fld.fields) || "Group" == fld.type
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
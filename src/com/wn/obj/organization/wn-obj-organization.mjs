/////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  props: {
    // icon string
    "value": {
      type: [Object, String],
      default: null
    },
    // actions config dict name
    "actionDict": {
      type: String
    },
    // Customzied tree fields
    "treeFields": {
      type: Array
    },
    // Customized form fields
    "formFields": {
      type: Array
    },
    "keepCustomizedTo": {
      type: String,
      default: undefined
    },
    "rowNumberBase": {
      type: Number,
      default: undefined
    },
    "defaultOpenDepth": {
      type: Number,
      default: 3
    },
  },
  ///////////////////////////////////////////////////
  computed: {
    //-----------------------------------------------
    NewNodeData() {
      return {
        name: Ti.I18n.get("wn-org-new-node"),
        type: "G",
        icon: "fas-user-friends"
      }
    },
    //-----------------------------------------------
    NodeLeafBy() {
      return function (node) {
        return "G" != node.type
      }
    },
    //-----------------------------------------------
    TreeConf() {
      let re = {
        keepCustomizedTo: this.keepCustomizedTo,
        rowNumberBase: this.rowNumberBase,
        defaultOpenDepth: this.defaultOpenDepth,
        multi:true,
        checkable: true,
        display: [
          "<icon>",
          "name::flex-auto is-nowrap",
          "id::is-nowrap as-tip-block align-right"
        ]
      }
      if (this.actionDict) {
        re.fields = [
          {
            title: "i18n:role-behaviors",
            display: {
              key: "roleActions",
              comType: "TiTags",
              comConf: {
                className: "is-nowrap",
                dict: "SysActions"
              }
            }
          },
          {
            title: "i18n:role-in-charge",
            display: {
              "key": "inCharge",
              "transformer": {
                "name": "Ti.Types.toBoolStr",
                "args": [
                  "否",
                  "是"
                ]
              }
            }
          }
        ]
      }
      if (!_.isEmpty(this.treeFields)) {
        if (!_.isArray(re.fields)) {
          re.fields = []
        }
        for (let i = 0; i < this.treeFields.length; i++) {
          re.fields.push(this.treeFields[i])
        }
      }
      if (!_.isEmpty(re.fields)) {
        re.border = "cell";
        re.columnResizable = true
      }
      return re;
    },
    //-----------------------------------------------
    NodeForm() {
      let fields = [
        {
          title: "ID",
          name: "id",
          comConf: {
            editable: true,
            valueCase: "upper"
          }
        },
        {
          title: "i18n:type",
          name: "type",
          comType: "TiSwitcher",
          comConf: {
            options: "#OrgNodeTypes",
            allowEmpty: false
          }
        },
        {
          title: "i18n:icon",
          name: "icon",
          comType: "TiInputIcon",
          comConf: {
            options: this.OrgOptionIcons
          }
        },
        {
          title: "i18n:name",
          name: "name",
          comType: "TiInput"
        },
        {
          title: "i18n:role-in-charge",
          name: "inCharge",
          type: "Boolean",
          visible: {
            "type": "P"
          },
          comType: "TiToggle"
        }
      ]
      // Actions
      if (this.actionDict) {
        fields.push({
          title: "i18n:role-behaviors",
          name: "roleActions",
          type: "Array",
          comType: "ti-droplist",
          comConf: {
            options: `#${this.actionDict}`,
            multi: true,
            placeholder: "i18n:role-behaviors",
            prefixIcon: "zmdi-minus",
            dropComConf: {
              rowAsGroupTitle: {
                "value": "[BLANK]"
              },
              rowGroupTitleDisplay: [
                "<icon>",
                "title"
              ],
              display: [
                "<icon>",
                "text::is-nowrap",
                "value::as-tip-block align-right"
              ]
            }
          }
        })
      }
      if (!_.isEmpty(this.formFields)) {
        for (let i = 0; i < this.formFields.length; i++) {
          fields.push(this.formFields[i])
        }
      }

      // Others fields
      fields.push({
        title: "i18n:note",
        name: "note",
        comType: "TiInputText",
        comConf: {
          height: "6em"
        }
      })
      // Then return form config
      return {
        fields
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
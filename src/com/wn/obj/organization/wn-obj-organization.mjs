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
    "keepCustomizedTo": {
      type: String,
      default: undefined
    },
    "rowNumberBase": {
      type: Number,
      default: undefined
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
        display: [
          "<icon>",
          "name::flex-auto",
          "id::is-nowrap as-tip-block align-right"
        ]
      }
      if (this.actionDict) {
        re.border = "cell";
        re.columnResizable = true
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
          }
        ]
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
            multi: true
          }
        })
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
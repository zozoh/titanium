/////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  props: {
    // icon string
    "value": {
      type: [Object, String],
      default: null
    }
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
      return {
        display: [
          "<icon>",
          "name::flex-auto",
          "id::is-nowrap as-tip-block align-right"
        ]
      }
    },
    //-----------------------------------------------
    NodeForm() {
      return {
        "fields": [
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
            title: "i18n:note",
            name: "note",
            comType: "TiInputText",
            comConf: {
              height: "6em"
            }
          }
        ]
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
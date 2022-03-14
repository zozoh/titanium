export default {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "data": {
      type: Object
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    FormData() {
      return this.data
    },
    //------------------------------------------------
    FormFields() {
      return [
        {
          "title": "名称",
          "name": "name",
          "fieldWidth": "100%",
          "comType": "TiInput",
          "comConf": {
            "placeholder": "请输入执行项名称"
          }
        },
        {
          "title": "图标",
          "name": "icon",
          "comType": "TiInputIcon"
        },
        {
          "title": "重载默认",
          "name": "override",
          "type": "Boolean",
          "tip": "覆盖【基础流程】同名执行项",
          "comType": "TiToggle"
        },
        {
          "title": "前置条件",
          "name": "test",
          "type": "Array",
          "fieldWidth": "100%",
          "comType": "HmAutomatch",
          "comConf": {}
        },
        {
          "title": "执行变量",
          "name": "vars",
          "type": "Object",
          "fieldWidth": "100%",
          "comType": "TiInputPair",
          "comConf": {
            "placeholder": "每个动作的扩展上下文变量JSON",
            "valueComType": "TiInputDval",
            "valueComConf": {
              "hideBorder": true,
              "autoJsValue": true,
              "autoSelect": true
            }
          }
        },
        {
          "title": "执行动作列表"
        },
        {
          "name": "actions",
          "type": "Array",
          "fieldWidth": "100%",
          "comType": "HmReactActions",
          "comConf": {

          }
        },
      ]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
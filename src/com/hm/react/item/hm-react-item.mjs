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
          "title": "前置条件",
          "name": "test",
          "type": "Array",
          "comType": "TiInputText",
          "comConf": {
            "placeholder": "前置条件JSON",
            "height": "10em"
          }
        },
        {
          "title": "重载默认",
          "name": "override",
          "type": "Boolean",
          "tip": "勾选本选项，将会覆盖【基础流程】里的同名执行项",
          "comType": "TiToggle"
        },
        {
          "title": "执行变量",
          "name": "vars",
          "type": "Object",
          "comType": "TiInputText",
          "comConf": {
            "placeholder": "每个动作的扩展上下文变量JSON",
            "height": "10em"
          }
        },
        {
          "title": "执行动作列表"
        },
        {
          "name": "actions",
          "type": "Array",
          "comType": "TiInputText",
          "comConf": {
            "placeholder": "执行动作列表",
            "height": "10em"
          }
        },
      ]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
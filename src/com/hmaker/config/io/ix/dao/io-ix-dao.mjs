export default {
  /////////////////////////////////////////
  data: ()=>({
  }),
  /////////////////////////////////////////
  props : {
    "value" : {
      type: [String, Object],
      default: undefined
    }
  },
  /////////////////////////////////////////
  computed : {
    //------------------------------------
    TheData() {
      if(_.isString(this.value)) {
        return JSON.stringify(this.value)
      }
      return _.cloneDeep(this.value)
    },
    //------------------------------------
    FormConf() {
      return {
        mode : "tab",
        keepTabIndexBy : "hmaker-config-io-ix-dao-tabIndex",
        fields: [{
          //............................
          // 基本设置
          //............................
          title : "基本",
          fields : [{
              title : "数据源",
              name  : "dao",
              comType : "ti-input"
            }, {
              title : "数据表",
              name  : "tableName",
              comType : "ti-input"
            }, {
              title : "自动建表",
              name  : "autoCreate",
              type  : "Boolean",
              tip   : "第一次访问时，会自动检查并确保数据库里有这个表",
              comType : "ti-toggle"
            }, {
              title : "主键",
              name  : "pks",
              type  : "Array",
              tip   : "默认为 `id` 字段",
              comType : "ti-input-tags"
            }]
          },
          //............................
          // 映射字段
          //............................
          {
            title : "映射字段",
            fields : [{
                name : "fields",
                type : "Array",
                comType : "ti-combo-table",
                comConf : {
                  className : "ti-cover-parent",
                  form : {
                    fields : [{
                      title : "字段名",
                      name  : "name",
                      comType : "ti-input"
                    }, {
                      title : "数据类型",
                      name  : "type",
                      tip : "程序内存中的数据类型",
                      defaultAs : "String",
                      comType : "ti-droplist",
                      comConf : {
                        options: "#JavaTypes",
                        dropDisplay : ["text::flex-auto", "value::as-tip"]
                      }
                    }, {
                      title : "存储类型",
                      name  : "columnType",
                      tip : "数据库中的字段数据类型",
                      defaultAs : "AUTO",
                      comType : "ti-droplist",
                      comConf : {
                        options: "#ColumnTypes",
                        dropDisplay : ["text::flex-auto", "value::as-tip"]
                      }
                    }, {
                      title : "存储长度",
                      name  : "width",
                      type  : "Integer",
                      tip : "数据库存储该字段所占的空间",
                      width  : 120,
                      comType : "ti-input"
                    }, {
                      title : "不可为空",
                      name  : "notNull",
                      type  : "Boolean",
                      defaultAs : false,
                      comType : "ti-toggle"
                    }, {
                      title : "可插入",
                      name  : "insert",
                      type  : "Boolean",
                      defaultAs : true,
                      comType : "ti-toggle"
                    }, {
                      title : "可更新",
                      name  : "update",
                      type  : "Boolean",
                      defaultAs : true,
                      comType : "ti-toggle"
                    }]
                  },
                  list : {
                    fields : [{
                      title : "字段名",
                      display : "name"
                    }, {
                      title : "数据类型",
                      display : "#JavaTypes(type)"
                    }, {
                      title : "存储类型",
                      display : "#ColumnTypes(columnType)"
                    }, {
                      title : "存储长度",
                      width : 100,
                      display : "width"
                    }, {
                      title : "不可为空",
                      width : 80,
                      display : "<=TiLabel:notNull>=>Ti.Types.toBoolStr(null,'i18n:yes')"
                    }, {
                      title : "可插入",
                      width : 50,
                      display : "<=TiLabel:insert>=>Ti.Types.toBoolStr(null,'i18n:yes')"
                    }, {
                      title : "可更新",
                      width : 50,
                      display : "<=TiLabel:update>=>Ti.Types.toBoolStr(null,'i18n:yes')"
                    }]
                  },
                  dialog : {
                    title  : "编辑字段",
                    width  : 640,
                    height : 0.8
                  }
                }
              }]
          },
          //............................
          // 内置字段
          //............................
          {
            title : "内置字段",
            fields : [{
              name : "objKeys",
              type : "Array",
              comType : "ti-input-text",
              comConf : {
                height: "100%"
              }
            }]
          },
          //............................
          // 索引
          //............................
          {
            title : "索引",
            fields : [{
              name : "indexes",
              type : "Array",
              comType : "ti-combo-table",
              comConf : {
                className : "ti-fill-parent",
                form : {
                  fields : [{
                      title : "唯一性索引",
                      name  : "unique",
                      type  : "Boolean",
                      comType : "ti-toggle"
                    }, {
                      title : "索引名称",
                      name  : "name",
                      comType : "ti-input"
                    }, {
                      title : "索引字段",
                      name  : "fields",
                      type  : "Array",
                      comType : "ti-input-tags"
                    }]
                },
                list : {
                  fields: [{
                    title : "索引名称",
                    display : [
                      "<=TiIcon:notNull>=>Ti.Types.toBoolStr(null,'fas-exclamation')",
                      "name"]
                  }, {
                    title : "索引字段",
                    display : "fields"
                  }, {
                    title : "唯一性",
                    display : "<=TiLabel:unique>=>Ti.Types.toBoolStr(null,'唯一')"
                  }]
                },
                dialog : {
                  title  : "编辑索引",
                  width  : 420,
                  height : 500
                }
              }
            }]
          }
          //............................
        ]
      }
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  methods : {
    //------------------------------------
    OnFormChange(payload) {
      console.log("change", payload)
    },
    //------------------------------------
    OnFormFieldChange(payload){
      console.log("field:change", payload)
    }
    //------------------------------------
  },
  /////////////////////////////////////////
  watch : {
    
  }
  /////////////////////////////////////////
}
const TiFormHelper = {
  //---------------------------------
  genTableFieldsByForm2(fields = [], dataFormat = "yy-MM-dd") {
    return TiFormHelper.genTableFieldsByForm(fields, {
      isCan: (fld) => {
        return fld.candidateInTable ? true : false;
      },
      dataFormat
    });
  },
  //---------------------------------
  genTableFieldsByForm(
    fields = [],
    {
      isCan = () => false,
      isIgnore = () => false,
      dataFormat = "yy-MM-dd",
      iteratee = (fld) => fld
    } = {}
  ) {
    const joinField = function (fld, list = []) {
      if (_.isEmpty(fld) || isIgnore(fld)) {
        return;
      }
      let { title, name, type, comType, comConf = {} } = fld;
      let { options } = comConf;
      // 忽略无法处理的
      if (!name || !_.isString(name) || !title) {
        //console.log("ignore",name||title)
        return;
      }
      let it = { title, candidate: isCan(fld) };
      // 翻译字典
      if (/^#/.test(options)) {
        it.display = `${options}(${name})`;
      }
      // 日期和时间
      else if ("TiInputDate" == comType || /^(AMS|Date(Time)?)$/.test(type)) {
        it = Ti.Util.genTableTimeField(title, name, {
          can: isCan(fld),
          format: dataFormat
        });
      }
      // 标签
      else if ("TiInputTags" == comType) {
        it.display = {
          key: name,
          comType: "TiTags",
          comConf: {
            className: "is-nowrap"
          }
        };
      }
      //数组
      else if ("Array" == type) {
        it.display = {
          key: name,
          comType: "TiLabel",
          comConf: {
            className: "is-nowrap",
            format: (vals) => {
              if (_.isArray(vals)) {
                return vals.join(", ");
              }
              return vals;
            }
          }
        };
      }
      // 普通
      else {
        it.display = name;
      }

      it = iteratee(it, name);
      if (it) list.push(it);
    };
    let list = [];
    for (let fld of fields) {
      if (_.isArray(fld.fields)) {
        for (let sub of fld.fields) {
          joinField(sub, list);
        }
      } else {
        joinField(fld, list);
      }
    }
    return list;
  },
  //---------------------------------
  genTableTimeField(
    title,
    name,
    { can = true, format = "yy-MM-dd", className = "is-nowrap" } = {}
  ) {
    return {
      "title": title,
      "candidate": can,
      "display": {
        "key": name,
        "transformer": `Ti.Types.formatDate('${format}')`,
        "comConf": {
          "className": className
        }
      }
    };
  },
  //---------------------------------
  // pick data obey fields only
  pickFormData(fields = [], data = {}, filter = () => true) {
    let list = [];
    const joinFields = function (fld) {
      if (!fld) {
        return;
      }
      if (_.isArray(fld.fields)) {
        for (let sub of fld.fields) {
          joinFields(sub);
        }
      } else {
        // Visibility
        let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
        if (hidden) {
          return;
        }
        // Join to result
        list.push(fld);
      }
    };
    // find the requied fields
    for (let field of fields) {
      joinFields(field);
    }
    // Check the data
    let re = {};
    for (let fld of list) {
      let { name } = fld;
      let keys = _.concat(name);
      for (let key of keys) {
        let val = _.get(data, key);
        if (!filter(key, val)) {
          continue;
        }
        if (!Ti.Util.isNil(val)) {
          _.set(re, key, val);
        }
      }
    }
    return re;
  },
  //---------------------------------
  // @return "Error Message" or nil for check ok
  getFormVisibleFields(fields = [], data = {}) {
    let list = [];
    const joinVisible = function (fld) {
      if (!fld) {
        return;
      }
      if (_.isArray(fld.fields)) {
        for (let sub of fld.fields) {
          joinVisible(sub);
        }
      } else {
        // Visibility
        let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
        if (hidden) {
          return;
        }
        // Join to result
        list.push(fld);
      }
    };
    // find the requied fields
    for (let field of fields) {
      joinVisible(field);
    }
    return list;
  },
  //---------------------------------
  // @return "Error Message" or nil for check ok
  checkFormRequiredFields(fields = [], data = {}) {
    let list = [];
    const joinRequired = function (fld) {
      if (!fld) {
        return;
      }
      // Field groups
      if (_.isArray(fld.fields)) {
        let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
        if (hidden) {
          return;
        }
        for (let sub of fld.fields) {
          joinRequired(sub);
        }
      }
      // Normal required field
      else if (fld.required) {
        // is Required
        if (!_.isBoolean(fld.required)) {
          if (!Ti.AutoMatch.test(fld.required, this.myData)) {
            return;
          }
        }
        // Visibility
        let { hidden } = Ti.Types.getFormFieldVisibility(fld, data);
        if (hidden) {
          return;
        }
        // Join to result
        list.push(fld);
      }
    };
    // find the requied fields
    for (let field of fields) {
      joinRequired(field);
    }
    // Check the data
    for (let fld of list) {
      let { name, title, tip } = fld;
      let keys = _.concat(name);
      for (let key of keys) {
        let val = _.get(data, key);
        if (Ti.Util.isNil(val) || (_.isString(val) && _.isEmpty(val))) {
          return Ti.I18n.getf("e-form-incomplete", { title, name: key, tip });
        }
      }
    }
  }
  //---------------------------------
};
//-----------------------------------
export default TiFormHelper;

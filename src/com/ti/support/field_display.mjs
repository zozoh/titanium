//////////////////////////////////////////////
function _render_iteratee({ varName, vars, matched } = {}) {
  if (matched.startsWith("$$")) {
    return matched.substring(1);
  }
  // ${=xxx}  get value from vars
  // ${pos.x} get value from itemData
  let m = /^(=)?([^?]+)(\?(.*))?$/.exec(varName);
  let ctx = "=" == m[1] ? vars.vars : vars.itemData;

  let vkey = _.trim(m[2]);
  let vdft = Ti.Util.fallbackNil(_.trim(m[4]), matched);
  let rev = Ti.Util.getOrPick(ctx, vkey);
  return Ti.Util.fallback(rev, vdft);
}
//////////////////////////////////////////////
// cx = {vars, itemData, value}
function __eval_com_conf_item(val, cx = {}) {
  // dirty code: history problem, sometimes client use item or itemData
  if (!cx.item) {
    cx.item = cx.itemData;
  }
  // String valu3
  if (_.isString(val)) {
    if (/^:*([-=]|[!=]=|->|==?>)/.test(val)) {
      return Ti.Util.explainObj(cx, val);
    }
    //........................................
    // Quick Value
    //........................................
    // VAL: evalue the special value, like:
    //  - "${=value}"
    //  - "${=..}"
    //  - "${=varName}"
    let m = /^\$\{=([^${}=]+)\}$/.exec(val);
    if (m) {
      let varName = _.trim(m[1]);
      // Whole Context
      if (".." == varName) {
        return cx.itemData;
      }
      // Value
      if ("value" == varName) {
        return cx.value;
      }
      // In var set
      else {
        return Ti.Util.fallback(_.get(cx.vars, varName), val);
      }
    }
    //........................................
    // String Template
    //........................................
    // VAL as template (xxx)?xxx${nn}
    // the placeholder support:
    //  - "${=varName}"
    //  - "${info.age}"
    m = /^(\((.+)\)\?)?(.+)$/.exec(val);
    if (m) {
      let preKey = _.trim(m[2]);
      let tmpl = _.trim(m[3]);
      // console.log("haha", preKey, tmpl)
      // Only `itemData` contains the preKey, render the value
      if (preKey) {
        // "(age)?xxx"  :: get from itemDAta
        if (_.get(cx.itemData, preKey)) {
          return Ti.S.renderBy(tmpl, cx, {
            iteratee: _render_iteratee
          });
        }
        return null;
      }
      // Render the value
      return Ti.S.renderBy(tmpl, cx, {
        iteratee: _render_iteratee
      });
    }
    //........................................
    // Primary
    //........................................
    return val;
  }
  // Object Value
  else if (_.isPlainObject(val)) {
    //........................................
    // Nested Objects
    //........................................
    let obj = {};
    _.forEach(val, (v, k) => {
      let v2 = __eval_com_conf_item(v, cx);
      if ("..." == k) {
        _.assign(obj, v2);
      } else {
        obj[k] = v2;
      }
    });
    return obj;
  }
  // Array Value
  else if (_.isArray(val)) {
    let list = [];
    for (let v of val) {
      let v2 = __eval_com_conf_item(v, cx);
      list.push(v2);
    }
    return list;
  }
  // Keep original value
  return val;
}
//////////////////////////////////////////////
const FieldDisplay = {
  //------------------------------------------
  evalFieldDisplayItem(displayItem = {}, { defaultKey } = {}) {
    //........................................
    const __gen_dis = () => {
      //......................................
      // Guard it
      if (Ti.Util.isNil(displayItem)) {
        return defaultKey ? { key: defaultKey, comType: "TiLabel" } : null;
      }
      //......................................
      // {key:"xxx", comType:"xxx"}
      if (_.isPlainObject(displayItem)) {
        let dis = _.assign(
          {
            key: defaultKey,
            comType: "TiLabel"
          },
          displayItem
        );
        if (dis.transformer) {
          const invokeOpt = {
            context: this,
            partial: "right"
          };
          dis.transformer = Ti.Util.genInvoking(dis.transformer, invokeOpt);
        }
        return dis;
      }
      //......................................
      // Array to multi key
      if (_.isArray(displayItem)) {
        return {
          key: displayItem,
          comType: "TiLabel"
        };
      }
      //......................................
      // Boolean
      if (true === displayItem) {
        return {
          key: defaultKey,
          comType: "TiLabel"
        };
      }
      //......................................
      if (_.isString(displayItem)) {
        // <icon:zmdi-user:$ClassName>?
        let m = /^<([^:>=]*)(:([^>:]+))?(:([^>:]+))?>(\?)?$/.exec(displayItem);
        if (m) {
          return {
            key: m[1] || defaultKey || ":ti-icon",
            defaultAs: m[3] || undefined,
            ignoreNil: "?" == m[6],
            comType: "ti-icon",
            comConf: {
              className: m[5] || undefined
            }
          };
        }
        //......................................
        // #DictName(xxx) -> TiLabel
        // just like `#RelayStatus(status):xxx:is-nowrap`
        m = /^(!)?[@#]([^\(]+)\(([^)]+)\)(:([^:]*)(:([^:]+))?)?$/.exec(
          displayItem
        );
        if (m) {
          return {
            key: m[3] || defaultKey,
            comType: "TiLabel",
            comConf: {
              dict: m[2],
              format: m[5] || undefined,
              className: m[7] || "is-nowrap",
              autoLoadDictIcon: m[1] == "!" ? false : undefined
            }
          };
        }
        //......................................
        // "<=ti-label:key>" or ":<=ti-label>"
        // or <=ti-icon:key>=>Ti.Types.toBoolStr(null,'fas-user')
        m = /^<=([^:]+)(:(.+))?>(\.([^=]+))?(=>(.+))?$/.exec(displayItem);
        if (m) {
          // Eval className
          let className = m[5] || undefined;
          // Eval transformer
          let transformer = undefined;
          if (m[7]) {
            transformer = Ti.Util.genInvoking(m[7], {
              context: this,
              partial: "right"
            });
          }
          // done for field
          return {
            key: m[3] || defaultKey || Symbol(displayItem),
            transformer,
            comType: Ti.Util.toStdComType(m[1]),
            comConf: {
              className
            }
          };
        }
        //......................................
        // String -> TiLabel
        // - "name" or ["name", "age"]
        // - "'Static Text'"
        // - "text+>/a/link?nm=${name}"
        // - "'More'->/a/link?id=${id}"
        // - "name:【${val}】->/a/link?id=${id}"
        m = /^([^+:>-]+)(:([^+:-]*)(:([^:]+))?)?(([+-])>([^%]*))?$/.exec(
          displayItem
        );
        if (m) {
          let key = _.trim(m[1] || m[0]);
          let format = m[3] || undefined;
          let newTab = m[7] == "+";
          let href = _.trim(m[8]);
          return {
            key,
            comType: "TiLabel",
            comConf: {
              className: m[5] || "is-nowrap",
              newTab,
              href,
              format
            }
          };
        }
        //......................................
        // Default as lable
        return {
          key: displayItem,
          comType: "TiLabel"
        };
        //......................................
      }
      //......................................
      return displayItem;
    };
    //........................................
    let dis = __gen_dis();
    //........................................
    if (dis.dict) {
      let { name, vKey } = Ti.DictFactory.explainDictName(dis.dict);
      dis.$dict = Ti.DictFactory.CheckDict(name);
      dis.$dictValueKey = vKey || ".text";
    }
    //........................................
    if (dis.visible) {
      dis.visibleFn = Ti.AutoMatch.parse(dis.visible);
    }
    //........................................
    if (dis.hidden) {
      dis.hiddenFn = Ti.AutoMatch.parse(dis.hidden);
    }
    //........................................
    // Then return
    return dis;
  },
  //------------------------------------------
  /***
   * @param itemData{Object} - raw data
   * @param displayItem{Object} - display item setting
   * @param vars{Object} - special value forms like:
   * ```js
   * {
   *   "isCurrent" : this.isCurrent,
   *   "isChecked" : this.isChecked,
   *   "isHover"   : this.isHover,
   *   "isActived" : this.isActived,
   *   "rowId"     : this.rowId
   * }
   * ```
   */
  async evalDataForFieldDisplayItem({
    itemData = {},
    displayItem = {},
    vars = {},
    autoIgnoreNil = true,
    autoIgnoreBlank = true,
    autoValue = "value",
    uniqKey
  } = {}) {
    let dis = displayItem;
    //if ("evd_inner" == dis.key) console.log(dis);
    let value = dis.defaultAs;
    //.....................................
    // Array -> Obj
    if (_.isArray(dis.key)) {
      value = _.pick(itemData, dis.key);
    }
    // String ...
    else if (_.isString(dis.key)) {
      // Whole data
      if (".." == dis.key) {
        value = itemData;
      }
      // Statci value
      else if (/^'[^']+'$/.test(dis.key)) {
        value = dis.key.substring(1, dis.key.length - 1);
      }
      // Template
      else if (/^->(.+)$/.test(dis.key)) {
        value = Ti.S.renderBy(dis.key.substring(2), itemData);
      }
      // Dynamic value
      else {
        value = Ti.Util.fallbackNil(
          Ti.Util.getOrPickNoBlank(itemData, dis.key),
          value
        );
      }
    }
    // if("id" == dis.key)
    //   console.log(dis, value)
    //.....................................
    // Transformer
    if (_.isFunction(dis.transformer)) {
      // Sometimes, we need transform nil also
      if (!Ti.Util.isNil(value) || dis.transNil) {
        value = await dis.transformer(value);
      }
    }
    // Ignore the Blank
    if (autoIgnoreBlank && Ti.S.isBlank(value)) {
      if (Ti.Util.fallback(dis.ignoreBlank, true)) {
        return;
      }
    }
    // Ignore the undefined/null
    if (autoIgnoreNil && Ti.Util.isNil(value)) {
      if (Ti.Util.fallback(dis.ignoreNil, true)) {
        return;
      }
    }
    // Ignore empty
    if (dis.ignoreEmpty) {
      if (_.isEmpty(value)) {
        return;
      }
      let allEmpty = true;
      for (let k in value) {
        if (!_.isEmpty(value[k])) {
          allEmpty = false;
          break;
        }
      }
      if (allEmpty) {
        return;
      }
    }
    //.....................................
    // Visibility
    if (_.isFunction(dis.visibleFn)) {
      if (!dis.visibleFn(itemData)) {
        return;
      }
    }
    if (_.isFunction(dis.hiddenFn)) {
      if (dis.hiddenFn(itemData)) {
        return;
      }
    }
    //.....................................
    // Translate by dict
    if (dis.$dict) {
      value = await dis.$dict.getItemAs(dis.$dictValueKey, value);
    }
    //.....................................
    // Add value to comConf
    let reDisplayItem = _.cloneDeep(dis);
    let comConf = {};
    //.....................................
    // Customized comConf
    if (_.isFunction(dis.comConf)) {
      comConf = _.assign({}, dis.comConf(itemData));
    }
    //.....................................
    // Eval comConf
    else if (dis.comConf) {
      comConf = __eval_com_conf_item(dis.comConf, {
        vars,
        itemData,
        value
      });
    }
    //.....................................
    // Set the default value key
    if (autoValue && _.isUndefined(comConf[autoValue])) {
      comConf[autoValue] = value;
    }
    //.....................................
    // Auto Eval ClassName
    if (_.isFunction(comConf.className)) {
      let className = comConf.className(value, itemData, dis);
      comConf.className = className;
    }
    //.....................................
    reDisplayItem.comConf = comConf;
    //.....................................
    if (!reDisplayItem.uniqKey) {
      if (uniqKey) {
        reDisplayItem.uniqKey = uniqKey;
      } else {
        reDisplayItem.uniqKey = _.concat(
          reDisplayItem.key,
          reDisplayItem.comType
        ).join("-");
      }
    }
    //.....................................
    return reDisplayItem;
  }
  //------------------------------------------
};
//////////////////////////////////////////////
export default FieldDisplay;

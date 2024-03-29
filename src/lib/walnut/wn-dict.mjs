///////////////////////////////////////////////////////////
const WnDict = {  
  /***
   * @return {Ti.Dict}
   */
  evalOptionsDict({
    options, dictVars,
    findBy, itemBy, childrenBy,
    valueBy, textBy, iconBy,
    dictShadowed = true
  }, hooks) {
    // Quck Dict Name
    let dictName = Ti.DictFactory.DictReferName(options)
    // console.log("evalOptionsDict", options)
    // if("ComDeptJobs" == dictName) {
    //   console.log("haha", {options, dictKey, dictVars})
    // }
    if(dictName) {
      let {name, dynamic, dictKey} = Ti.DictFactory.explainDictName(dictName)
      //
      // Dynamic dictionary
      //
      if(dynamic) {
        let key = _.get(dictVars, dictKey)
        if(!key) {
          return null
        }
        return Ti.DictFactory.CheckDynamicDict({
          name, key,
          vars : dictVars
        })
      }
      //
      // Static dictionary
      //
      return Ti.DictFactory.CheckDict(dictName, hooks)
    }

    // Explaint anonymity dictionary
    return Ti.DictFactory.CreateDict({
      dataChildrenKey : options.dataChildrenKey,
      //...............................................
      data  : Wn.Util.genQuery(options, {
        vkey:null,
        blankAs: "[]"
      }),
      query : Wn.Util.genQuery(findBy, {
        blankAs: "[]"
      }),
      item  : Wn.Util.genQuery(itemBy, {
        errorAs: null,
        blankAs: "{}"
      }),
      children  : Wn.Util.genQuery(childrenBy, {
        errorAs: null,
        blankAs: "[]"
      }),
      //...............................................
      getValue : Ti.Util.genGetter(valueBy || "id|value"),
      getText  : Ti.Util.genGetter(textBy  || "title|text|nm"),
      getIcon  : Ti.Util.genGetter(iconBy  || Wn.Util.getObjThumbIcon),
      //...............................................
    }, {
      shadowed : dictShadowed,
      hooks
    })
  },
  //-------------------------------------------------------
  /***
   * Setup dictionary set
   */
  setup(dicts) {
    //console.log(dicts)
    _.forEach(dicts, (dict, name)=>{
      //
      // Dynamic
      //
      if(dict.dynamic) {
        let ddef = _.pick(dict, 
          "dataChildrenKey",
          "data", "query", "item", "children",
          "value", "text", "icon", "shadowed")
        Ti.DictFactory.CreateDynamicDict(function(vars={}){
          let dobj = Ti.Util.explainObj(vars, ddef)
          return Ti.DictFactory.CreateDict({
            dataChildrenKey : dobj.dataChildrenKey,
            //...............................................
            data  : Wn.Util.genQuery(dobj.data, {vkey:null}),
            query : Wn.Util.genQuery(dobj.query),
            item  : Wn.Util.genQuery(dobj.item, {
              blankAs: "{}"
            }),
            children : Wn.Util.genQuery(dobj.children),
            //...............................................
            getValue : Ti.Util.genGetter(dobj.value),
            getText  : Ti.Util.genGetter(dobj.text),
            getIcon  : Ti.Util.genGetter(dobj.icon),
            //...............................................
            shadowed : Ti.Util.fallback(dobj.shadowed, true)
            //...............................................
          })
        }, name)
      }
      //
      // Static
      //
      else {
        let d = Ti.DictFactory.GetDict(name)
        if(!d) {
          //console.log("create", name, dict)
          Ti.DictFactory.CreateDict({
            dataChildrenKey : dict.dataChildrenKey,
            //...............................................
            data  : Wn.Util.genQuery(dict.data, {vkey:null}),
            query : Wn.Util.genQuery(dict.query),
            item  : Wn.Util.genQuery(dict.item, {
              blankAs: "{}"
            }),
            children : Wn.Util.genQuery(dict.children),
            //...............................................
            getValue : Ti.Util.genGetter(dict.value),
            getText  : Ti.Util.genGetter(dict.text),
            getIcon  : Ti.Util.genGetter(dict.icon),
            //...............................................
            shadowed : Ti.Util.fallback(dict.shadowed, true)
            //...............................................
          }, {name})
        }
      }
    })
  },
  //-------------------------------------------------------
  /***
   * 
   */
  hMakerComponents() {
    return Ti.DictFactory.GetOrCreate({
      //...............................................
      data  : Wn.Util.genQuery("ti coms -cqn", {vkey:null}),
      //...............................................
      getValue : it => it.name,
      getText  : it => (it.title || it.name),
      getIcon  : it => (it.icon  || "im-plugin"),
      //...............................................
      isMatched : (it, v)=>{
        if(it.name == v || it.title == v) {
          return true
        }
        if(it.name && it.name.indexOf(v)>=0) {
          return true
        }
        if(it.title) {
          if(it.title.indexOf(v)>=0) {
            return true
          }
          let text = Ti.I18n.text(it.title)
          if(text && text.indexOf(v)>=0) {
            return true
          }
        }
        return false
      },
      //...............................................
      shadowed : true
      //...............................................
    }, {name: "hMakerComponents"})
  }
  //-------------------------------------------------------
}
///////////////////////////////////////////////////////////
export default WnDict;
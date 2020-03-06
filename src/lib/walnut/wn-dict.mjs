import Ti from "../../core/ti.mjs"

///////////////////////////////////////////////////////////
const WnDict = {  
  /***
   * @return {Ti.Dict}
   */
  evalOptionsDict({
    options, findBy, itemBy,
    valueBy, textBy, iconBy,
    dictShadowed = true
  }, hooks) {
    // Quck Dict Name
    let dictName = Ti.DictFactory.DictReferName(options)
    if(dictName) {
      return Ti.DictFactory.CheckDict(dictName, hooks)
    }

    // Explaint 
    return Ti.DictFactory.CreateDict({
      //...............................................
      data  : Wn.Util.genQuery(options, {vkey:null}),
      query : Wn.Util.genQuery(findBy),
      item  : Wn.Util.genQuery(itemBy),
      //...............................................
      getValue : Ti.Util.genGetter(valueBy || "id"),
      getText  : Ti.Util.genGetter(textBy  || "title|nm"),
      getIcon  : Ti.Util.genGetter(iconBy  || Wn.Util.getObjThumbIcon),
      //...............................................
    }, {
      shadowed : dictShadowed,
      hooks
    })
  },
  /***
   * Setup dictionary set
   */
  setup(dicts) {
    //console.log(dicts)
    _.forEach(dicts, (dict, name)=>{
      let d = Ti.DictFactory.GetDict(name)
      if(!d) {
        //console.log("create", name, dict)
        Ti.DictFactory.CreateDict({
          //...............................................
          data  : Wn.Util.genQuery(dict.data, {vkey:null}),
          query : Wn.Util.genQuery(dict.query),
          item  : Wn.Util.genQuery(dict.item),
          //...............................................
          getValue : Ti.Util.genGetter(dict.value),
          getText  : Ti.Util.genGetter(dict.text),
          getIcon  : Ti.Util.genGetter(dict.icon),
          //...............................................
          shadowed : Ti.Util.fallback(dict.shadowed, true)
          //...............................................
        }, {name})
      }
    })
  }
  //-------------------------------------------------------
}
///////////////////////////////////////////////////////////
export default WnDict;
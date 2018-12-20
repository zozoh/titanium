(function(_G){
///////////////////////
if(_G.ti)
  return;    
//.....................
_G.ti = {
  ns : function(fullname, obj) {
    let oldObj = _.get(_G, fullname);
    if(oldObj 
      &&_.isPlainObject(oldObj) 
      && _.isPlainObject(obj)) {
      _.assign(oldObj, obj)
    }else{
      _.set(_G, fullname, obj)
    }
  }
}
///////////////////////
})(this);

// Ti required(Ti.Http)
//---------------------------------------
function URL(actionName) {
  return "/o/" + actionName
}
//---------------------------------------
function AJAX_RETURN(reo) {
  if(!reo.ok) {
    throw reo
  }
  return reo.data;
}
//---------------------------------------
export const WnIo = {
  /***
   * Get object meta by id
   */
  async getById(id) {
    return fetch("id:"+id)
  },
  /***
   * Get object meta by full path
   */
  async fetch(path) {
    let url = URL("fetch")
    let reo = await Ti.Http.get(url, {
      params:{
        str : path
      }, 
      as:"json"})
    return AJAX_RETURN(reo)
  },
  /***
   * Query object
   */
  async find({skip=0, limit=100, sort={}, mine=true, match={}}) {
    let url = URL("query")
    let reo = await Ti.Http.get(url, {
      params: _.assign({}, match, {
        _l  : limit, 
        _o  : skip,
        _me : mine,
        _s  : JSON.stringify(sort)
      }), 
      as:"json"})
    return AJAX_RETURN(reo)
  }
}
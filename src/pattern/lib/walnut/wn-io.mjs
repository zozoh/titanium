// Ti required, you should import it like
// import {Ti} from "./ti.mjs"
//---------------------------------------
function URL(actionName) {
  return "/o/" + actionName
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
    const url = URL("fetch")
    return await Ti.Http.get(url, {
      params:{
        str : path
      }, 
      as:"json"})
  },
  /***
   * Query object
   */
  async query({skip=0, limit=100, sort={}, list=[]}) {
    const url = URL("fetch")
    return await Ti.Http.get(url, {
      params:{
        str : path
      }, 
      as:"json"})
  }
}
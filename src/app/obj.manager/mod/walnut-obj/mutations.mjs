export default {
  reset(state) {
    _.assign(state, {
      "ancestors" : [], 
      "parent" : null, 
      "children" : [],
      "meta": null,
      "content": null,
      "contentType": null
    })
  }
}
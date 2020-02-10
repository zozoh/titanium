////////////////////////////////////////////
export const WnTree = {
  //----------------------------------------
  wrapNode(meta) {
    if(_.isPlainObject(meta)) {
      let node = {
        id : meta.id,
        name : meta.nm,
        meta : meta,
        leaf : 'DIR' != meta.race,
      }
      if(!node.leaf) {
        node.children = []
      }
      if(node.id && node.name) {
        return node
      }
    }
  }
  //----------------------------------------
}
////////////////////////////////////////////
export default WnTree;
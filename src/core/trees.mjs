/*
Tree Node: 
{
  id    : ID,         // Unique in tree
  name  : "xiaobai",  // Unique in parent, root will be ignore
  children : []       // Children Node
}
*/
//////////////////////////////////////
export const TiTrees = {
  //---------------------------------
  path(strOrArray=[]) {
    if(Ti.Util.isNil(strOrArray)) {
      return []
    }
    if(_.isArray(strOrArray))
      return strOrArray
    return _.map(_.without(strOrArray.split("/"), ""), 
      v=>/^\d+$/.test(v)?v*1:v)
  },
  //---------------------------------
  /***
   * @param root{TreeNode} - tree root node
   * @param iteratee{Function} - iteratee for each node
   *   with one argument `({node, path=[], depth=0, parent, ancestors})`.
   *    - node : self node
   *    - path : self path in Array
   *    - depth     : path depth 0 base
   *    - parent    : parentNode
   *    - ancestors : root ... parentNode
   *   It can return `[stop:Boolean, data:Any]`
   *   If return `undefined`, take it as `[null,false]`
   *   Return `true` or `[true]` for break walking and return undefined.
   */
  walkDeep(root, iteratee=()=>({})) {
    // Prepare context
    let context = {
      index     : 0,
      node      : root,
      path      : [],
      depth     : 0,
      parent    : null,
      ancestors : []
    }
    // Define the walking function
    // @c : {node, path, depth}
    const walking = (c)=>{
      // Check current node
      let [data, stop] = _.concat(iteratee(c)||[null,false])
      if(stop)
        return [data, stop]
      // For Children
      if(_.isArray(c.node.children)) {
        let subC = {
          depth     : c.depth + 1,
          parent    : c,
          ancestors : _.concat(c.ancestors, c)
        }
        let index = 0;
        for(let child of c.node.children) {
          [data, stop] = walking({
            index,
            node   : child,
            path   : _.concat(c.path, child.name),
            ...subC
          })
          index ++
          if(stop)
            return [data, stop]
        }
      }
      // Default return
      return []
    }

    // Do walking
    let [re] = walking(context)
    return re
  },
  //---------------------------------
  walkBreadth(root, iteratee=()=>({})) {
    // Prepare context
    let context = {
      index     : 0,
      node      : root,
      path      : [],
      depth     : 0,
      parent    : null,
      ancestors : []
    }
    // Check root node
    let [data, stop] = _.concat(iteratee(context)||[null,false])
    if(stop) {
      return [data, stop]
    }
    // Define the walking function
    // @c : {node, path, depth}
    const walking = (c)=>{
      if(_.isArray(c.node.children)) {
        // save contexts
        let cs = []
        let subC = {
          depth     : c.depth + 1,
          parent    : c,
          ancestors : _.concat(c.ancestors, c)
        }
        let index = 0;
        // For Children Check
        for(let child of c.node.children) {
          let c2 = {
            index,
            node  : child,
            path  : _.concat(c.path, child.name||index),
            ...subC
          }
          let [data, stop] = _.concat(iteratee(c2)||[null,false])
          index++
          if(stop)
            return [data, stop]
          // Save contexts
          cs.push(c2)
        }
        // For Children Deep
        for(let c2 of cs) {
          let [data, stop] = walking(c2)
          if(stop)
            return [data, stop]
        }
      }
      // Default return
      return []
    }

    // Do walking
    let [re] = walking(context)
    return re
  },
  //---------------------------------
  getById(root, nodeId) {
    if(Ti.Util.isNil(nodeId)) {
      return
    }
    return TiTrees.walkDeep(root, (hie)=>{
      if(hie.node.id == nodeId) {
        return [hie, true]
      }
    })
  },
  //---------------------------------
  getByPath(root, strOrArray=[]) {
    // Tidy node path
    let nodePath = TiTrees.path(strOrArray)
    // walking to find
    return TiTrees.walkDeep(root, (hie)=>{
      if(_.isEqual(nodePath, hie.path)) {
        return [hie, true]
      }
    })
  },
  //---------------------------------
  getNodeById(root, nodeId) {
    let hie = TiTrees.getById(root, nodeId)
    if(hie) {
      return hie.node
    }
  },
  //---------------------------------
  getNodeByPath(root, strOrArray=[]) {
    let hie = TiTrees.getByPath(root, strOrArray)
    if(hie) {
      return hie.node
    }
  },
  //---------------------------------
  /***
   * @return Object {
   *   hierarchy : hie,
   *   children  : [],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */ 
  insertBefore(hie, item) {
    // Guard
    if(!hie || _.isUndefined(item))
      return
    
    let pos, children;

    // Normal node -> sibling
    if(hie.parent) {
      children = hie.parent.node.children
      pos = hie.index
    }
    // ROOT -> children
    else {
      children = hie.node.children
      pos = 0
    }
    
    let index = Ti.Util.insertToArray(children, pos, item)
    
    return {
      hierarchy : hie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * @return Object {
   *   hierarchy : hie,
   *   children:[],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */ 
  insertAfter(hie, item) {
    // Guard
    if(!hie || _.isUndefined(item))
      return

    let pos, children;

    // Normal node -> sibling
    if(hie.parent) {
      children = hie.parent.node.children
      pos = hie.index + 1
    }
    // ROOT -> children
    else {
      children = hie.node.children
      pos = -1
    }
    
    let index = Ti.Util.insertToArray(children, pos, item)
    
    return {
      hierarchy : hie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * @return Object {
   *   hierarchy : hie,
   *   children:[],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */ 
  prepend(hie, item) {
    // Guard
    if(!hie || _.isUndefined(item))
      return

    let pos, children;

    // Leaf -> sibling
    if(!_.isArray(hie.node.children)) {
      children = hie.parent.node.children
      pos = hie.index + 1
    }
    // Node -> children
    else {
      children = hie.node.children
      pos = 0
    }
    
    let index = Ti.Util.insertToArray(children, pos, item)
    
    return {
      hierarchy : hie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * @return Object {
   *   hierarchy : hie,
   *   children:[],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */ 
  append(hie, item) {
    // Guard
    if(!hie || _.isUndefined(item))
      return

    let pos, children;

    // Leaf -> sibling
    if(!_.isArray(hie.node.children)) {
      children = hie.parent.node.children
      pos = hie.index
    }
    // Node -> children
    else {
      children = hie.node.children
      pos = 0
    }
    
    let index = Ti.Util.insertToArray(children, pos, item)
    
    return {
      hierarchy : hie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * @return `true` for removed successfully
   */ 
  remove(hie) {
    // Guard
    if(!hie || !hie.parent)
      return

    let nodeIndex = hie.index
    let rms = _.remove(hie.parent.node.children, (v, index)=>index==nodeIndex)

    return rms.length > 0
  },
  //---------------------------------
  /***
   * Get the next candicate node if current is removed
   * 
   * @return Object {
   *   node : {..},  // the node data
   *   path : []     // Path to node parent
   * }
   */
  nextCandidate(hie) {
    if(!hie || !hie.parent) {
      return
    }
    let list = hie.parent.node.children
    let node, path;
    // No sibing, return the parent
    if(list.length <= 1) {
      node = hie.parent.node
      path = !_.isEmpty(hie.parent.path)
        ? hie.parent.path.slice(0, hie.parent.path.length-1)
        : null
    }
    // Try next
    else if((hie.index+1) < list.length) {
      node = list[hie.index + 1]
      path = hie.parent.path
    }
    // Must be prev
    else {
      node = list[hie.index - 1]
      path = hie.parent.path
    }
    // Done
    return {node, path}
  }
  //---------------------------------
}
//////////////////////////////////////
export default TiTrees
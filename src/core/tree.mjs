/*
Tree Node: 
{
  id    : ID,          // Unique in tree
  name  : "xiaobai",   // Unique in parent, root will be ignore
  leaf  : false,  // Leaf or not
  children : []   // Children Node
}
*/
//////////////////////////////////////
export const TiTree = {
  //---------------------------------
  path(strOrArray=[]) {
    if(Ti.Util.isNil(strOrArray)) {
      return []
    }
    if(_.isArray(strOrArray))
      return strOrArray
    return _.without(strOrArray.split("/"))
  },
  //---------------------------------
  /***
   * @param root{TreeNode} - tree root node
   * @param iteratee{Function} - iteratee for each node
   *   with one argument `({node, path=[], depth=0})`.
   *   It can return `[stop:Boolean, data:Any]`
   *   If return `undefined`, take it as `[false]`
   *   Return `true` or `[true]` for break walking and return undefined.
   */
  walkDeep(root, iteratee=()=>({})) {
    // Prepare context
    let context = {
      node  : root,
      path  : [],
      depth : 0
    }
    // Define the walking function
    // @c : {node, path, depth}
    const walking = (c)=>{
      // Check current node
      let [data, stop] = _.concat(iteratee(c)||false)
      if(stop)
        return [data, stop]
      // For Children
      if(!c.node.leaf && _.isArray(c.node.children)) {
        for(let child of c.node.children) {
          [data, stop] = walking({
            node  : child,
            path  : _.concat(c.path, child.name),
            depth : c.depth + 1
          })
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
      node  : root,
      path  : [],
      depth : 0
    }
    // Check root node
    let [data, stop] = _.concat(iteratee(context)||false)
    if(stop) {
      return [data, stop]
    }
    // Define the walking function
    // @c : {node, path, depth}
    const walking = (c)=>{
      if(!c.node.leaf && _.isArray(c.node.children)) {
        // save contexts
        let cs = []
        let depth = c.depth + 1
        // For Children Check
        for(let child of c.node.children) {
          let c2 = {
            node  : child,
            path  : _.concat(c.path, child.name),
            depth
          }
          let [data, stop] = _.concat(iteratee(c2)||false)
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
  getNodeById(root, nodeId) {
    if(Ti.Util.isNil(nodeId)) {
      return null
    }
    return TiTree.walkDeep(root, ({node})=>{
      if(node.id == nodeId) {
        return [node, true]
      }
    })
  },
  //---------------------------------
  getNodeByPath(root, strOrArray=[]) {
    // Tidy node path
    let nodePath = TiTree.path(strOrArray)
    // Just return the root
    if(_.isEmpty(nodePath)) {
      return root
    }
    // walking to find
    return TiTree.walkDeep(root, ({node, path})=>{
      if(_.isEqual(nodePath, path)) {
        return [node, true]
      }
    })
  }
  //---------------------------------
}
//////////////////////////////////////
export default TiTree
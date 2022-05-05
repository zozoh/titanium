/*
Tree Node: 
{
  id    : ID,         // Unique in tree
  name  : "xiaobai",  // Unique in parent, root will be ignore
  children : []       // Children Node
}
*/
//////////////////////////////////////
const TiTrees = {
  //---------------------------------
  path(strOrArray = []) {
    if (Ti.Util.isNil(strOrArray)) {
      return []
    }
    if (_.isArray(strOrArray))
      return strOrArray
    return _.map(_.without(strOrArray.split("/"), ""),
      v => /^\d+$/.test(v) ? v * 1 : v)
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
  walkDeep(root, iteratee = () => ({}), {
    idBy = "id",
    nameBy = "name",
    childrenBy = "children"
  } = {}) {
    let rootId = _.get(root, idBy)
    let rootName = _.get(root, nameBy)
    // Prepare context
    let context = {
      index: 0,
      isFirst: true,
      isLast: true,
      id: rootId,
      name: rootName,
      node: root,
      path: [],
      depth: 0,
      parent: null,
      ancestors: []
    }
    // Define the walking function
    // @c : {node, path, depth}
    const walking = (c) => {
      // Check current node
      let [data, stop] = _.concat(iteratee(c) || [null, false])
      if (stop)
        return [data, stop]
      // For Children
      let children = _.get(c.node, childrenBy)
      if (_.isArray(children)) {
        let subC = {
          depth: c.depth + 1,
          parent: c,
          ancestors: _.concat(c.ancestors, c)
        }
        let index = 0;
        let lastI = children.length - 1
        for (let child of children) {
          let nodeId = _.get(child, idBy)
          let nodeName = _.get(child, nameBy)
          let c2 = {
            index,
            isFirst: 0 == index,
            isLast: lastI == index,
            id: nodeId,
            name: nodeName,
            node: child,
            path: _.concat(c.path, nodeName || index),
            root: context,
            ...subC
          }
          let [data, stop] = walking(c2)
          index++
          if (stop)
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
  walkBreadth(root, iteratee = () => ({}), {
    idBy = "id",
    nameBy = "name",
    childrenBy = "children"
  } = {}) {
    let rootId = _.get(root, idBy)
    let rootName = _.get(root, nameBy)
    // Prepare context
    let context = {
      index: 0,
      isFirst: true,
      isLast: true,
      id: rootId,
      name: rootName,
      node: root,
      path: [],
      depth: 0,
      parent: null,
      ancestors: []
    }
    // Check root node
    let [data, stop] = _.concat(iteratee(context) || [null, false])
    if (stop) {
      return [data, stop]
    }
    // Define the walking function
    // @c : {node, path, depth}
    const walking = (c) => {
      let children = _.get(c.node, childrenBy)
      if (_.isArray(children)) {
        // save contexts
        let cs = []
        let subC = {
          depth: c.depth + 1,
          parent: c,
          ancestors: _.concat(c.ancestors, c)
        }
        let index = 0;
        let lastI = children.length - 1
        // For Children Check
        for (let child of children) {
          let nodeId = _.get(child, idBy)
          let nodeName = _.get(child, nameBy)
          let c2 = {
            index,
            isFirst: 0 == index,
            isLast: lastI == index,
            id: nodeId,
            name: nodeName,
            node: child,
            path: _.concat(c.path, nodeName || index),
            root: context,
            ...subC
          }
          let [data, stop] = _.concat(iteratee(c2) || [null, false])
          index++
          if (stop)
            return [data, stop]
          // Save contexts
          cs.push(c2)
        }
        // For Children Deep
        for (let c2 of cs) {
          let [data, stop] = walking(c2)
          if (stop)
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
  getById(root, nodeId, setup) {
    if (Ti.Util.isNil(nodeId)) {
      return
    }
    return TiTrees.walkDeep(root, (hie) => {
      if (hie.id == nodeId) {
        return [hie, true]
      }
    }, setup)
  },
  //---------------------------------
  getByPath(root, strOrArray = [], setup) {
    // Tidy node path
    let nodePath = TiTrees.path(strOrArray)
    // walking to find
    return TiTrees.walkDeep(root, (hie) => {
      if (_.isEqual(nodePath, hie.path)) {
        return [hie, true]
      }
    }, setup)
  },
  //---------------------------------
  getNodeById(root, nodeId, setup) {
    let hie = TiTrees.getById(root, nodeId, setup)
    if (hie) {
      return hie.node
    }
  },
  //---------------------------------
  getNodeByPath(root, strOrArray = [], setup) {
    let hie = TiTrees.getByPath(root, strOrArray, setup)
    if (hie) {
      return hie.node
    }
  },
  //---------------------------------
  /***
   * 
   * @param hie{Object} 
   * ```
   * {
   *    node : self node
   *    path : self path in Array
   *    depth     : path depth 0 base
   *    parent    : parentNode
   *    ancestors : root ... parentNode
   * }
   * ```
   * @param item{Any}
   * 
   * @return Object {
   *   hierarchy : hie,
   *   children  : [],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */
  insertBefore(hie, item, {
    nameBy = "name",
    childrenBy = "children"
  } = {}) {
    // Guard
    if (!hie || _.isUndefined(item))
      return

    let pos, children;

    // Normal node -> sibling
    if (hie.parent) {
      children = _.get(hie.parent.node, childrenBy)
      pos = hie.index
    }
    // ROOT -> children
    else {
      children = hie.node.children
      pos = 0
    }

    let index = Ti.Util.insertToArray(children, pos, item)
    let itPath = _.cloneDeep(hie.path)
    let itName = _.get(item, nameBy)
    itPath[itPath.length - 1] = itName

    let itHie = {
      index,
      node: item,
      path: itPath,
      depth: hie.depth,
      parent: hie.parent,
      ancestors: hie.ancestors
    }

    return {
      hierarchy: itHie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * @param hie{Object} 
   * ```
   * {
   *    node : self node
   *    path : self path in Array
   *    depth     : path depth 0 base
   *    parent    : parentNode
   *    ancestors : root ... parentNode
   * }
   * ```
   * @param item{Any}
   * 
   * @return Object {
   *   hierarchy : hie,
   *   children:[],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */
  insertAfter(hie, item, {
    nameBy = "name",
    childrenBy = "children"
  } = {}) {
    // Guard
    if (!hie || _.isUndefined(item))
      return

    let pos, children;

    // Normal node -> sibling
    if (hie.parent) {
      children = _.get(hie.parent.node, childrenBy)
      pos = hie.index + 1
    }
    // ROOT -> children
    else {
      children = hie.node.children
      pos = -1
    }

    let index = Ti.Util.insertToArray(children, pos, item)
    let itPath = _.cloneDeep(hie.path)
    let itName = _.get(item, nameBy)
    itPath[itPath.length - 1] = itName

    let itHie = {
      index,
      node: item,
      path: itPath,
      depth: hie.depth,
      parent: hie.parent,
      ancestors: hie.ancestors
    }

    return {
      hierarchy: itHie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * 
   * @param hie{Object} 
   * ```
   * {
   *    node : self node
   *    path : self path in Array
   *    depth     : path depth 0 base
   *    parent    : parentNode
   *    ancestors : root ... parentNode
   * }
   * ```
   * @param item{Any}
   * 
   * @return Object {
   *   hierarchy : hie,
   *   children:[],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */
  prepend(hie, item, {
    nameBy = "name",
    childrenBy = "children",
    autoChildren = false
  } = {}) {
    // Guard
    if (!hie || _.isUndefined(item))
      return

    let pos;
    let children = _.get(hie.node, childrenBy)

    // Leaf -> sibling
    if (!_.isArray(children)) {
      if (autoChildren) {
        children = []
        hie.node.children = children
        pos = 0
      } else {
        children = _.get(hie.parent.node, childrenBy)
        pos = hie.index + 1
      }
    }
    // Node -> children
    else {
      pos = 0
    }

    let index = Ti.Util.insertToArray(children, pos, item)
    let itName = _.get(item, nameBy)
    let itPath = _.concat(itName, hie.path)

    let itHie = {
      index,
      node: item,
      path: itPath,
      depth: hie.depth + 1,
      parent: hie,
      ancestors: _.concat(hie.ancestors, hie)
    }

    return {
      hierarchy: itHie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * 
   * @param hie{Object} 
   * ```
   * {
   *    node : self node
   *    path : self path in Array
   *    depth     : path depth 0 base
   *    parent    : parentNode
   *    ancestors : root ... parentNode
   * }
   * ```
   * @param item{Any}
   * 
   * @return Object {
   *   hierarchy : hie,
   *   children:[],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */
  append(hie, item, {
    nameBy = "name",
    childrenBy = "children",
    autoChildren = false
  } = {}) {
    // Guard
    if (!hie || _.isUndefined(item))
      return

    let pos;
    let children = _.get(hie.node, childrenBy)

    // Leaf -> sibling
    if (!_.isArray(children)) {
      if (autoChildren) {
        children = []
        hie.node.children = children
        pos = 0
      } else {
        children = _.get(hie.parent.node, childrenBy)
        pos = hie.index
      }
    }
    // Node -> children
    else {
      pos = 0
    }

    let index = Ti.Util.insertToArray(children, pos, item)
    let itName = _.get(item, nameBy)
    let itPath = _.concat(hie.path, itName)

    let itHie = {
      index,
      node: item,
      path: itPath,
      depth: hie.depth + 1,
      parent: hie,
      ancestors: _.concat(hie.ancestors, hie)
    }

    return {
      hierarchy: itHie,
      children, item, index
    }
  },
  //---------------------------------
  /***
   * 
   * @param hie{Object} 
   * ```
   * {
   *    node : self node
   *    path : self path in Array
   *    depth     : path depth 0 base
   *    parent    : parentNode
   *    ancestors : root ... parentNode
   * }
   * ```
   * @param item{Any}
   * 
   * @return Object {
   *   hierarchy : hie,
   *   children:[],  // hie.parent.children, after changed
   *   item,   // item
   *   index   // the position of `item` in children
   * })
   */
  replace(hie, item, {
    nameBy = "name",
    childrenBy = "children"
  } = {}) {
    // Guard
    if (!hie || !hie.parent || _.isUndefined(item))
      return

    let children = _.get(hie.parent.node, childrenBy)
    children[hie.index] = item

    let itPath = _.cloneDeep(hie.path)
    let itName = _.get(item, nameBy)
    itPath[itPath.length - 1] = itName

    let itHie = {
      index: hie.index,
      node: item,
      path: itPath,
      depth: hie.depth,
      parent: hie.parent,
      ancestors: hie.ancestors
    }

    return {
      hierarchy: itHie,
      children, item,
      index: hie.index
    }
  },
  //---------------------------------
  /***
   * @return `true` for removed successfully
   */
  remove(hie, {
    childrenBy = "children"
  } = {}) {
    // Guard
    if (!hie || !hie.parent)
      return

    let nodeIndex = hie.index
    let children = _.get(hie.parent.node, childrenBy)
    let rms = _.remove(children, (v, index) => index == nodeIndex)

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
    if (!hie || !hie.parent) {
      return
    }
    let list = hie.parent.node.children
    let node, path;
    // No sibing, return the parent
    if (list.length <= 1) {
      node = hie.parent.node
      path = !_.isEmpty(hie.parent.path)
        ? hie.parent.path.slice(0, hie.parent.path.length - 1)
        : null
    }
    // Try next
    else if ((hie.index + 1) < list.length) {
      node = list[hie.index + 1]
      path = hie.parent.path
    }
    // Must be prev
    else {
      node = list[hie.index - 1]
      path = hie.parent.path
    }
    // Done
    return { node, path }
  },
  //---------------------------------
  movePrev(hie, {
    childrenBy = "children"
  } = {}) {
    // Guard: the first item
    if (hie.isFirst) {
      return
    }
    // Guard: empty parent
    let children = _.get(hie.parent.node, childrenBy)
    if (_.isEmpty(children)) {
      return
    }
    // Switch with the prev
    let i0 = hie.index
    let i1 = hie.index - 1
    let it = hie.node
    children[i0] = children[i1]
    children[i1] = it
  },
  //---------------------------------
  moveNext(hie, {
    childrenBy = "children"
  } = {}) {
    // Guard: the last item
    if (hie.isLast) {
      return
    }
    // Guard: empty parent
    let children = _.get(hie.parent.node, childrenBy)
    if (_.isEmpty(children)) {
      return
    }
    // Switch with the prev
    let i0 = hie.index
    let i1 = hie.index + 1
    let it = hie.node
    children[i0] = children[i1]
    children[i1] = it
  },
  //---------------------------------
  moveOut(hie, {
    childrenBy = "children"
  } = {}) {
    // Guard: Root/Top Node
    if (hie.depth <= 1) {
      return
    }
    // Get the children of hie parent
    let children = _.get(hie.parent.node, childrenBy)
    let pChildren = _.get(hie.parent.parent.node, childrenBy)

    // Get item
    let it = hie.node
    // Insert after parent
    let pos = hie.parent.index
    pChildren.splice(pos + 1, 0, it)

    // Remove self
    children.splice(hie.index, 1)
  },
  //---------------------------------
  moveInto(hie, {
    childrenBy = "children"
  } = {}) {
    // Guard: Root/Top Node
    if (hie.isFirst) {
      return
    }
    // Get the prev item
    let children = _.get(hie.parent.node, childrenBy)
    let prev = children[hie.index - 1]
    // Make prev children
    let prevChildren = _.get(prev, childrenBy)
    if (!prevChildren) {
      prevChildren = []
      _.set(prev, childrenBy, prevChildren)
    }

    // Join to prev children
    let it = hie.node
    prevChildren.push(it)
    //console.log(hie)

    // Remove self
    children.splice(hie.index, 1)
  }
  //---------------------------------
}
//////////////////////////////////////
export const Trees = TiTrees
export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    treeRoot  : null,
    myCurrentId : null,
    myLoadingNodeId : null,
    myOpenedNodePaths : {}
  }),
  ////////////////////////////////////////////////////
  props : {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "meta" : {
      type : Object,
      default : undefined
    },
    "idBy" : {
      type : String,
      default : "id"
    },
    "nameBy" : {
      type : String,
      default : "nm"
    },
    "referBy" : {
      type : String,
      default : "pid"
    },
    "childrenBy" : {
      type : String,
      default : "children"
    },
    "sortBy" : {
      type : Object,
      default : ()=>({nm:1})
    },
    //------------------------------------------------
    // Behavior
    //------------------------------------------------
    "autoOpen"   : undefined,
    "showRoot"   : undefined,
    "multi"      : undefined,

    "nodeCheckable"  : undefined,
    "nodeSelectable" : undefined,
    "nodeOpenable"   : undefined,
    "nodeCancelable" : undefined,
    "nodeHoverable"  : undefined,

    "checkable"  : undefined,
    "selectable" : undefined,
    "openable"   : undefined,
    "cancelable" : undefined,
    "hoverable"  : undefined,

    "onNodeSelect" : undefined,

    // Local store to save the tree open status
    "keepOpenBy" : {
      type : String,
      default : undefined
    },
    "keepCurrentBy" : {
      type : String,
      default : undefined
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "display" : {
      type : [String, Object, Array],
      default : ()=>[{
        key : ['race', 'tp', 'mime', 'icon'],
        transformer : Ti.Icons.evalIcon,
        comType : "ti-icon"
      }, "title|nm"]
    },
    "spacing" : undefined,
    "border"  : undefined,
    "loadingNode" : {
      type : Object,
      default : ()=>({
        title : "i18n:loading"
      })
    },
    "emptyNode" : {
      type : Object,
      default : ()=>({
        icon  : "fas-braille",
        title : "i18n:empty-data"
      })
    },
    //------------------------------------------------
    // Measure
    //------------------------------------------------
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //------------------------------------------------
    isNodeLoading() {
      return ({id})=>{
        return id == this.myLoadingNodeId
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnTreeInit($tree) {
      this.$tree = $tree
    },
    //------------------------------------------------
    OnTreeOpenedStatusChange(openedPath) {
      this.myOpenedNodePaths = _.omitBy(openedPath, v=>!v)
      if(this.keepOpenBy) {
        Ti.Storage.session.setObject(this.keepOpenBy, openedPath)
      }
    },
    //------------------------------------------------
    OnNodeSelect({currentId}) {
      this.myCurrentId = currentId
      if(this.keepCurrentBy) {
        Ti.Storage.session.set(this.keepCurrentBy, currentId)
      }
      return false
    },
    //------------------------------------------------
    async OnNodeOpened({id, leaf, path, rawData}) {
      let hie = this.getHierarchyById(id)
      if(hie) {
        // console.log(hie)
        // Not need reload
        if(!_.isEmpty(_.get(hie.node, this.childrenBy))) {
          return
        }
        
        // Do reload
        await this.openNode(hie)
      }
    },
    //------------------------------------------------
    async replaceNode(obj) {
      let nodeId = _.get(obj, this.idBy)
      let hie = this.getHierarchyById(nodeId)

      // Guard
      if(!hie)
        return

      //console.log(hie)
      // Keep the exists children
      let oldPathId = hie.path.join("/")
      let children = _.get(hie.node, this.childrenBy)
      if(!_.isEmpty(children)) {
        _.set(obj, this.childrenBy, children)
      }

      // Replace in tree and redraw
      Ti.Trees.replace(hie, obj)

      // Remove the opened path
      hie = this.getHierarchyById(nodeId)
      let openeds = {}
      _.forEach(this.myOpenedNodePaths, (v, k)=> {
        if(v) {
          if(k == oldPathId) {
            k = hie.path.join("/")
          }
          openeds[k] = true
        }
      })

      // soft redraw
      if(!_.isEqual(openeds, this.myOpenedNodePaths)) {
        this.myOpenedNodePaths = openeds
      }
      // Force redraw
      else {
        await this.$tree.evalTreeTableData()
      }
    },
    //------------------------------------------------
    getHierarchyById(id, root=this.treeRoot) {
      return Ti.Trees.getById(root, id, {nameBy:this.nameBy})
    },
    //------------------------------------------------
    getHierarchyByPath(path, root=this.treeRoot) {
      return Ti.Trees.getByPath(root, path, {nameBy:this.nameBy})
    },
    //------------------------------------------------
    getcloseNodesByPath(path) {
      let pathId = _.isArray(path) ? path.join("/") : path
      let openeds = {}
      _.forEach(this.myOpenedNodePaths, (v, k)=>{
        if(v && k.length > pathId.length && k.startsWith(pathId)) {
          return
        }
        if(v) {
          openeds[k] = true
        }
      })
      return openeds
    },
    //------------------------------------------------
    selectNodeById(id) {
      this.$tree.selectNodeById(id)
    },
    //--------------------------------------
    isOpened(rowOrId) {
      return this.$tree.isOpened(rowOrId)
    },
    //--------------------------------------
    closeRow(rowOrId) {
      this.$tree.closeRow(rowOrId)
    },
    //------------------------------------------------
    selectNodeByPath(path) {
      let hie = this.getHierarchyByPath(path)
      if(hie) {
        this.$tree.selectNodeById(hie.id)
      }
    },
    //------------------------------------------------
    async openNodeById(id) {
      let hie = this.getHierarchyById(id)
      if(hie) {
        return await this.openNode(hie)
      }
    },
    //------------------------------------------------
    async openNodeByPath(id) {
      let hie = this.getHierarchyByPath(path)
      if(hie) {
        return await this.openNode(hie)
      }
    },
    //------------------------------------------------
    async openNode({id, node, path}) {
      // Show loading
      this.myLoadingNodeId = id
      await this.$tree.evalTreeTableData()

      // Do reload
      await this.reloadChildren(node)
      this.myLoadingNodeId = null

      // Closed the children nodes
      let pathId = Ti.Trees.path(path).join("/")
      let openeds = this.getcloseNodesByPath(pathId)
      openeds[pathId] = true

      // soft redraw
      if(!_.isEqual(openeds, this.myOpenedNodePaths)) {
        this.myOpenedNodePaths = openeds
      }
      // Force redraw
      else {
        await this.$tree.evalTreeTableData()
      }
    },
    //------------------------------------------------
    async reloadChildren(obj) {
      // Get the parent refer value
      let prVal = _.get(obj, this.idBy)
      if(Ti.Util.isNil(prVal))
        return

      // Reload top 
      let query = {
        skip: 0, limit: 0, sort: this.sortBy, mine:true,
        match : {
          [this.referBy] : prVal
        }
      }
      let {list} = await Wn.Io.find(query)
      //_.set(obj, this.childrenBy, list);
      this.$set(obj, this.childrenBy, list)
    },
    //------------------------------------------------
    async quietOpenNode(path=[], node=this.treeRoot) {
      if('DIR' != node.race)
        return

      if(_.isEmpty(path))
        return
      let nodeName = _.first(path)
      let hie = this.getHierarchyByPath(nodeName, node)
      // Need to load the children
      if(!hie) {
        await this.reloadChildren(node)
        // fetch again
        hie = this.getHierarchyByPath(nodeName, node)
      }

      // The child is lost
      if(!hie)
        return

      // Load the sub-level
      let subPath = path.slice(1)

      // Just open current node
      if(_.isEmpty(subPath)) {
        await this.reloadChildren(hie.node)
      }
      // Recur
      else {
        await this.quietOpenNode(subPath, hie.node)
      }
    },
    //------------------------------------------------
    async deleteNodeById(id, confirm) {
      let hie = this.getHierarchyById(id)
      if(hie) {
        return await this.deleteNode(hie, confirm)
      }
    },
    //------------------------------------------------
    async deleteNodeByPath(path, confirm) {
      let hie = this.getHierarchyByPath(path)
      if(hie) {
        return await this.deleteNode(hie, confirm)
      }
    },
    //------------------------------------------------
    async deleteNode(hie, confirm) {
      // Confirm
      if(confirm) {
        if(_.isBoolean(confirm)) {
          confirm = {
            text : "i18n:wn-del-confirm",
            vars : {N:1}
          }
        }
        if(!(await Ti.Confirm(confirm, {type:"warn"}))) {
          return
        }
      }

      // Get the condidate
      let can = Ti.Trees.nextCandidate(hie)

      // Remove the object
      let cmdText = `rm -rf 'id:${hie.id}'`
      await Wn.Sys.exec(cmdText)

      // Get pareth path
      let pPath = hie.path.slice(0, hie.path.length-1)
      await this.reloadNodeByPath(pPath)

      // Tip user
      await Ti.Toast.Open({
        position : "top",
        content  : "i18n:wn-del-ok",
        vars  : {N:1},
        type  : "info"
      })

      // Highlight next
      if(can) {
        let nextNodeId = _.get(can.node, this.idBy)
        _.delay(()=>{
          this.selectNodeById(nextNodeId)
        }, 200)
      }
    },
    //------------------------------------------------
    async reloadNodeById(id) {
      let hie = this.getHierarchyById(id)
      if(hie) {
        return await this.reloadNode(hie)
      }
    },
    //------------------------------------------------
    async reloadNodeByPath(path) {
      let hie = this.getHierarchyByPath(path)
      if(hie) {
        return await this.reloadNode(hie)
      }
    },
    //------------------------------------------------
    async reloadNode({id, node, path}) {
      // Show loading
      this.myLoadingNodeId = id
      await this.$tree.evalTreeTableData()

      // Do reload
      await this.reloadChildren(node)
      this.myLoadingNodeId = null

      // Closed the children nodes
      let openeds = this.getcloseNodesByPath(path)

      // soft redraw
      if(!_.isEqual(openeds, this.myOpenedNodePaths)) {
        this.myOpenedNodePaths = openeds
      }
      // Force redraw
      else {
        await this.$tree.evalTreeTableData()
      }
    },
    //------------------------------------------------
    async reload() {
      // Guard
      if(!this.meta)
        return

      // Make tree root
      let root = _.cloneDeep(this.meta)

      // Load children
      await this.reloadChildren(root)

      // Open the node 
      let openPathIds = Ti.Util.truthyKeys(this.myOpenedNodePaths)
      for(let pathId of openPathIds) {
        let path = Ti.Trees.path(pathId)
        await this.quietOpenNode(path, root)
      }

      // Check the currentId
      if(this.myCurrentId) {
        // is it already loaded ?
        let hie = this.getHierarchyById(this.myCurrentId, root)

        // if not exists try to reload
        if(!hie) {
          // Load ancestors 
          let ans = await Wn.Io.loadAncestors(`id:${this.myCurrentId}`)
          
          // find the first index of 
          let index = 0
          let homeId = _.get(this.meta, this.idBy)
          for(; index<ans.length; index++) {
            let an = ans[index]
            if(_.get(an, this.idBy) == homeId) {
              break
            }
          }

          // Get the path
          let currentPath = []
          for(index++; index<ans.length; index++) {
            let an = ans[index]
            currentPath.push(_.get(an, this.nameBy))
          }

          // Open to it
          await this.quietOpenNode(currentPath, root)

          // Make sure current is opened
          let openeds = {}
          for(let i=1; i<=currentPath.length; i++) {
            openeds[currentPath.slice(0, i).join("/")] = true
          }
          this.myOpenedNodePaths = _.defaults({}, this.myOpenedNodePaths, openeds)
        }

        // Restore the current node
        _.delay(()=>{
          this.$tree.selectNodeById(this.myCurrentId)
        }, 300)
      }

      // set to data
      this.treeRoot = root
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "meta" : {
      handler : function(newVal, oldVal) {
        if(!_.isEqual(newVal, oldVal)) {
          this.reload()
        }
      },
      immediate : true
    }
  },
  ////////////////////////////////////////////////////
  created: function() {
    if(this.keepCurrentBy) {
      this.myCurrentId = Ti.Storage.session.getString(this.keepCurrentBy)
    }
    if(this.keepOpenBy) {
      this.myOpenedNodePaths = Ti.Storage.session.getObject(this.keepOpenBy)
    }
  }
  ////////////////////////////////////////////////////
}
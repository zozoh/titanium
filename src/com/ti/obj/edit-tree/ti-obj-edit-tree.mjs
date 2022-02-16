/////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  data: () => ({
    myCurrentId: undefined,
    myCheckedIds: []
  }),
  ///////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: [Object, String],
      default: undefined
    },
    "newNodeData": {
      type: Object,
      default: undefined
    },
    "idBy": {
      type: [String, Function],
      default: "id"
    },
    "nameBy": {
      type: [String, Function],
      default: "name"
    },
    "childrenBy": {
      type: [String, Function],
      default: "children"
    },
    "leafBy": {
      type: [String, Object, Function],
      default: () => ({
        "children": ""
      })
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "actions": {
      type: Array,
      default: () => [
        "create",
        "|", "remove",
        "|", "up", "down",
        "|", "left", "right"
      ]
    },
    "nodeForm": {
      type: Object,
      default: () => ({
        fields: [
          {
            title: "ID",
            name: "id",
            comConf: {
              editable: true
            }
          },
          {
            title: "Name",
            name: "name",
            comType: "TiInput"
          }
        ]
      })
    },
    "treeConf": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    // value should be prop of ti-loading
    "loadingAs": {
      type: Object,
      default: undefined
    },
    "loading": {
      type: Boolean,
      default: false
    }
  },
  ///////////////////////////////////////////////////
  computed: {
    //-----------------------------------------------
    TreeData() {
      if (_.isString(this.value)) {
        return JSON.parse(this.value)
      }
      return this.value || {}
    },
    //-----------------------------------------------
    TreeHieSetup() {
      return {
        idBy: this.idBy,
        nameBy: this.nameBy,
        childrenBy: this.childrenBy,
        autoChildren: true
      }
    },
    //-----------------------------------------------
    hasCurrent() {
      return this.myCurrentId ? true : false
    },
    //-----------------------------------------------
    hasChecked() {
      return !_.isEmpty(this.myCheckedIds)
    },
    //-----------------------------------------------
    CurrentNodeData() {
      if (this.hasCurrent) {
        let hie = Ti.Trees.getById(this.TreeData, this.myCurrentId, this.TreeHieSetup)
        if (hie) {
          return hie.node
        }
      }
    },
    //-----------------------------------------------
    ActionItems() {
      let items = []
      for (let li of this.actions) {
        // Maybe quick action item
        if (_.isString(li)) {
          let it = ({
            "create": {
              name: "create",
              text: "i18n:create",
              icon: "zmdi-plus",
              eventName: "do:create"
            },
            "remove": {
              name: "remove",
              icon: "far-trash-alt",
              enabled: {
                "hasChecked": true
              },
              eventName: "do:remove"
            },
            "|": {},
            "up": {
              name: "move_up",
              icon: "fas-long-arrow-alt-up",
              enabled: {
                "hasChecked": true
              },
              eventName: "do:move:up"
            },
            "down": {
              name: "move_down",
              icon: "fas-long-arrow-alt-down",
              enabled: {
                "hasChecked": true
              },
              eventName: "do:move:down"
            },
            "left": {
              name: "move_up",
              icon: "fas-long-arrow-alt-left",
              enabled: {
                "hasChecked": true
              },
              eventName: "do:move:left"
            },
            "right": {
              name: "move_down",
              icon: "fas-long-arrow-alt-right",
              enabled: {
                "hasChecked": true
              },
              eventName: "do:move:right"
            }
          })[li]
          if (it) {
            items.push(it)
          }
        }
        // Pure action item
        else {
          items.push(li)
        }
      }
      return items;
    },
    //-----------------------------------------------
    GUILayout() {
      return {
        type: "cols",
        border: true,
        blocks: [
          {
            type: "rows",
            border: true,
            size: "62%",
            blocks: [
              {
                name: "actions",
                size: ".43rem",
                body: "actions"
              },
              {
                name: "tree",
                body: "tree"
              }
            ]
          },
          {
            title: "i18n:properties",
            name: "node",
            body: "node"
          }
        ]
      }
    },
    //-----------------------------------------------
    GUISchema() {
      return {
        "actions": {
          comType: "TiActionbar",
          comConf: {
            style: {
              padding: "0 .04rem"
            },
            items: this.ActionItems,
            status: {
              "hasCurrent": this.hasCurrent,
              "hasChecked": this.hasChecked
            }
          }
        },
        "tree": {
          comType: "TiTree",
          comConf: _.assign(
            {
              checkable: false,
              multi: false,
              autoOpen: false,
              defaultOpenDepth: 2
            },
            this.treeConf,
            {
              data: this.TreeData,
              puppetMode: true,
              currentId: this.myCurrentId,
              checkedIds: this.myCheckedIds,
              idBy: this.idBy,
              nameBy: this.nameBy,
              childrenBy: this.childrenBy,
              leafBy: this.leafBy,
              onInit: ($tree) => {
                this.$tree = $tree
              }
            }
          )
        },
        "node": {
          comType: "TiForm",
          comConf: _.assign({}, this.nodeForm, {
            data: this.CurrentNodeData,
            autoShowBlank: true
          })
        }
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    OnSelectTreeNode(payload) {
      console.log("OnSelectTreeNode", payload)
      let { currentId, checkedIds, current } = payload
      this.myCurrentId = currentId
      this.myCheckedIds = checkedIds
    },
    //-----------------------------------------------
    OnMetaFieldChange() { },
    //-----------------------------------------------
    OnMetaChange(item) {
      console.log(item)
      // Get Node
      let data = _.cloneDeep(this.TreeData)
      let hie = Ti.Trees.getById(data, this.myCurrentId, this.TreeHieSetup)
      // Update the root node
      if (hie.depth == 0) {
        item.children = data.children
        data = item
      }
      // Update the tree node
      else {
        Ti.Trees.replace(hie, item, this.TreeHieSetup)
      }

      // Tell change
      this.tryNotifyChange(data)

      // Try to update current ID
      this.$nextTick(() => {
        let itemId = item[this.idBy]
        this.$tree.selectNodeById(itemId)
      })
    },
    //-----------------------------------------------
    OnMoveUpTreeNode() {
      let data = _.cloneDeep(this.TreeData)
      let hie = this.getCurrentHie(data)
      if (!hie) {
        return
      }
      // Guard: for root
      if (0 == hie.depth || !hie.parent) {
        return
      }
      // Guard: for first node
      if (hie.index == 0) {
        return
      }
      // swith to prev
      let children = _.get(hie.parent.node, this.childrenBy)
      let i1 = hie.index - 1
      let n0 = hie.node
      let n1 = children[i1]
      children[hie.index] = n1
      children[i1] = n0
      // Tell change
      this.tryNotifyChange(data)
    },
    //-----------------------------------------------
    OnMoveDownTreeNode() {
      let data = _.cloneDeep(this.TreeData)
      let hie = this.getCurrentHie(data)
      if (!hie) {
        return
      }
      // Guard: for root
      if (0 == hie.depth || !hie.parent) {
        return
      }
      // Guard: for last node
      let children = _.get(hie.parent.node, this.childrenBy)
      let lastI = children.length - 1
      if (hie.index >= lastI) {
        return
      }
      // swith to prev
      let i1 = hie.index + 1
      let n0 = hie.node
      let n1 = children[i1]
      children[hie.index] = n1
      children[i1] = n0
      // Tell change
      this.tryNotifyChange(data)
    },
    //-----------------------------------------------
    OnMoveLeftTreeNode() {
      let data = _.cloneDeep(this.TreeData)
      let hie = this.getCurrentHie(data)
      if (!hie) {
        return
      }
      // Guard: for root or top
      if (hie.depth <= 1 || !hie.parent) {
        return
      }
      
      console.log("MoveLeft:", hie)
      
      // Then try move left
      let { parent, node } = hie

      // Remove current node
      Ti.Trees.remove(hie)

      // Insert current node after parent
      let grandpa = parent.parent
      let uncles = _.get(grandpa.node, this.childrenBy)
      let pos = parent.index + 1
      Ti.Util.insertToArray(uncles, pos, node)

      // Tell change
      this.tryNotifyChange(data)
    },
    //-----------------------------------------------
    OnMoveRightTreeNode() {
      let data = _.cloneDeep(this.TreeData)
      let hie = this.getCurrentHie(data)
      if (!hie) {
        return
      }
      // Guard: for root or the first node
      if (hie.depth == 0 || !hie.parent || hie.index == 0) {
        return
      }
      //console.log("MoveRight:", hie)

      // Check prev node, and it must be group
      let children = _.get(hie.parent.node, this.childrenBy)
      let prevNode = children[hie.index - 1]
      let prevId = _.get(prevNode, this.idBy)
      let node = hie.node
      let prevHie = this.getTreeHie(data, prevId)

      // prev must be group
      if(!prevHie || this.$tree.isNodeLeaf(prevNode)) {
        return
      }

      // Remove current node
      Ti.Trees.remove(hie)

      // Insert current node after parent
      Ti.Trees.append(prevHie, node, this.TreeHieSetup)
      this.$tree.openRow(prevId)

      // Tell change
      this.tryNotifyChange(data)
    },
    //-----------------------------------------------
    OnCreateTreeNode() {
      // Auto Gen a node ID
      let newNodeId = Ti.Random.str(8)

      // Then create the node
      this.createTreeNode(newNodeId);
    },
    //-----------------------------------------------
    createTreeNode(newNodeId) {
      let data = _.cloneDeep(this.TreeData)

      // Get the node
      let hie;
      let opened;
      // Default use the root node
      if (!this.myCurrentId) {
        hie = Ti.Trees.getByPath(data, "/", this.TreeHieSetup)
        opened = true
      } else {
        hie = Ti.Trees.getById(data, this.myCurrentId, this.TreeHieSetup)
        opened = this.$tree.isOpened(this.myCurrentId)
      }
      let { depth, leaf } = hie

      // Prepare new node
      let newNode = _.assign({
        [this.idBy]: newNodeId,
        [this.nameBy]: Ti.I18n.get("new-item")
      }, this.newNodeData)

      // Root node, append to last child
      // Group node, if opened, append to last child too.
      if (0 == depth || (opened && !leaf)) {
        Ti.Trees.append(hie, newNode, this.TreeHieSetup)
      }
      // closed group node or leaf node, insert after it
      else {
        Ti.Trees.insertAfter(hie, newNode, this.TreeHieSetup)
      }

      // Then tell the change
      this.tryNotifyChange(data)

      // Switch to new node
      this.$tree.selectNodeById(newNodeId)
    },
    //-----------------------------------------------
    removeTreeNode(nodeId) {
      // Guard
      if (!nodeId) {
        return
      }
      // Find node
      let data = _.cloneDeep(this.TreeData)
      let hie = Ti.Trees.getById(data, nodeId, this.TreeHieSetup)
      if (!hie) {
        console.warn(`Fail to found treeNode [${nodeId}]`)
        return
      }
      // Get next candidate
      let next = Ti.Trees.nextCandidate(hie)
      console.log("next:", next)

      // Remove
      Ti.Trees.remove(hie)
      this.tryNotifyChange(data)

      // Try to select next
      if (next && next.node) {
        let nextNodeId = _.get(next.node, this.idBy)
        if (nextNodeId) {
          this.$tree.selectNodeById(nextNodeId)
        }
      }

    },
    //-----------------------------------------------
    tryNotifyChange(data = {}) {
      if (!_.isEqual(data, this.TreeData)) {
        this.$notify("change", data)
      }
    },
    //-----------------------------------------------
    getCurrentHie(treeData = this.TreeData) {
      if (this.hasCurrent) {
        return this.getTreeHie(treeData)
      }
    },
    //-----------------------------------------------
    getTreeHie(treeData = this.TreeData, nodeId = this.myCurrentId) {
      if (this.hasCurrent) {
        return Ti.Trees.getById(treeData, nodeId, this.TreeHieSetup)
      }
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
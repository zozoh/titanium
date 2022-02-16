/////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  data: () => ({
    myCurrentId: undefined,
    myCheckedIds: [],
    myCurrent: undefined,
    myNode: undefined
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
        "create", "|", "remove", "|", "up", "down"
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
        childrenBy: this.childrenBy
      }
    },
    //-----------------------------------------------
    hasCurrent() {
      return this.currentId ? true : false
    },
    //-----------------------------------------------
    hasChecked() {
      return !_.isEmpty(this.myCheckedIds)
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
              checkable: true,
              multi: true,
              autoOpen: true,
              defaultOpenDepth: 3
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
              leafBy: this.leafBy
            }
          )
        },
        "node": {
          comType: "TiForm",
          comConf: _.assign({}, this.nodeForm, {
            data: this.myCurrent,
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
      //console.log(payload)
      let { currentId, checkedIds, current, node } = payload
      this.myCurrent = current
      this.myCurrentId = currentId
      this.myCheckedIds = checkedIds
      this.myNode = node
    },
    //-----------------------------------------------
    OnCreateTreeNode() {
      let node = this.myNode
      // Default use the root node
      if (!node) {
        let hie = Ti.Trees.getByPath(this.TreeData, "/", this.TreeHieSetup)
        node = {
          id: hie.id,
          name: hie.name,
          leaf: false,
          indent: hie.depth,
          opened: true,
          path: hie.path,
          pathId: '/',
          rawData: hie.node
        }
      }
      console.log(node)
      // Auto Gen a node ID
      let newNodeId = Ti.Random.str(8)

      // Then create the node
      this.createTreeNode(node, newNodeId);
    },
    //-----------------------------------------------
    createTreeNode(node = {}, newNodeId) {
      let { indent, leaf, opened, path } = node
      let data = _.cloneDeep(this.TreeData)

      // Get the node
      let hie = Ti.Trees.getByPath(data, path, this.TreeHieSetup);

      // Prepare new node
      let newNode = _.assign({
        [this.idBy]: newNodeId,
        [this.nameBy]: Ti.I18n.get("new-item")
      }, this.newNodeData)

      // Root node, append to last child
      // Group node, if opened, append to last child too.
      if (0 == indent || (opened && !leaf)) {
        Ti.Trees.append(hie, newNode, this.TreeHieSetup)
      }
      // closed group node or leaf node, insert after it
      else {
        Ti.Trees.insertAfter(hie, newNode, this.TreeHieSetup)
      }

      // Then tell the change
      this.tryNotifyChange(data)
    },
    //-----------------------------------------------
    tryNotifyChange(data = {}) {
      if (!_.isEqual(data, this.TreeData)) {
        this.$notify("change", data)
      }
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
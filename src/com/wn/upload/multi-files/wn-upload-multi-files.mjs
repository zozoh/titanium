const _M = {
  /////////////////////////////////////////
  data: () => ({
    myFileObjs: {},
    myUploadFiles: [],
    myUploadProgress: {},
    myUploadDone: {}
  }),
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: Array,
      default: () => []
    },
    // raw value is WnObj
    // If declare the valueType
    // It will transform the WnObj
    // to relaitve value mode
    "valueType": {
      type: String,
      default: "idPath",
      validator: (v) => /^(obj|path|fullPath|idPath|id)$/.test(v)
    },
    "query": {
      type: Object,
      default: () => ({
        /*
        path:"~/xxxx",
        match: {...},
        limit: 100,
        skip: 0,
        sort: {nm:1}
      */
      })
    },
    // Auto append the extra-meta after file been uploaded
    "fileMeta": {
      type: Object
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "sortable": {
      type: Boolean,
      default: true
    },
    // support remove the objects
    "removable": {
      type: Boolean,
      default: true
    },
    "limit": {
      type: Number,
      default: 0
    },
    // Indicate the upload target when upload new value
    // Of cause, if the `value` exists, replace it
    // The `target` must be a path to a image object,
    // it will auto transfrom the image format by `cmd_imagic`
    "target": {
      type: String,
      default: null
    },
    // which type supported to upload
    // nulll or empty array will support any types
    "supportTypes": {
      type: [String, Array],
      default: () => []
      //default : ()=>["png","jpg","jpeg","gif"]
    },
    "minFileSize": {
      type: Number,
      default: 0
    },
    "maxFileSize": {
      type: Number,
      default: 0
    },
    // which mime supported to upload
    // nulll or empty array will support any mimes
    "supportMimes": {
      type: [String, Array],
      default: () => []
      //default : ()=>["image/png","image/jpeg","image/gif"]
    },
    // Image object only: it will auto apply image filter
    // just like clip the image size etc..
    // @see cmd_imagic for more detail about the filter
    "filter": {
      type: [Array, String],
      default: null
    },
    // Image object only: if `>0 and <=1` mean output quality
    // if not match the range, will depends on the `cmd_imagic` default
    "quality": {
      type: Number,
      default: 0
    },
    "readonly": {
      type: Boolean,
      default: false
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "textBy": {
      type: [String, Function],
      default: "title|nm"
    },
    "showItemText": {
      type: Boolean,
      default: true
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "itemWidth": {
      type: [Number, String],
      default: undefined
    },
    "itemHeight": {
      type: [Number, String],
      default: undefined
    },
    "previewStyle": {
      type: Object
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    AcceptTypes() {
      if (_.isString(this.supportTypes)) return this.supportTypes.split(",");
      return this.supportTypes;
    },
    //--------------------------------------
    AcceptMimes() {
      if (_.isString(this.supportMimes)) return this.supportMimes.split(",");
      return this.supportMimes;
    },
    //--------------------------------------
    ImageFilter() {
      if (!this.filter) return [];
      return [].concat(this.filter);
    },
    //--------------------------------------
    isQueryMode() {
      return this.query && this.query.path ? true : false;
    },
    //--------------------------------------
    LocalFileFilter() {
      return (file) => {
        //................................
        // Check file size
        let fileSize = file.size;
        if (this.minFileSize > 0 && fileSize < this.minFileSize) {
          return {
            ok: false,
            msg: Ti.I18n.textf("i18n:wn-invalid-fsize-min", {
              minSize: Ti.S.sizeText(this.minFileSize),
              fileSize: Ti.S.sizeText(fileSize)
            })
          };
        }
        if (this.maxFileSize > 0 && fileSize >= this.maxFileSize) {
          return {
            ok: false,
            msg: Ti.I18n.textf("i18n:wn-invalid-fsize-max", {
              maxSize: Ti.S.sizeText(this.maxFileSize),
              fileSize: Ti.S.sizeText(fileSize)
            })
          };
        }
        //................................
        // Check for support Types
        let type = Ti.Util.getSuffixName(file.name, true);
        let re = this.checkTypeInGivenList(
          this.AcceptTypes,
          type,
          "i18n:wn-invalid-types",
          {
            current: type,
            supports: this.AcceptTypes.join(", ")
          }
        );
        if (!re.ok) return re;
        //................................
        // Check for support mimes
        return this.checkTypeInGivenList(
          this.AcceptMimes,
          file.type,
          "i18n:wn-invalid-mimes",
          {
            current: file.type,
            supports: this.AcceptMimes.join(", ")
          }
        );
      };
    },
    //--------------------------------------
    GetObjText() {
      if (_.isFunction(this.textBy)) {
        return this.textBy;
      }
      if (_.isString(this.textBy)) {
        return (obj) => {
          return Ti.Util.getOrPickNoBlank(obj, this.textBy);
        };
      }
      return (obj = {}) => {
        return obj.title || obj.nm || obj.id;
      };
    },
    //--------------------------------------
    hasItems() {
      return !_.isEmpty(this.FileItems);
    },
    //--------------------------------------
    // Display image for <ti-thumb>
    FileItems() {
      let list = [];
      //
      // Join remote items
      //
      if (this.isQueryMode) {
        _.forEach(this.myFileObjs, (obj) => {
          let it = this.genFileItem(obj);
          list.push(it);
        });
      }
      // Value Mode
      else {
        for (let val of this.value) {
          let obj = this.myFileObjs[val];
          if (obj) {
            let it = this.genFileItem(obj);
            list.push(it);
          }
        }
      }
      //
      // Uploaded item
      //
      list.push(...this.myUploadFiles);
      // Done
      return list;
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnOpen({ link } = {}) {
      if (link) {
        await Ti.Be.Open(link);
      }
    },
    //--------------------------------------
    async OnDownload({ id } = {}) {
      if (id) {
        let link = Wn.Util.getDownloadLink({ id });
        await Ti.Be.Open(link);
      }
    },
    //--------------------------------------
    async OnRemove({ index, id } = {}) {
      //console.log("remove", index, id)
      // The value should obey the `valueType` prop
      // but it can indicate if the item is obj or just local
      if (id) {
        await Wn.Sys.exec2(`rm id:${id}`);
      }

      // Query mode just reload
      if (this.isQueryMode) {
        await this.reloadByQuery();
      }
      // Update value
      else {
        let val = _.filter(this.value, (it, i) => {
          return i != index;
        });

        // Notify the change
        this.$notify("change", val);
      }
    },
    //--------------------------------------
    async OnClean() {
      //console.log("Do onclean");
      let cmds = [];
      _.forEach(this.FileItems, ({ id, value } = {}) => {
        if (value) {
          cmds.push(`rm id:${id}`);
        }
      });
      //console.log(cmds);
      if (_.isEmpty(cmds)) {
        return;
      }
      let cmdText = cmds.join(";");
      await Wn.Sys.exec2(cmdText);
      // Query mode just reload
      if (this.isQueryMode) {
        await this.reloadByQuery();
      }
      // Update value: Notify the Change
      else {
        this.$notify("change", null);
      }
    },
    //--------------------------------------
    setFileObj(key, obj = null) {
      if (key && obj && obj.id) {
        let objs = _.cloneDeep(this.myFileObjs);
        objs[key] = obj;
        this.myFileObjs = objs;
      }
    },
    //--------------------------------------
    setUploadProgress(id, progress = 0) {
      let pr = _.cloneDeep(this.myUploadProgress);
      pr[id] = Math.min(1, progress);
      this.myUploadProgress = pr;
    },
    //--------------------------------------
    setUploadDone(id, done = true) {
      let ud = _.cloneDeep(this.myUploadDone);
      ud[id] = done;
      this.myUploadDone = ud;
    },
    //--------------------------------------
    async OnUploadFiles(files = []) {
      // Guard
      if (!_.isEmpty(this.myUploadFiles)) {
        return await Ti.Toast.Open("file uploading, please try later!", "warn");
      }
      // Guard: no target
      if (!this.target) {
        return await Ti.Toast.Open("i18n:nil-target", "warn");
      }

      let list = _.map(files, (f) => f);

      // Add to upload list
      let uploadItems = [];
      for (let i = 0; i < list.length; i++) {
        let li = list[i];
        uploadItems.push({
          id: `UP-${i}`,
          file: li,
          index: i
        });
      }

      this.myUploadFiles = uploadItems;
      this.myUploadProgress = {}; // {"UP-0":.387, "UP-1": 1}
      this.myUploadDone = {};

      // Upload each file
      let newVals = [];
      for (let it of uploadItems) {
        let val = await this.uploadOneFile(it);
        newVals.push(val);
      }

      // Clean
      this.myUploadFiles = [];
      this.myUploadProgress = {};
      this.myUploadDone = {};

      // Notify Change
      let val = _.concat(this.value || [], newVals);
      this.$notify("change", val);
    },
    //--------------------------------------
    checkTypeInGivenList(list, str, invalidMsg, vars) {
      if (!_.isEmpty(list)) {
        let invalid = true;
        for (let li of list) {
          if (li == str) {
            invalid = false;
            break;
          }
        }
        if (invalid) {
          return {
            ok: false,
            msg: Ti.I18n.textf(invalidMsg, vars)
          };
        }
      }
      return { ok: true };
    },
    //--------------------------------------
    async uploadOneFile(uploadItem = {}) {
      let { id, file } = uploadItem;
      let uploadDone = _.get(this.myUploadDone, id);

      // Guard
      if (uploadDone) {
        return;
      }
      //................................
      // Eval the target
      let type = Ti.Util.getSuffixName(file.name, true);
      let vars = {
        type,
        name: file.name,
        majorName: Ti.Util.getMajorName(file.name)
      };
      //................................
      // Prepare customized file meta
      // Merge them to vars, then we can make target path more-dyna
      _.assign(vars, this.fileMeta);
      let taPath = Ti.S.renderBy(this.target, vars);

      //................................
      // Upload file to destination
      this.setUploadProgress(id);

      let { ok, msg, data } = await Wn.Io.uploadFile(file, {
        target: taPath,
        mode: "r",
        progress: (pe) => {
          let progress = pe.loaded / pe.total;
          this.setUploadProgress(id, progress);
        }
      });

      //................................
      // Mark done
      this.setUploadProgress(id, 100);

      //................................
      // Fail to upload
      if (!ok) {
        await Ti.Alert(`i18n:${msg}`, {
          type: "warn",
          icon: "zmdi-alert-triangle"
        });
        return;
      }

      //................................
      // Extra-file-meta
      if (!_.isEmpty(this.fileMeta)) {
        let fileMeta = Ti.Util.explainObj(vars, this.fileMeta);
        let metaJson = JSON.stringify(fileMeta);
        let cmdText = `o id:${data.id} @update @json -cqn`;
        data = await Wn.Sys.exec2(cmdText, { input: metaJson, as: "json" });
      }

      //................................
      // do Filter
      if (!_.isEmpty(this.ImageFilter)) {
        let cmd = [
          "imagic",
          `id:${data.id}`,
          `-filter "${this.ImageFilter.join(" ")}"`
        ];
        if (this.quality > 0 && this.quality <= 1) {
          cmd.push(`-qa ${this.quality}`);
        }
        cmd.push("-out inplace");
        let cmdText = cmd.join(" ");
        await Wn.Sys.exec2(cmdText);
      }

      //................................
      // Transform value
      let val = Wn.Io.formatObjPath(data, this.valueType);

      //................................
      // Save obj
      this.setUploadDone(id, true);
      this.setFileObj(val, data);

      //................................
      return val;
    },
    //--------------------------------------
    genFileItem(obj) {
      let oid = _.get(obj, "id");
      let val = Wn.Io.formatObjPath(obj, this.valueType);
      let it = {
        id: oid,
        key: oid || val,
        value: val
      };
      //..................................
      // Gone
      if (!obj) {
        it.icon = {
          type: "font",
          value: "fas-birthday-cake",
          opacity: 0.382,
          fontSize: ".16rem"
        };
      }
      //..................................
      // Image
      else if (Wn.Obj.isMime(obj, /^(image\/)/)) {
        let ss = ["/o/content?str=id:", obj.id];
        it.src = ss.join("");
      }
      //..................................
      // Video
      else if (Wn.Obj.isMime(obj, /^(video\/)/)) {
        let ss = ["/o/content?str=id:", obj.video_cover];
        it.src = ss.join("");
      }
      //..................................
      // Others just get the icon font
      else {
        it.icon = Wn.Util.getObjIcon(obj);
      }
      //..................................
      // Add link
      if (obj) {
        it.link = Wn.Util.getAppLink(obj);
        it.href = it.link ? it.link.toString() : undefined;
        if (this.showItemText) {
          it.text = this.GetObjText(obj);
        }
      }
      return it;
    },
    //--------------------------------------
    async reloadByQuery() {
      //console.log("reloadByQuery", this.query);
      let {
        path = this.target,
        match = {},
        limit = 0,
        skip = 0,
        sort = { nm: 1 }
      } = this.query;
      let oP = await Wn.Io.loadMeta(path);
      if (!oP) {
        return;
      }

      // process Command
      let cmdText = [
        `o 'id:${oP.id}' @query`,
        `-pager -limit ${limit} -skip ${skip}`,
        `-sort '${JSON.stringify(sort)}'`,
        "@json -cqnl"
      ].join(" ");
      let reo = await Wn.Sys.exec2(cmdText, {
        as: "json",
        input: JSON.stringify(match)
      });

      // Load each obj
      let objs = {};
      _.forEach(reo.list, (obj) => {
        let key = Wn.Io.formatObjPath(obj, this.valueType);
        objs[key] = obj;
      });

      // update state
      this.myFileObjs = objs;
    },
    //--------------------------------------
    async reloadByValue() {
      //console.log("reloadByValue", this.value);
      // Guard
      if (_.isEmpty(this.value)) {
        return;
      }
      // Load each obj
      let objs = {};
      for (let val of this.value) {
        let obj = await Wn.Io.loadObjAs(val, this.valueType);
        objs[val] = obj;
      }
      this.myFileObjs = objs;
    },
    //--------------------------------------
    async reload() {
      if (this.isQueryMode) {
        await this.reloadByQuery();
      } else {
        await this.reloadByValue();
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "query": function (newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.reload();
      }
    },
    "value": function () {
      this.reload();
    }
  },
  //////////////////////////////////////////
  mounted: async function () {
    await this.reload();
  }
  //////////////////////////////////////////
};
export default _M;

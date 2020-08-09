export default {
  ///////////////////////////////////////////////////////
  props : {
    "value": {
      type: Object,
      default: undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    hasVideo() {
      return this.value ? true : false
    },
    //---------------------------------------------------
    VideoCoverURL() {
      return _.get(this.value, "coverURL")
    },
    //---------------------------------------------------
    FormFields() {
      return [{
        title : "VideoID",
        name  : "videoId"
      }, {
        title : "Title",
        name  : "title"
      }, {
        title : "CateName",
        name  : "cateName"
      }, {
        title : "Description",
        name  : "description"
      }, {
        title : "Duration",
        name  : "duration"
      }, {
        title : "RegionId",
        name  : "regionId"
      }, {
        title : "Size",
        name  : "size"
      }, {
        title : "Status",
        name  : "status"
      }, {
        title : "Tags",
        name  : "tags"
      // }, {
      //   title : "AuditStatus",
      //   name  : "auditStatus"
      // }, {
      //   title : "DownloadSwitch",
      //   name  : "downloadSwitch"
      // }, {
      //   title : "PreprocessStatus",
      //   name  : "preprocessStatus"
      }, {
        title : "CreateTime",
        name  : "createTime"
      }, {
        title : "ModifyTime",
        name  : "modifyTime"
      }]
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    OnClickPreview(){
      this.$notify("preview", this.value)
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
const _M = {
  // Relative meta
  "meta": {
    type: [Object, String],
    default: null
  },
  // Delcare the media src mode
  //  - path : nil meta(~/xxx/xxx); with meta(../xxx/xxx)
  //  - fullPath : "/home/xiaobai/xxx/xxx"
  //  - idPath : "id:67u8..98a1"
  //  - id   : "67u8..98a1"
  // 'transferMediaSrc' can take more customized form
  "mediaSrcMode": {
    type: String,
    default: "path",
    validator: v => /^(path|fullPath|idPath|id)$/.test(v)
  },
  // Keep the last select media
  "keepLastBy": {
    type: String,
    default: "wn-markdown-richeditor-last-open"
  },
  "defaultMediaDir": {
    type: String,
    default: "~"
  }
}
export default _M;
/******************************************************
 * Cheap Markdown Parser and Render
 * 
 * By zozoh @ 2020
 */
///////////////////////////////////////////////////////
class CheapNode {
  //---------------------------------------------------
  constructor(nodeType="Element", parentNode=null) {
    this.nodeType = nodeType
    this.index = 0
    if(parentNode) {
      if(parentNode instanceof CheapNode) {
        parentNode.appendChild(this)
      }
      // Append Document
      else if(parentNode instanceof CheapDocument){
        this.$document = parentNode
      }
    }
  }
  //---------------------------------------------------
  __children() {
    if(!_.isArray(this.children)) {
      this.children = []
    }
    return this.children
  }
  //---------------------------------------------------
  document() {
    if(!this.$document) {
      if(this.parentNode) {
        this.$document = this.parentNode.document()
      }
    }
    return this.$document
  }
  //---------------------------------------------------
  body() {
    return this.document().getBodyElement()
  }
  //---------------------------------------------------
  isElementNode() {return "Element" == this.nodeType}
  isTextNode() {return "Text" == this.nodeType}
  //---------------------------------------------------
  hasChildren() {return !_.isEmpty(this.children)}
  //---------------------------------------------------
  emptyChildren() {
    this.children = []
  }
  //---------------------------------------------------
  getText() {
    let ss = []
    if(this.hasChildren()) {
      for(let child of this.children) {
        ss.push(child.getText())
      }
    }
    return ss.join("")
  }
  //---------------------------------------------------
  getFirstChild() {
    return _.first(this.children)
  }
  //---------------------------------------------------
  getLastChild() {
    return _.last(this.children)
  }
  //---------------------------------------------------
  appendChild(node) {
    node.parentNode = this
    node.$document = this.$document
    let childCount = this.children ? this.children.length : 0
    this.__children().push(node)
    node.index = childCount
    return this
  }
  //---------------------------------------------------
  prependChild(node) {
    node.parentNode = this
    node.$document = this.$document
    this.__children().unshift(node)
    return this
  }
  //---------------------------------------------------
  appendChildren(nodes=[]) {
    for(let nd of nodes) {
      nd.parentNode = this
      nd.$document = this.$document
    }
    let childCount = this.children ? this.children.length : 0
    this.__children().push(...nodes)
    _.forEach(nodes, (node, index)=>{
      node.index = index + childCount
    })
    return this
  }
  //---------------------------------------------------
  prependChildren(nodes=[]) {
    for(let nd of nodes) {
      nd.parentNode = this
      nd.$document = this.$document
    }
    this.__children().unshift(...nodes)
    _.forEach(this.children, (node, index)=>{
      node.index = index
    })
    return this
  }
  //---------------------------------------------------
  treeWalk(depth=0, iteratee=_.identity){
    if(this.hasChildren()){
      for(let child of this.children) {
        child.treeWalk(depth+1, iteratee)
      }
    }
  }
  //---------------------------------------------------
  async joinDelta(delta=[], config) {
    let lastOp;
    if(this.hasChildren()) {
      for(let child of this.children) {
        lastOp = await child.joinDelta(delta, config)
      }
    }
    return lastOp
  }
  //---------------------------------------------------
  toString() {
    let ss = []
    this.treeWalk(0, ({depth, name, value})=>{
      let prefix = depth>0
        ? "|-- "
        : ""
      let display = value.display
        ? `<${value.display}>`
        : ""
      let attrs = value.attrs && !_.isEmpty(value.attrs)
        ? JSON.stringify(value.attrs)
        : ""
      let text = _.isString(value) ? `"${value}"` : ""
      ss.push(`${_.repeat("|   ", depth-1)}${prefix}${name}${display}${attrs}${text}`)
    })
    return ss.join("\n")
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapTextNode extends CheapNode {
  //---------------------------------------------------
  constructor(text="", parentNode=null){
    super("Text", parentNode)
    this.text = text
  }
  //---------------------------------------------------
  getMarkdown() {
    return this.text
  }
  //---------------------------------------------------
  getText() {
    return this.text
  }
  //---------------------------------------------------
  setText(text) {
    this.text = text
  }
  //---------------------------------------------------
  appendText(text) {
    this.text += text
  }
  //---------------------------------------------------
  appendChild(){
    throw "Text canot append child"
  }
  //---------------------------------------------------
  treeWalk(depth=0, iteratee=_.identity) {
    iteratee({
      depth,
      name  : "!TEXT",
      value : this.text.replace("\n", "\\n")
    })
  }
  //---------------------------------------------------
  joinDelta(delta=[], {autoJoinPrev=true}={}) {
    let lastOp = _.last(delta)
    // // Join Text
    if(autoJoinPrev && lastOp && _.isString(lastOp.insert) && !lastOp.attributes) {
      lastOp.insert += this.text
    }
    // New Node
    else {
      lastOp = {insert: this.text}
      delta.push(lastOp)
    }
    return lastOp
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapElement extends CheapNode {
  //---------------------------------------------------
  constructor(tagName="P", display="block", {
    closeBy = "EndTag", // Self | EndTag
    className,
    style = {},   // bold, italic, underline
    attrs = {}
  }={}, parentNode=null) {
    super("Element", parentNode)
    this.tagName = _.toUpper(tagName)
    this.display = _.toLower(display)
    this.className = className
    this.style   = style || {}
    this.attrs   = attrs || {}
    this.closeBy = closeBy
  }
  //---------------------------------------------------
  canSelfClose() {return "Self" == this.closeBy}
  //---------------------------------------------------
  getClassName(asStr=false) {
    if(asStr) {
      if(!_.isEmpty(this.className)) {
        return _.concat(this.className).join(" ")
      }
      return ""
    }
    return this.className
  }
  //---------------------------------------------------
  addClass(... classNames) {
    if(this.className) {
      this.className.push(...classNames)
    } else {
      this.className = _.clone(classNames)
    }
  }
  //---------------------------------------------------
  hasAttrs(){
    return !_.isEmpty(this.attrs)
  }
  //---------------------------------------------------
  getAttr(name, dft) {
    let val = this.attrs[name]
    return _.isUndefined(val)
      ? dft
      : val
  }
  //---------------------------------------------------
  setAttr(name, value=true) {
    if(_.isString(name)) {
      this.attrs[name] = value
    }
    // attr set
    else if(_.isPlainObject(name)) {
      _.assign(this.attrs, name)
    }
    return this
  }
  //---------------------------------------------------
  getRuntimeAttrs() {
    return this.attrs || {}
  }
  //---------------------------------------------------
  async getRuntimeAttr(name, dft, config) {
    let val = await this.getRuntimeAttrs(config)[name]
    return _.isUndefined(val)
      ? dft
      : val
  }
  //---------------------------------------------------
  isAttr(name, value) {
    return this.attrs[name] == value
  }
  //---------------------------------------------------
  hasStyle(){
    return !_.isEmpty(this.style)
  }
  //---------------------------------------------------
  isDisplayAs(regex=/^inline/){
    return regex.test(this.display)
  }
  //---------------------------------------------------
  isDisplayAsInline(){
    return this.isDisplayAs(/^inline/)
  }
  //---------------------------------------------------
  empty() {
    super.emptyChildren()
  }
  //---------------------------------------------------
  appendText(text) {
    new CheapTextNode(text, this)
  }
  //---------------------------------------------------
  setText(text) {
    this.empty()
    this.appendText(text)
  }
  //---------------------------------------------------
  isTag(tagName) {
    if(_.isRegExp(tagName)) {
      return tagName.test(this.tagName)
    }
    return this.tagName == tagName
  }
  //---------------------------------------------------
  async getMarkdown(config) {
    let mds = []
    if(_.isArray(this.children)) {
      for(let nd of this.children){
        let mdSub = await nd.getMarkdown(config)
        mds.push(mdSub)
        // if(nd.isElementNode() 
        //   && !nd.isDisplayAsInline()) {
        //   mds.push("\n")
        // }
      }
    }
    // Remove the Endle "\n\n"
    // if(mds.length>0 && _.last(mds) == "\n") {
    //   mds = _.slice(mds, 0, mds.length-1)
    // }
    return mds.join("")
  }
  //---------------------------------------------------
  setInnerMarkdown(markdown) {
    this.empty()
    this.appendMarkdown(markdown)
  }
  //---------------------------------------------------
  treeWalk(depth=0, iteratee=_.identity) {
    iteratee({
      depth,
      name  : this.tagName,
      value : {
        display: this.display,
        attrs  : this.attrs,
        style  : this.style
      }
    })
    super.treeWalk(depth, iteratee)
  }
  //---------------------------------------------------
  async getOutterHtml(options, depth=0) {
    //console.log("getOutterHtml", this.tagName, depth, options)
    // prefix for indent space
    let prefix = options.indent > 0 && depth>0
          ? _.repeat(" ", options.indent*depth)
          : "";
    // prepare str-buffer to render tag
    let ss = []

    // Block
    if(!this.isDisplayAsInline()){
      ss.push("\n", prefix)
    }

    // TagName
    let tagName = _.toLower(this.tagName)
    ss.push("<", tagName)

    // ClassName
    if(this.className) {
      ss.push(` class="${this.getClassName(true)}"`)
    }

    // Attributes
    let attrs = await this.getRuntimeAttrs(options)
    _.forEach(attrs, (v, k)=>{
      ss.push(` ${k}="${v}"`)
    })

    // Styles
    if(this.hasStyle()){
      ss.push(' style="')
      _.forEach(this.style, (v, k)=>{
        ss.push(`${k}:${v};`)
      })
      ss.push('"')
    }

    // Inner HTML
    let html = await this.getInnerHtml(options, depth+1);

    // Closed if empty
    if(!html) {
      // Self close
      if(this.canSelfClose()) {
        ss.push("/>")
      }
      // Require close tag
      else {
        ss.push("></", tagName, ">")
      }
    }
    // Join children
    else {
      ss.push(">")
      if(this.isDisplayAsInline()) {
        ss.push(html)  
      }
      // Block element
      else {
        ss.push(html)
      }
      // Close tag
      ss.push("</", tagName, ">")
    }
    // done
    return ss.join("")
  }
  //---------------------------------------------------
  async getInnerHtml(options, depth=0) {
    // prepare to html render list
    let html = []
    if(this.hasChildren()){
      for(let nd of this.children){
        // Text Node
        if(nd.isTextNode()) {
          html.push(nd.getText())
        }
        // Element node
        else if(nd.isElementNode()){
          let ndHtml = await nd.getOutterHtml(options, depth)
          html.push(ndHtml)
        }
      }
    }
    return html.join("")
  }
  //---------------------------------------------------
  appendMarkdown(markdown) {
    //console.log("--", markdown)
    //......................................
    // Define the regex
    let reg = '(\\*([^*]+)\\*)'
        + '|(\\*\\*([^*]+)\\*\\*)'
        + '|((?<=(\\s|^))_{1,2}(\\S+)_{1,2}(?=(\\s|$)))'
        + '|(~~([^~]+)~~)'
        + '|(`([^`]+)`)'
        + '|(!\\[([^\\]]*)\\]\\(([^\\)]+)\\))'
        + '|(\\[([^\\]]*)\\]\\(([^\\)]+)\\))'
        + '|(\\[([^\\]]*)\\]\\[([^\\]]+)\\])'
        + '|(https?:\\/\\/[^ ]+)';
    let REG = new RegExp(reg, "g");
    //......................................
    // Prepare matching
    let m;
    let pos = 0;
    //......................................
    // In loop
    while (m = REG.exec(markdown)) {
      // B/EM: __xxx__ or _xxx_
      if (m[5]) {
        let token = m[5]
        // B: __xxx__
        if(token.startsWith("__") && token.endsWith("__")){
          // !Head-Text
          if (pos < m.index) {
            let text = markdown.substring(pos, m.index);
            new CheapTextNode(text, this)
          }
          new CheapBoldElement(this).setText(token.substring(2, token.length-2))
          pos = m.index + m[0].length
        }
        // I: _xxx_
        else if(token.startsWith("_") && token.endsWith("_")){
          // !Head-Text
          if (pos < m.index) {
            let text = markdown.substring(pos, m.index);
            new CheapTextNode(text, this)
          }
          new CheapItalicElement(this).setText(token.substring(1, token.length-1))
          pos = m.index + m[0].length
        }
        // Normal Text
        continue
      }
      //....................................
      // !Head-Text
      if (pos < m.index) {
        let text = markdown.substring(pos, m.index);
        new CheapTextNode(text, this)
      }
      // EM: *xxx*
      if (m[1]) {
        new CheapEmphasisElement(this).setText(m[2])
      }
      // STRONG: **xxx**
      else if (m[3]) {
        new CheapStrongElement(this).setText(m[4])
      }
      // DEL: ~~xxx~~
      else if (m[9]) {
        new CheapDeletedTextElement(this).setText(m[10])
      }
      // CODE: `xxx`
      else if (m[11]) {
        let s2 = m[12]
        new CheapCodeElement(this).setText(s2)
      }
      // IMG or Video: ![](xxxx)
      else if(m[13]) {
        // console.log("found image", m[13], m[0])
        let alt = _.trim(m[14])
        let src = _.trim(m[15])
        let attrs = {src, alt}

        // Customized width/height
        // [100] or [100-50]
        let m2 = /^([\d.]+(px|%|rem|em)?)?(-([\d.]+(px|%|rem|em)?))?(:(.*))?$/.exec(alt);
        if(m2){
          attrs.width  = m2[1]
          attrs.height = m2[4]
          attrs.alt    = m2[7]
        }

        // remove alt if blank
        attrs = _.omitBy(attrs, v => !v)


        // For vidio
        if(/[.](mp4|avi|mov)$/.test(src)){
          new CheapVideoElement(this).setAttr(attrs)
        }
        // For Image
        else {
          new CheapImageElement(this).setAttr(attrs)
        }
      }
      // A: [](xxxx)
      else if (m[16]) {
        let href = m[18]
        let text = m[17]
        let attrs = {href}

        // New Tab
        if(text && text.startsWith("+")){
          attrs.target = "_blank"
          text = _.trim(text.substring(1))
        }

        // Gen tag
        let $an = new CheapAnchorElement(this)
        $an.setAttr(attrs)
        $an.appendText(text || href)
      }
      // A: [][refer]
      else if(m[19]) {
        let refer = m[21]
        let text = m[20]
        let attrs = {refer}

        // New Tab
        if(text && text.startsWith("+")){
          attrs.target = "_blank"
          text = _.trim(text.substring(1))
        }

        // Gen tag
        let $an = new CheapAnchorElement(this)
        $an.setAttr(attrs)
        $an.appendText(text || refer)
      }
      // A: http://xxxx
      else if(m[22]) {
        let href = m[22]
        let $an = new CheapAnchorElement(this)
        $an.setAttr({href, primaryLink:true})
        $an.appendText(href)
      }

      // The move the cursor
      pos = m.index + m[0].length
    } // ~ while (m = REG.exec(str)) {
    //......................................
    // !Tail-Text
    if(pos < markdown.length) {
      let text = markdown.substring(pos)
      new CheapTextNode(text, this)
    }

    //......................................
  } // ~appendMarkdown(markdown)
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapBoldElement extends CheapElement {
  constructor(parentNode=null) {
    super("B", "inline", {}, parentNode)
  }
  getMarkdown(){return `__${super.getMarkdown()}__`}
  joinDelta(delta=[], config){
    let lastOp = super.joinDelta(delta, {autoJoinPrev:false});
    _.set(lastOp, "attributes.bold", true)
    return lastOp
  }
}
class CheapItalicElement extends CheapElement {
  constructor(parentNode=null) {
    super("I", "inline", {}, parentNode)
  }
  getMarkdown(){return `_${super.getMarkdown()}_`}
  joinDelta(delta=[], config){
    let lastOp = super.joinDelta(delta, {autoJoinPrev:false});
    _.set(lastOp, "attributes.italic", true)
    return lastOp
  }
}
class CheapStrongElement extends CheapElement {
  constructor(parentNode=null) {
    super("STRONG", "inline", {}, parentNode)
  }
  getMarkdown(){return `**${super.getMarkdown()}**`}
  joinDelta(delta=[], config){
    let lastOp = super.joinDelta(delta, {autoJoinPrev:false});
    _.set(lastOp, "attributes.bold", true)
    return lastOp
  }
}
class CheapEmphasisElement extends CheapElement {
  constructor(parentNode=null) {
    super("EM", "inline", {}, parentNode)
  }
  getMarkdown(){return `*${super.getMarkdown()}*`}
  joinDelta(delta=[], config){
    let lastOp = super.joinDelta(delta, {autoJoinPrev:false});
    _.set(lastOp, "attributes.italic", true)
    return lastOp
  }
}
class CheapDeletedTextElement extends CheapElement {
  constructor(parentNode=null) {
    super("DEL", "inline", {}, parentNode)
  }
  getMarkdown(){return `~~${super.getMarkdown()}~~`}
  joinDelta(delta=[], config){
    let lastOp = super.joinDelta(delta, {autoJoinPrev:false});
    _.set(lastOp, "attributes.strike", true)
    return lastOp
  }
}
class CheapCodeElement extends CheapElement {
  constructor(parentNode=null) {
    super("CODE", "inline", {}, parentNode)
  }
  getMarkdown(){return `\`${super.getMarkdown()}\``}
  joinDelta(delta=[], config){
    let lastOp = super.joinDelta(delta, {autoJoinPrev:false});
    _.set(lastOp, "attributes.code", true)
    return lastOp
  }
}
class CheapAnchorElement extends CheapElement {
  //---------------------------------------------------
  constructor(parentNode=null) {
    super("A", "inline", {}, parentNode)
  }
  //---------------------------------------------------
  async getMarkdown(){
    let ref  = this.getAttr("refer")
    let href = this.getAttr("href")
    let text = this.getText()
    let newT = this.isAttr("target", "_blank")
    if(href == text){
      return href
    }
    if(newT) {
      text = "+" + text
    }
    if(ref) {
      return `[${text}][${ref}]`
    }
    return `[${text}](${href})`
  }
  //---------------------------------------------------
  async joinDelta(delta=[], config){
    let lastOp = super.joinDelta(delta, {autoJoinPrev:false});
    let attrs = await this.getRuntimeAttrs(config)
    _.set(lastOp, "attributes.link", attrs.href)
    return lastOp
  }
  //---------------------------------------------------
  async getRuntimeAttrs({anchorHref=_.identity}={}) {
    let attrs = _.assign({}, this.attrs)
    // Explain refers
    if(attrs.refer) {
      let href = this.document().getRefer(attrs.refer)
      attrs.href = href
    }
    // Eval to real href
    if(attrs.href) {
      attrs.href = await anchorHref(attrs.href)
    }
    // Done
    return attrs
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapMediaElement extends CheapElement {
  //---------------------------------------------------
  constructor(tagName, display, setup, parentNode=null) {
    super(tagName, display, setup, parentNode)
  }
  //---------------------------------------------------
  async getMarkdown({mediaSrc}){
    let src  = this.getAttr("src")
    // Transfer src
    if(_.isFunction(mediaSrc)) {
      src = await mediaSrc(src)
    }
    // Sizing
    let size = _.without([
      this.getAttr("width",null),
      this.getAttr("height",null)
    ], null)
    let alts = _.without([
      size.join("-"), this.getAttr("alt", "")
    ], "")

    // To markdown mark
    return `![${alts.join(":")}](${src})`
  }
  //---------------------------------------------------
  async joinDelta(delta=[], config){
    let attrs = await this.getRuntimeAttrs(config)
    let src = attrs.src
    let attributes = _.omit(attrs, "src")
    let key = this.isTag("IMG") ? "image" : "video"
    let op = {insert : {[key]:src}}
    if(!_.isEmpty(attributes)) {
      op.attributes = attributes
    }
    delta.push(op)
  }
  //---------------------------------------------------
  async getRuntimeAttrs({mediaSrc}={}) {
    let attrs = _.assign({}, this.attrs)
    // Eval to real src
    if(attrs.src && _.isFunction(mediaSrc)) {
      attrs.src = await mediaSrc(attrs.src)
    }
    // Done
    return attrs
  }
  //---------------------------------------------------
}
class CheapImageElement extends CheapMediaElement {
  constructor(parentNode=null) {
    super("IMG", "inline", {closeBy:"Self"}, parentNode)
  }
}
class CheapVideoElement extends CheapMediaElement {
  constructor(parentNode=null) {
    super("VIDEO", "inline", {
      attrs: {controls:true}
    }, parentNode)
  }
}
///////////////////////////////////////////////////////
class CheapTableElement extends CheapElement {
  constructor(parentNode=null) {
    super("TABLE", "table", {}, parentNode)
  }
  appendMarkdown(markdown) {
    throw "TABLE can't appendMarkdown!!!"
  }
}
///////////////////////////////////////////////////////
class CheapTableHeadElement extends CheapElement {
  constructor(parentNode=null){
    super("THEAD", "table-head", {}, parentNode)
  }
}
///////////////////////////////////////////////////////
class CheapTableBodyElement extends CheapElement {
  constructor(parentNode=null){
    super("TBODY", "table-body", {}, parentNode)
  }
}
///////////////////////////////////////////////////////
class CheapTableRowElement extends CheapElement {
  //---------------------------------------------------
  constructor(parentNode=null) {
    super("TR", "table-row", {}, parentNode)
  }
  //---------------------------------------------------
  appendMarkdown(markdown) {
    // Split Cells
    let ss = _.without(markdown.split("|"), "")
    
    // Gen cells
    for(let s of ss) {
      let $cell = new CheapTableDataCellElement(this)
      $cell.appendMarkdown(s)
    }
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapTableDataCellElement extends CheapElement {
  constructor(parentNode=null){
    super("TD", "table-cell", {}, parentNode)
  }
}
///////////////////////////////////////////////////////
class CheapBlockElement extends CheapElement {
  //---------------------------------------------------
  constructor(tagName, setup, parentNode=null){
    super(tagName, "block", setup, parentNode)
  }
  //---------------------------------------------------
  async getMarkdown(config) {
    let md = await super.getMarkdown(config)
    return md + "\n"
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapListElement extends CheapBlockElement {
  //---------------------------------------------------
  constructor(tagName, parentNode=null){
    super(tagName, {}, parentNode)
  }
  //---------------------------------------------------
  async joinDelta(delta=[], config){
    if(this.hasChildren()) {
      let listType = this.isTag("OL") ? "ordered" : "bullet"
      let lastOp;
      for(let $li of this.children) {
        await $li.joinDelta(delta, config)
        lastOp = _.last(delta)
        if(lastOp.insert.endsWith("\n")){
          lastOp.insert += "\n"
        } else {
          lastOp = {insert:"\n"}
          delta.push(lastOp)
        }
        _.set(lastOp, "attributes.list", listType)
        let indent = $li.getAttr("indent", 0)
        if(indent > 0) {
          _.set(lastOp, "attributes.indent", indent)
        }
      }
      return lastOp
    }
    return _.last(delta)
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapOrderedListElement extends CheapListElement {
  constructor(parentNode=null){
    super("OL", parentNode)
  }
}
///////////////////////////////////////////////////////
class CheapUnorderedListElement extends CheapListElement {
  constructor(parentNode=null){
    super("UL", parentNode)
  }
}
///////////////////////////////////////////////////////
class CheapListItemElement extends CheapElement {
  //---------------------------------------------------
  constructor(parentNode=null){
    super("LI", "block", {},  parentNode)
  }
  //---------------------------------------------------
  async getMarkdown(config) {
    let {
      ulIndent  = 2,
      olIndent  = 3,
    } = config || {}
    let mds = []
    let isUL = this.parentNode.isTag("UL")
    let myTab = isUL ? ulIndent : olIndent
    let indent = this.getAttr("indent", 0)
    let prefix = _.repeat(' ', myTab * indent);
    mds.push(prefix)
    // UL
    if(isUL) {
      let hc = this.getAttr("indent") % 2 == 0 ? "-" : "+"
      mds.push(`${hc} `)
    }
    // OL
    else {
      let ix = 1
      // get parent index seq
      if(this.parentNode) {
        let indexes = this.parentNode._ol_indexes
        if(!indexes) {
          indexes = []
          this.parentNode._ol_indexes = indexes
        }
        ix = _.nth(indexes, indent)
        if(_.isUndefined(ix)) {
          ix = 1
        } else {
          ix ++
        }
        indexes[indent] = ix
      }

      mds.push(`${ix}. `)
    }
    mds.push(await super.getMarkdown(config))
    mds.push("\n")
    return mds.join("")
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapHrElement extends CheapElement {
  //---------------------------------------------------
  constructor(parentNode=null){
    super("HR", "block", {closeBy:"Self"},  parentNode)
  }
  //---------------------------------------------------
  getMarkdown() {
    let len = this.getAttr("len", 16)
    return '\n' + _.repeat('-', len) + '\n'
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapPreformattedTextElement extends CheapElement {
  //---------------------------------------------------
  constructor(parentNode=null){
    super("PRE", "block", {},  parentNode)
  }
  //---------------------------------------------------
  isGFMCode() {
    return this.isAttr("mode", "GFM")
  }
  //---------------------------------------------------
  getCodeType(dft=null) {
    return this.getAttr("type") || dft
  }
  //---------------------------------------------------
  // "xxx" => Text("xxx") + Text("\n")
  // "xxx\n" => Text("xxx") + Text("\n")
  // "xxx\n\n" => Text("xxx") + Text("\n") + Text("\n")
  // "xxx\nxxx" => Text("xxx") + Text("\n") + Text("xxx") + Text("\n")
  addCodeLine(codeLine="") {
    let lines = codeLine.split("\n")
    // Mark sure end by empty line
    if(_.last(lines)) {
      lines.push("")
    }
    // Join sub-text nodes
    for(let line of lines) {
      // \n
      if(!line) {
        new CheapTextNode("\n", this)
      }
      // xxx
      else {
        new CheapTextNode(line, this)
      }
    }
  }
  //---------------------------------------------------
  getMarkdown() {
    let mds = []
    //.................................................
    let prefix = this.isGFMCode() ? "" : "    ";
    if(this.isGFMCode()) {
      mds.push("\n```", this.getCodeType(""), "\n")
    } else {
      mds.push(`\n${prefix}`)
    }
    //.................................................
    if(this.hasChildren()){
      for(let nd of this.children){
        let line = nd.getText()
        if("\n" == line) {
          mds.push("\n")
        } else {
          mds.push(prefix, line)
        }
      }
    }
    //.................................................
    if(this.isGFMCode()) {
      mds.push("```\n")
    } else {
      mds.push(`\n${prefix}`)
    }
    //.................................................
    return mds.join("")
  }
  //---------------------------------------------------
  joinDelta(delta=[], config){
    if(this.hasChildren()){
      for(let nd of this.children){
        let line = nd.getText()
        if("\n" == line) {
          delta.push({insert:"\n", attributes:{"code-block": true}})
        } else {
          delta.push({insert:line})
        }
      }
    }
    // Empty
    else {
      delta.push({insert:"\n", attributes:{"code-block": true}})
    }
    return _.last(delta)
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapBlockQuoteElement extends CheapBlockElement {
  //---------------------------------------------------
  constructor(parentNode=null){
    super("BLOCKQUOTE", {},  parentNode)
  }
  //---------------------------------------------------
  async getMarkdown(config) {
    let mds = ["> "]
    mds.push(await super.getMarkdown(config))
    mds.push("\n")
    return mds.join("")
  }
  //---------------------------------------------------
  async joinDelta(delta=[], config){
    await super.joinDelta(delta, config)
    let lastOp = {insert:"\n", attributes:{blockquote: true}}
    delta.push(lastOp)
    return _.last(delta)
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapSectionHeadingElement extends CheapBlockElement {
  //---------------------------------------------------
  constructor(level=1, parentNode=null){
    super(`H${level}`, {attrs:{level}},  parentNode)
  }
  //---------------------------------------------------
  async getMarkdown(config) {
    let mds = [_.repeat('#', this.getAttr("level", 1))]
    mds.push(" ")
    mds.push(await super.getMarkdown(config))
    mds.push("\n")
    return mds.join("")
  }
  //---------------------------------------------------
  async joinDelta(delta=[], config){
    await super.joinDelta(delta, config)
    let lastOp = {insert:"\n", attributes:{header: this.getAttr("level", 1)}}
    delta.push(lastOp)
    return _.last(delta)
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapParagraphElement extends CheapBlockElement {
  //---------------------------------------------------
  constructor(parentNode=null){
    super("P", "block", {},  parentNode)
  }
  //---------------------------------------------------
  async getMarkdown(config) {
    let md = await super.getMarkdown(config)
    return md + "\n"
  }
  //---------------------------------------------------
  async joinDelta(delta=[], config){
    let lastOp = await super.joinDelta(delta, config)
    if(lastOp && lastOp.insert && _.isString(lastOp.insert) && !lastOp.attributes) {
      if(!lastOp.insert.endsWith("\n"))
        lastOp.insert += "\n"
    }
    // New P
    else {
      lastOp = {insert: "\n"}
      delta.push(lastOp)
    }
    return lastOp
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapBodyElement extends CheapElement {
  //---------------------------------------------------
  constructor(parentNode=null){
    super("BODY", "block", {},  parentNode)
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapDocument {
  //---------------------------------------------------
  constructor(){
    this.$body = new CheapBodyElement(this)
    this.$meta = {}
    this.$refs = {}
  }
  //---------------------------------------------------
  getBodyElement() {
    return this.$body
  }
  //---------------------------------------------------
  getRefer(name, dft) {
    if(_.isUndefined(name)) {
      return this.$refs
    }
    return this.$refs[name] || dft
  }
  //---------------------------------------------------
  setRefer(name, value) {
    let k = _.trim(name)
    let v = _.trim(value)
    this.$refs[k] = v
  }
  //---------------------------------------------------
  getMeta(name, dft) {
    if(_.isUndefined(name)) {
      return this.$meta
    }
    return this.$meta[name] || dft
  }
  //---------------------------------------------------
  setMeta(name, value) {
    let k = _.trim(name)
    let v = _.trim(value)
    this.$meta[k] = v
  }
  //---------------------------------------------------
  setDefaultMeta(metas={}) {
    _.defaults(this.$meta, metas)
  }
  //---------------------------------------------------
  pushMetaValue(name, value) {
    let k = _.trim(name)
    let v = _.trim(value)
    let vs = this.$meta[k]
    if(!_.isArray(vs)) {
      vs = vs ? [vs] : []
      this.$meta[k] = vs
    }
    vs.push(v)
  }
  //---------------------------------------------------
  /***
   * @param mediaSrc{Function}: `F(src, CheapElement)`
   * @param anchorHref{Function}: `F(href, CheapElement)`
   * @param indent{Number}: indent space number
   * 
   * @return document body innerHTML
   */
  async toBodyInnerHtml({
    mediaSrc   = _.identity,
    anchorHref = _.identity,
    indent     = 2
  }={}) {
    return await this.$body.getInnerHtml({
      mediaSrc, anchorHref, indent
    })
  }
  //---------------------------------------------------
  toString() {
    let ss = []
    if(!_.isEmpty(this.$meta)) {
      ss.push(JSON.stringify(this.$meta, null, "   "))
      ss.push(_.repeat('*', 60))
    }

    ss.push(this.$body.toString())

    if(!_.isEmpty(this.$refs)) {
      ss.push(_.repeat('*', 60))
      ss.push(JSON.stringify(this.$refs, null, "   "))
    }

    return ss.join("\n")
  }
  //---------------------------------------------------
  async toMarkdown({
    mediaSrc,
    ulIndent  = 2,
    olIndent  = 3,
  }={}) {
    let md = []
    // Meta
    if(!_.isEmpty(this.$meta)) {
      md.push('---')
      _.forEach(this.$meta, (v, k)=>{
        if(_.isArray(v)) {
          md.push(`${k}:`)
          for(let t of v) {
            md.push(` - ${t}`)
          }
        } else {
          md.push(`${k}: ${v}`)
        }
      })
      md.push('---')
      md.push('\n\n')
    }
    
    // Body
    let mdBody = await this.$body.getMarkdown({
      mediaSrc,
      ulIndent, 
      olIndent
    })
    md.push(mdBody)

    // Refer links
    if(!_.isEmpty(this.$refs)) {
      md.push("\n")
      _.forEach(this.$refs, (v, k)=>{
        md.push(`[${k}]:${v}\n`)
      })
    }
    // done
    return md.join("\n")
  }
  //---------------------------------------------------
  async toDelta(config) {
    let delta = []
    await this.$body.joinDelta(delta, config)
    return delta
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
class CheapBlock {
  //---------------------------------------------------
  constructor({
    indentAsCode = 4,   // how many indent as code block
    tabIndent = 4,      // TAB key indent value
    ulIndent  = 2,
    olIndent  = 3,
  }={}){
    this.indentAsCode = indentAsCode
    this.tabIndent  = tabIndent
    this.ulIndent = ulIndent
    this.olIndent = olIndent
    this.reset()
  }
  //---------------------------------------------------
  isEmpty() {
    return this.$top ? false : true
  }
  //---------------------------------------------------
  reset() {
    this.$top = null
    this.$tbody = null
    this.$li = null
    this.lastPushBlank = false
  }
  //---------------------------------------------------
  getTopAttr(name, dft=undefined) {
    return this.$top ? this.$top.getAttr(name) : dft
  }
  //---------------------------------------------------
  isTopTag(tagName) {
    return this.$top && this.$top.tagName == tagName
  }
  //---------------------------------------------------
  isTopAs(elementClass) {
    return this.$top && elementClass && (this.$top instanceof elementClass)
  }
  //---------------------------------------------------
  pushLine(line="", trimed="") {
    try {
      return this.__do_push_line(line, trimed)
    }
    // Warn
    catch(E) {
      console.error("invalid line:", line)
      throw E
    }
    // mark
    finally {
      this.lastPushBlank = trimed ? false : true
    }
  }
  //---------------------------------------------------
  /***
   * @return {repush, closed}
   */
  __do_push_line(line="", trimed="") {
    let m;  // Matcher result
    //.................................................
    // Count indent
    let space = 0
    let cI = -1
    for(let i=0; i<line.length; i++) {
      let c = line.charAt(i)
      // Remember the pos for indent-code
      if(cI < 0 && space >= this.indentAsCode) {
        cI = i
      }
      // space indent
      if(' ' == c) {
        space ++
      }
      // Tab indent
      else if('\t' == c) {
        space += this.tabIndent
      }
      // Quit
      else {
        break
      }
    }
    //.................................................
    // >>> Pre
    if(this.isTopAs(CheapPreformattedTextElement)) {
      // GFM code
      if(this.$top.isGFMCode()) {
        // Closed
        if("```" == trimed) {
          return {closed:true}
        }
        // Join Code
        else {
          this.$top.addCodeLine(line)
        }
      }
      // Indent code
      else {
        // Still indent code
        if(cI > 0) {
          let codeLine = line.substring(cI)
          this.$top.addCodeLine(codeLine)
        }
        // Quit indent
        else {
          return {repush:true, closed:true}
        }
      }
      return
    }
    //.................................................
    // HR
    if(/^(-{3,}|={3,})$/.test(trimed)) {
      if(!this.isEmpty()) {
        return {closed:true, repush:true}
      }
      this.$top = new CheapHrElement().setAttr({len: trimed.length})
      return {closed:true}
    }
    //.................................................
    // Heading : H1~6
    m = /^(#{1,})[\t ]+(.*)$/.exec(trimed)
    if(m) {
      if(!this.isEmpty()) {
        return {closed:true, repush:true}
      }
      let n = m[1].length
      this.$top = new CheapSectionHeadingElement(n)
      this.$top.appendMarkdown(m[2])
      return {closed:true}
    }
    //.................................................
    // >>> List
    if(this.$li) {
      // Close the list
      if(!trimed) {
        return {closed: this.lastPushBlank}
      }
      //-----------------------------------
      // eval current line
      let start = undefined;
      m = /^(([*+-])|(\d)\.) +(.+)$/.exec(trimed)
      if(m) {
        start = m[3] * 1
      }
      let text = _.trim(trimed.substring(2))
      //-----------------------------------
      let listIndent = !isNaN(start) ? this.olIndent : this.ulIndent
      //-----------------------------------
      // Join Paragraph
      if(_.isUndefined(start)) {
        let $p = new CheapParagraphElement(this.$li)
        $p.appendMarkdown(text)
      }
      // New list item
      else {
        let indent = parseInt(space / listIndent)
        this.$li = new CheapListItemElement(this.$top)
        this.$li.addClass(`li-indent-${indent}`)
        this.$li.setAttr({space, indent})
        this.$li.appendMarkdown(text)
      }
      //-----------------------------------
      return
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++
    // empty block: return true to end the block
    //+++++++++++++++++++++++++++++++++++++++++++++++++
    if(!trimed) {
      return {closed: !this.isEmpty()}
    }
    //.................................................
    // >>> TABLE
    if(this.$tbody) {
      let $row = new CheapTableRowElement(this.$tbody)
      $row.appendMarkdown(trimed)
      return
    }
    //.................................................
    // Indent Code
    if(cI > 0) {
      this.$top = new CheapPreformattedTextElement()
      this.$top.setAttr({mode: "MARKDOWN"})
      let codeLine = line.substring(cI)
      this.$top.addCodeLine(codeLine)
      return
    }
    //.................................................
    // GFM Code
    if(trimed.startsWith("```")) {
      let type = _.trim(trimed.substring(3)) || null
      this.$top = new CheapPreformattedTextElement()
      this.$top.setAttr({
        mode: "GFM", type
      })
      return
    }
    //.................................................
    // BLOCKQUOTE
    if(trimed.startsWith('>')) {
      if(!this.isEmpty()){
        return {repush:true, closed:true}
      }
      this.$top = new CheapBlockQuoteElement()
      let text = _.trim(trimed.substring(1))
      this.$top.appendMarkdown(text)
      return
    }
    //.................................................
    // UL / OL
    m = /^(([*+-])|(\d)\.) +(.+)$/.exec(trimed)
    if(m) {
      if(!this.isEmpty()){
        return {closed:true, repush:true}
      }
      // Create top OL/UL
      let start = m[3] * 1
      // Count the indent
      let listIndent = !isNaN(start) ? this.olIndent : this.ulIndent
      // UL
      if(isNaN(start)) {
        this.$top = new CheapUnorderedListElement()
      }
      // OL 
      else {
        this.$top = new CheapOrderedListElement()
        this.$top.setAttr({start})
      }
      // Append the first list item
      let indent = parseInt(space / listIndent)
      this.$li = new CheapListItemElement(this.$top)
      this.$li.addClass(`li-indent-${indent}`)
      this.$li.setAttr({space, indent})

      // append list item content
      let text = _.trim(trimed.substring(2))
      this.$li.appendMarkdown(text)
      return
    }
    //.................................................
    // TABLE
    if(/^([ |:-]{6,})$/.test(trimed) && !this.isEmpty()) {
      let header = this.$top.getMarkdown()
      this.$top = new CheapTableElement();
      let $thead = new CheapTableHeadElement(this.$top)
      let $h_row = new CheapTableRowElement($thead)
      $h_row.appendMarkdown(header)

      this.$tbody = new CheapTableBodyElement(this.$top)
      return
    }
    //.................................................
    // Normal paragraph
    if(this.isEmpty()) {
      this.$top = new CheapParagraphElement()
    }
    this.$top.appendMarkdown(line)
    //.................................................
  }
  //---------------------------------------------------
}
///////////////////////////////////////////////////////
function parseMarkdown(markdown="") {
  //.................................................
  // Prapare
  let lines   = markdown.split(/\r?\n/)
  let block = new CheapBlock()
  let lastMetaKey = null
  let lnIndex = 0
  //.................................................
  let MdDoc = new CheapDocument()
  //.................................................
  // Find the header
  let inHeader = false
  while(lnIndex < lines.length) {
    let line = lines[lnIndex++]
    let trimed = _.trim(line)
    // Ignore blank line
    if(!trimed) {
      continue
    }
    // Found the head part
    if('---' == trimed) {
      inHeader = true
    }
    // Normal line
    else {
      lnIndex --
    }
    // Always break
    break
  }
  //.................................................
  // Scan header
  while(inHeader && lnIndex < lines.length) {
    let line = lines[lnIndex++]
    let trimed = _.trim(line)
    // Ignore blank line
    if(!trimed) {
      continue
    }
    // Quit header
    if('---' == trimed) {
      inHeader = false
      break
    }
    // Join List
    if(trimed.startsWith("-")) {
      if(lastMetaKey) {
        let v = _.trim(trimed.substring(1))
        MdDoc.pushMetaValue(lastMetaKey, v)
      }
    }
    // Set meta value
    else {
      let [k, ...v] = trimed.split(":")
      MdDoc.setMeta(k, _.trim(v.join(":")))
      lastMetaKey = k
    }
  }
  //.................................................
  // Scan document body
  for(; lnIndex < lines.length; lnIndex++) {
    let line = lines[lnIndex]
    let trimed = _.trim(line)

    // Link Refer 
    let m = /^\[([^\]]+)\]:(.+)$/.exec(trimed)
    if(m) {
      let name  = _.trim(m[1])
      let refer = _.trim(m[2])
      MdDoc.setRefer(name, refer)
      continue
    }

    // Elements
    let {repush, closed} = block.pushLine(line, trimed) || {}

    // Closed block
    if(closed && !block.isEmpty()) {
      MdDoc.$body.appendChild(block.$top)
      block.reset()
    }

    // push again
    if(repush) {
      lnIndex --
    }
  }
  //.................................................
  // Tail Block
  if(!block.isEmpty()){
    MdDoc.$body.appendChild(block.$top)
  }
  //.................................................
  return MdDoc
}
///////////////////////////////////////////////////////
// Delta object please:
// @see https://quilljs.com/docs/delta/
class DeltaHelper {
  //.................................................
  constructor(){
    this.__buf = []
  }
  //.................................................
  isBufEmpty() {
    return _.isEmpty(this.__buf)
  }
  //.................................................
  pushBuf($nd) {
    this.__buf.push($nd)
  }
  //.................................................
  popBuf($el) {
    if($el) {
      $el.appendChildren(this.__buf)
    }
    this.__buf = []
    return $el
  }
  //.................................................
  genInline(attr, text) {
    let $el = new CheapTextNode(text)
    // Code
    if(attr.code) {
      $el = new CheapCodeElement().appendChild($el);
    }
    // B/I/A
    else {
      if(attr.bold) {
        $el = new CheapStrongElement().appendChild($el);
      }
      if(attr.italic) {
        $el = new CheapEmphasisElement().appendChild($el);
      }
      if(attr.link) {
        $el = new CheapAnchorElement()
                  .setAttr({href:attr.link})
                    .appendChild($el);
      }
    }
    return $el
  }
  //.................................................
  genBlock(attr) {
    // List
    if(attr.list) {
      // LI
      let $li = this.popBuf(new CheapListItemElement())
      $li.setAttr({
        indent: attr.indent || 0
      })
      // OL
      if("ordered" == attr.list) {
        return new CheapOrderedListElement().appendChild($li)
      }
      // UL
      return new CheapUnorderedListElement().appendChild($li)
    }
    // Heading
    if(attr.header) {
      return this.popBuf(new CheapSectionHeadingElement(attr.header))
    }
    // BlockQuote
    if(attr.blockquote) {
      return this.popBuf(new CheapBlockQuoteElement())
    }
    // CodeBlock
    if(attr["code-block"]) {
      let $pre = new CheapPreformattedTextElement()
      $pre.setAttr({mode:"GFM"})
      if(this.isBufEmpty()) {
        $pre.addCodeLine("")
      } else {
        _.forEach(this.__buf, $nd => $pre.addCodeLine($nd.getText()))
      }
      this.popBuf()
      return $pre
    }
    // Paragraph
    return this.popBuf(new CheapParagraphElement())
  }
  //.................................................
}
///////////////////////////////////////////////////////
function parseDelta({ops=[]}={}){
  //.................................................
  let MdDoc = new CheapDocument()
  let $body = MdDoc.$body
  //.................................................
  let helper = new DeltaHelper()
  //.................................................
  for(let op of ops) {
    //...............................................
    // Media: Image
    if(op.insert && op.insert.image) {
      let $media = new CheapImageElement()
      $media.setAttr(_.assign({src: op.insert.image}, op.attributes))
      helper.pushBuf($media)
      continue
    }
    // Media: Video
    if(op.insert && op.insert.video) {
      let $media = new CheapVideoElement()
      $media.setAttr(_.assign({src: op.insert.video}, op.attributes))
      helper.pushBuf($media)
      continue
    }
    //...............................................
    let text  = op.insert
    let attr  = op.attributes || {}
    //...............................................
    let I0 = 0
    let I1 = text.indexOf("\n", I0)
    while(I1 >= I0) {
      //.............................................
      // Found "xxx\n"
      if(I1 > I0) {
        let s = text.substring(I0, I1)
        helper.pushBuf(new CheapTextNode(s))
      }
      //.............................................
      // Gen Block
      let $nd = helper.genBlock(attr)
      if($nd) {
        let $last = $body.getLastChild()

        // Join to Last
        if($last && $last.isTag($nd.tagName)
          && !$last.isTag(/^(BLOCKQUOTE|P|H[1-6])$/)) {
          $last.appendChildren($nd.children)
        }
        // Add new
        else {
          $body.appendChild($nd)
        }
      }

      //.............................................
      // Next find
      I0 = I1 + 1
      I1 = text.indexOf("\n", I0)
      //.............................................
    }
    //...............................................
    // Remain part join buffer
    if(I0 < text.length) {
      let s = text.substring(I0)
      let $nd = helper.genInline(attr, s)
      helper.pushBuf($nd)
    }
  }
  //.................................................
  // Clean Buffer
  if(!helper.isBufEmpty()) {
    helper.popBuf(new CheapParagraphElement($body))
  }
  //.................................................
  return MdDoc
}
///////////////////////////////////////////////////////
export const Cheap = {
  parseMarkdown,
  parseDelta
}
///////////////////////////////////////////////////////
// Install to window
if(window) {
  window.Cheap = Cheap
}
///////////////////////////////////////////////////////

const Parchment = Quill.import("parchment")

export class BrBlot extends Parchment.Inline {
  static create(url) {
    let node = super.create();
    
    return node;
  }

  static formats(domNode) {
    return "BR" == domNode.tagName
  }

  format(name, value) {
    if (name === 'breakLine' && value) {
      
    } else {
      super.format(name, value);
    }
  }

  formats() {
    let formats = super.formats();
    formats['breakLine'] = BrBlot.formats(this.domNode);
    return formats;
  }
}
BrBlot.blotName = 'breakLine';
BrBlot.tagName = 'BR';

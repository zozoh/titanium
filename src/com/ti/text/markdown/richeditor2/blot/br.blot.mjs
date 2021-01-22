let Embed = Quill.import('blots/embed');

class BrBlot extends Embed {
  static create() {
    let node = super.create();
    
    return node;
  }

  static formats(domNode) {
    return domNode.getAttribute("md-break")
  }

  format(name, value) {
    if (name !== this.statics.blotName || !value) {
      super.format(name, value);
    } else {
      this.domNode.setAttribute('md-break', true);
    }
  }

}
BrBlot.blotName = 'breakLine';
BrBlot.tagName = 'SPAN';

export {BrBlot}
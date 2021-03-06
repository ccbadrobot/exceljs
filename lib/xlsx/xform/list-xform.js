'use strict';

const utils = require('../../utils/utils');
const BaseXform = require('./base-xform');

const ListXform = (module.exports = function(options) {
  this.tag = options.tag;
  this.count = options.count;
  this.empty = options.empty;
  this.$count = options.$count || 'count';
  this.$ = options.$;
  this.childXform = options.childXform;
  this.maxItems = options.maxItems;
});

utils.inherits(ListXform, BaseXform, {
  prepare(model, options) {
    const childXform = this.childXform;
    if (model) {
      model.forEach(childModel => {
        childXform.prepare(childModel, options);
      });
    }
  },

  render(xmlStream, model) {
    if (model && model.length) {
      xmlStream.openNode(this.tag, this.$);
      if (this.count) {
        xmlStream.addAttribute(this.$count, model.length);
      }

      const childXform = this.childXform;
      model.forEach(childModel => {
        childXform.render(xmlStream, childModel);
      });

      xmlStream.closeNode();
    } else if (this.empty) {
      xmlStream.leafNode(this.tag);
    }
  },

  parseOpen(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.model = [];
        return true;
      default:
        if (this.childXform.parseOpen(node)) {
          this.parser = this.childXform;
          return true;
        }
        return false;
    }
  },
  parseText(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  },
  parseClose(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.push(this.parser.model);
        this.parser = undefined;

        if (this.maxItems && this.model.length > this.maxItems) {
          throw new Error(`Max ${this.childXform.tag} count exceeded`);
        }
      }
      return true;
    }
    return false;
  },
  reconcile(model, options) {
    if (model) {
      const childXform = this.childXform;
      model.forEach(childModel => {
        childXform.reconcile(childModel, options);
      });
    }
  },
});

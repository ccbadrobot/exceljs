'use strict';

const _ = require('../../../utils/under-dash');
const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

const SheetFormatPropertiesXform = (module.exports = function() {});

utils.inherits(SheetFormatPropertiesXform, BaseXform, {
  get tag() {
    return 'sheetFormatPr';
  },

  render(xmlStream, model) {
    if (model) {
      const attributes = {
        defaultRowHeight: model.defaultRowHeight,
        outlineLevelRow: model.outlineLevelRow,
        outlineLevelCol: model.outlineLevelCol,
        'x14ac:dyDescent': model.dyDescent,
      };
      if (_.some(attributes, value => value !== undefined)) {
        xmlStream.leafNode('sheetFormatPr', attributes);
      }
    }
  },

  parseOpen(node) {
    if (node.name === 'sheetFormatPr') {
      this.model = {
        defaultRowHeight: parseFloat(node.attributes.defaultRowHeight || '0'),
        dyDescent: parseFloat(node.attributes['x14ac:dyDescent'] || '0'),
        outlineLevelRow: parseInt(node.attributes.outlineLevelRow || '0', 10),
        outlineLevelCol: parseInt(node.attributes.outlineLevelCol || '0', 10),
      };
      return true;
    }
    return false;
  },
  parseText() {},
  parseClose() {
    return false;
  },
});

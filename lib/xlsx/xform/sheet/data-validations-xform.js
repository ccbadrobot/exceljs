'use strict';

const _ = require('../../../utils/under-dash');
const utils = require('../../../utils/utils');
const BaseXform = require('../base-xform');

function assign(definedName, attributes, name, defaultValue) {
  const value = attributes[name];
  if (value !== undefined) {
    definedName[name] = value;
  } else if (defaultValue !== undefined) {
    definedName[name] = defaultValue;
  }
}
function parseBool(value) {
  switch (value) {
    case '1':
    case 'true':
      return true;
    default:
      return false;
  }
}
function assignBool(definedName, attributes, name, defaultValue) {
  const value = attributes[name];
  if (value !== undefined) {
    definedName[name] = parseBool(value);
  } else if (defaultValue !== undefined) {
    definedName[name] = defaultValue;
  }
}

const DataValidationsXform = (module.exports = function() {});

utils.inherits(DataValidationsXform, BaseXform, {
  get tag() {
    return 'dataValidations';
  },

  render(xmlStream, model) {
    const count = model && Object.keys(model).length;
    if (count) {
      xmlStream.openNode('dataValidations', { count });

      _.each(model, (value, address) => {
        xmlStream.openNode('dataValidation');
        if (value.type !== 'any') {
          xmlStream.addAttribute('type', value.type);

          if (value.operator && value.type !== 'list' && value.operator !== 'between') {
            xmlStream.addAttribute('operator', value.operator);
          }
          if (value.allowBlank) {
            xmlStream.addAttribute('allowBlank', '1');
          }
        }
        if (value.showInputMessage) {
          xmlStream.addAttribute('showInputMessage', '1');
        }
        if (value.promptTitle) {
          xmlStream.addAttribute('promptTitle', value.promptTitle);
        }
        if (value.prompt) {
          xmlStream.addAttribute('prompt', value.prompt);
        }
        if (value.showErrorMessage) {
          xmlStream.addAttribute('showErrorMessage', '1');
        }
        if (value.errorStyle) {
          xmlStream.addAttribute('errorStyle', value.errorStyle);
        }
        if (value.errorTitle) {
          xmlStream.addAttribute('errorTitle', value.errorTitle);
        }
        if (value.error) {
          xmlStream.addAttribute('error', value.error);
        }
        xmlStream.addAttribute('sqref', address);
        (value.formulae || []).forEach((formula, index) => {
          xmlStream.openNode(`formula${index + 1}`);
          if (value.type === 'date') {
            xmlStream.writeText(utils.dateToExcel(formula));
          } else {
            xmlStream.writeText(formula);
          }
          xmlStream.closeNode();
        });
        xmlStream.closeNode();
      });
      xmlStream.closeNode();
    }
  },
  parseOpen(node) {
    switch (node.name) {
      case 'dataValidations':
        this.model = {};
        return true;

      case 'dataValidation':
        this._address = node.attributes.sqref;
        const definedName = node.attributes.type
          ? {
              type: node.attributes.type,
              formulae: [],
            }
          : {
              type: 'any',
            };

        if (node.attributes.type) {
          assignBool(definedName, node.attributes, 'allowBlank');
        }
        assignBool(definedName, node.attributes, 'showInputMessage');
        assignBool(definedName, node.attributes, 'showErrorMessage');

        switch (definedName.type) {
          case 'any':
          case 'list':
          case 'custom':
            break;
          default:
            assign(definedName, node.attributes, 'operator', 'between');
            break;
        }
        assign(definedName, node.attributes, 'promptTitle');
        assign(definedName, node.attributes, 'prompt');
        assign(definedName, node.attributes, 'errorStyle');
        assign(definedName, node.attributes, 'errorTitle');
        assign(definedName, node.attributes, 'error');

        this._definedName = definedName;
        return true;
      case 'formula1':
      case 'formula2':
        this._formula = [];
        return true;

      default:
        return false;
    }
  },
  parseText(text) {
    this._formula.push(text);
  },
  parseClose(name) {
    switch (name) {
      case 'dataValidations':
        return false;
      case 'dataValidation':
        if (!this._definedName.formulae || !this._definedName.formulae.length) {
          delete this._definedName.formulae;
          delete this._definedName.operator;
        }
        this.model[this._address] = this._definedName;
        return true;
      case 'formula1':
      case 'formula2': {
        let formula = this._formula.join('');
        switch (this._definedName.type) {
          case 'whole':
          case 'textLength':
            formula = parseInt(formula, 10);
            break;
          case 'decimal':
            formula = parseFloat(formula);
            break;
          case 'date':
            formula = utils.excelToDate(parseFloat(formula));
            break;
          default:
            break;
        }
        this._definedName.formulae.push(formula);
        return true;
      }
      default:
        return true;
    }
  },
});

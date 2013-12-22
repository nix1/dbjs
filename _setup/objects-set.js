'use strict';

var setPrototypeOf  = require('es5-ext/object/set-prototype-of')
  , d               = require('d/d')
  , PrimitiveSet    = require('observable-set/create-read-only')(
	require('observable-set/primitive')
)
  , serializeObject = require('./serialize/object')
  , defFilterByKey  = require('./utils/define-filter-by-key')

  , keys = Object.keys
  , ObjectsSet;

ObjectsSet = module.exports = function () { PrimitiveSet.call(this); };
setPrototypeOf(ObjectsSet, PrimitiveSet);

ObjectsSet.prototype = Object.create(PrimitiveSet.prototype, {
	constructor: d(ObjectsSet),
	_serialize: d(serializeObject),
	getById: d(function (id) { return this.__setData__[id] || null; }),
	_plainForEach_: d(function (cb/*, thisArg*/) {
		var thisArg = arguments[1];
		keys(this.__setData__).forEach(function (key) {
			cb.call(thisArg, this[key]);
		}, this.__setData__);
	})
});

defFilterByKey(ObjectsSet.prototype);

'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , Observable     = require('observable-value/value')
  , getIdent       = require('../utils/get-ident')
  , proto          = require('../_observable')

  , defineProperties = Object.defineProperties
  , valueDesc = Object.getOwnPropertyDescriptor(Observable.prototype, 'value')
  , ObservableValue;

ObservableValue = module.exports = function (object, pKey, sKey) {
	var desc, prop;
	defineProperties(this, {
		__object__: d('', object),
		__pKey__: d('', pKey),
		__sKey__: d('', sKey),
		__dbId__: d('', object.__id__ + '$' + getIdent(object._keys_[pKey], pKey) +
			'/' + sKey)
	});
	desc = object.__descriptors__[pKey] || object.__descriptorPrototype__;
	prop = desc.__descriptors__[sKey];
	Observable.call(this, prop ? prop._resolveValue_() : undefined);
};
setPrototypeOf(ObservableValue, Observable);

ObservableValue.prototype = Object.create(proto, {
	constructor: d(ObservableValue),
	value: d.gs('', valueDesc.get, function (value) {
		var desc = this.__object__._getDescriptor_(this.__pKey__);
		desc._set_(this.__sKey__, desc._validateSet_(this.__sKey__, value));
	}),
	lastModified: d.gs(function () {
		var desc, prop;
		if (this.__lastModified__ == null) {
			desc = this.__object__.__descriptors__[this.__pKey__] ||
				this.__object__.__descriptorPrototype__;
			prop = desc.__descriptors__[this.__sKey__];
			this.__lastModified__ = prop ? prop.lastModified : 0;
		}
		return this.__lastModified__;
	}),
	getDescriptor: d(function () {
		var data = this.__pKey__
			? this.__object__.__descriptors__[this.__pKey__]
			: this.__object__.__descriptorPrototype__;
		return data.__descriptors__[this.__sKey__] || data.__descriptorPrototype__;
	})
});

'use strict';

var isRegExp       = require('es5-ext/reg-exp/is-reg-exp')
  , mixin          = require('es5-ext/object/mixin')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , DbjsError      = require('../error')

  , defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (db) {
	var RegExpType = db.Base._extend_('RegExp');

	defineProperty(RegExpType, 'prototype', d('', RegExpType.prototype));
	try { mixin(RegExpType, RegExp); } catch (ignore) {}

	defineProperties(RegExpType, {
		is: d(function (value) {
			return (isRegExp(value) && (getPrototypeOf(value) === this.prototype));
		}),
		normalize: d(function (value) {
			if (!isRegExp(value)) {
				try {
					value = RegExp(value);
				} catch (e) {
					return null;
				}
			}
			setPrototypeOf(value, this.prototype);
			return value;
		}),
		validate: d(function (value) {
			if (!isRegExp(value)) {
				try {
					value = RegExp(value);
				} catch (e) {
					throw new DbjsError(value + " is invalid regular expression",
						'INVALID_REGEXP');
				}
			}
			setPrototypeOf(value, this.prototype);
			return value;
		})
	});

	mixin(RegExpType.prototype, RegExp.prototype);
};
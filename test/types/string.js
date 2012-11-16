'use strict';

var isError = require('es5-ext/lib/Error/is-error');

module.exports = function (t, a) {
	var ns = t.create('strtest', { pattern: /^\d+$/, min: 3, max: 7 });

	a(t(undefined), 'undefined', "Undefined");
	a(t(null), 'null', "Null");
	a(t(false), 'false', "Boolean");
	a(t({}), {}.toString(), "Object");
	a(t('foobar'), 'foobar', "String");
	a(t(new String('foobar')), 'foobar', "String object");
	a(t(123), '123', "Number");

	a(ns('23432'), '23432', "Custom");
	a.throws(function () { ns('sdfs'); }, "Custom: Pattern");
	a.throws(function () { ns('12'); }, "Custom: Length min");
	a.throws(function () { ns('1231231231232131'); }, "Custom: Length max");

	return {
		"Is": function (a) {
			a(t.is(undefined), false, "Undefined");
			a(t.is(null), false, "Null");
			a(t.is(false), false, "Boolean");
			a(t.is({}), false, "Object");
			a(t.is('foobar'), true, "String");
			a(t.is(new String('foobar')), false, "String object");
			a(t.is(123), false, "Number");

			a(ns.is('23432'), true, "Custom: Is");
			a(ns.is('sdfs'), false, "Custom: Is: Pattern");
			a(ns.is('12'), false, "Custom: Is: Length min");
			a(ns.is('1231231231232131'), false,
				"Custom: Is: Length max");
		},
		"Normalize": function (a) {
			a(t.normalize(undefined), 'undefined', "Undefined");
			a(t.normalize(null), 'null', "Null");
			a(t.normalize(false), 'false', "Boolean");
			a(t.normalize({}), {}.toString(), "Object");
			a(t.normalize('foobar'), 'foobar', "String");
			a(t.normalize(new String('foobar')), 'foobar', "String object");
			a(t.normalize(123), '123', "Number");

			a(ns.normalize('23432'), '23432', "Custom: Normalize");
			a(ns.normalize('sdfs'), null, "Custom: Normalize: Pattern");
			a(ns.normalize('12'), null, "Custom: Normalize: Length min");
			a(ns.normalize('1231231231232131'), null,
				"Custom: Normalize: Length max");
		},
		"Validate": function (a) {
			a(t.validate(undefined), undefined, "Undefined");
			a(t.validate(null), undefined, "Null");
			a(t.validate(false), undefined, "Boolean");
			a(t.validate({}), undefined, "Object");
			a(t.validate('foobar'), undefined, "String");
			a(t.validate(new String('foobar')), undefined, "String object");
			a(t.validate(123), undefined, "Number");

			a(ns.validate('23432'), undefined, "Custom: Validate");
			a(isError(ns.validate('sdfs')), true, "Custom: Validate: Pattern");
			a(isError(ns.validate('12')), true, "Custom: Validate: Length min");
			a(isError(ns.validate('1231231231232131')), true,
				"Custom: Validate: Length max");
		}
	};
};

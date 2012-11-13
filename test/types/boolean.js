'use strict';

require('../../lib/types/base');

module.exports = function (t, a) {
	a(t(undefined), false, "Undefined");
	a(t(null), false, "Null");
	a(t(false), false, "Boolean (primitive)");
	a(t(new Boolean(false)), false, "Boolean (object)");
	a(t({}), true, "Object");
	a(t('false'), true, "False string");
	a(t(''), false, "Empty string");
	a(t('0'), true, "Other false string");
	a(t(0), false, "Zero");
	return {
		"Normalize": function (a) {
			a(t.normalize(undefined), false, "Undefined");
			a(t.normalize(null), false, "Null");
			a(t.normalize(false), false, "Boolean (primitive)");
			a(t.normalize(new Boolean(false)), false, "Boolean (object)");
			a(t.normalize({}), true, "Object");
			a(t.normalize('false'), true, "False string");
			a(t.normalize(''), false, "Empty string");
			a(t.normalize('0'), true, "Other false string");
			a(t.normalize(0), false, "Zero");
		},
		"Validate": function (a) {
			a(t.validate(undefined), false, "Undefined");
			a(t.validate(null), false, "Null");
			a(t.validate(false), false, "Boolean (primitive)");
			a(t.validate(new Boolean(false)), false, "Boolean (object)");
			a(t.validate({}), true, "Object");
			a(t.validate('false'), true, "False string");
			a(t.validate(''), false, "Empty string");
			a(t.validate('0'), true, "Other false string");
			a(t.validate(0), false, "Zero");
		}
	};
};
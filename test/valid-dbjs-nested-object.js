'use strict';

var Database = require('../');

module.exports = function (t, a) {
	var db = new Database(), obj = new db.Object(), desc, item;

	a.throws(function () { t(); }, TypeError, "Undefined");
	a.throws(function () { t(null); }, TypeError, "Null");
	a.throws(function () { t('raz'); }, TypeError, "String");
	a.throws(function () { t(2342); }, TypeError, "Number");
	a.throws(function () { t(new Date()); }, TypeError, "Date");
	a.throws(function () { t(new db.DateTime()); }, TypeError,
		"Date out of database");
	a.throws(function () { t({}); }, TypeError, "Plain object");
	a.throws(function () { t(obj); }, TypeError, "Db object");
	obj.$getOwn('foo').nested = true;
	a(t(obj.foo), obj.foo, "Nested");
	a.throws(function () { t(obj.foo, new db.Object()); }, TypeError,
		"Nested: Different owner");
	a(t(obj.foo, obj), obj.foo, "Nested: Different owner");
	desc = obj.$getOwn('test');
	a.throws(function () { t(desc); }, TypeError, "Db descriptor");
	desc = desc.$getOwn('raz');
	a.throws(function () { t(desc); }, TypeError, "Db descriptor's descriptor");
	item = obj._getMultiple_('test').$getOwn('raz');
	a.throws(function () { t(item); }, TypeError, "Db item");
};

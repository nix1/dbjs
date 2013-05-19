'use strict';

var values     = require('es5-ext/lib/Object/values')
  , Db         = require('../../../')
  , objectFrag = require('../../../lib/utils/fragment/object')

  , StringType = Db.String
  , getId = function (obj) { return obj._id_; };

module.exports = function (t, a) {
	var ns1, ns2, ns3, obj11, obj21, obj31, obj32, iterator, updates, removes
	  , frag;

	ns3 = Db.create('FragFilterTest3', { iteRemtest: StringType });
	ns1 = Db.create('FragFilterTest1', {
		iteTestStr: StringType,
		iteTestMulti: StringType.rel({ multiple: true }),
		otherObj: ns3,
		otherMultipleObj: ns3.rel({ multiple: true })
	});
	ns2 = Db.create('FragFilterTest2', {
		iteTest: ns1.rel({ reverse: 'iteRev1' })
	});

	obj31 = ns3({ iteRemtest: 'remotes' });
	obj11 = ns1({ iteTestStr: 'foo', iteTestMulti: ['raz', 'dwa'],
		otherObj: obj31 });
	obj21 = ns2({ iteTest: obj11 });

	frag = objectFrag(obj11, function () { return true; });
	iterator = t(frag, function (obj) { return obj._id_.indexOf('"') === -1; });
	a.deep(values(iterator.objects).map(getId).sort(), [obj11, obj11._iteTestStr,
		obj11._iteTestMulti, obj11._otherObj, obj31, obj31._iteRemtest, obj21,
		obj21._iteTest].map(getId).sort(), "Objects");
	updates = [];
	iterator.on('update', function (event) { updates.push(event.obj._id_); });
	removes = [];
	iterator.on('remove', function (id) { removes.push(id); });

	obj11.otherObj = null;
	a.deep(updates, [obj11._otherObj._id_], "Clear existing: Updates");
	updates.length = 0;
	a.deep(removes.sort(), [obj31, obj31._iteRemtest].map(getId).sort(),
			"Clear existing: Removes");
	removes.length = 0;

	obj21.iteTest = null;
	a.deep(updates, [obj21._iteTest._id_], "Remove reverse: Updates");
	updates.length = 0;
	a.deep(removes.sort(), [obj21, obj21._iteTest].map(getId).sort(),
		"Remove reverse: Removes");
	removes.length = 0;

	obj11.otherMultipleObj.add(obj31);
	a.deep(updates.sort(), [obj31, obj31._iteRemtest].map(getId).sort(),
		"Add obj item: Updates");
	updates.length = 0;
	a.deep(removes, [], "Add obj item: Removes");
	removes.length = 0;

	obj11.otherMultipleObj.delete(obj31);
	a.deep(updates, [], "Add obj item: Updates");
	updates.length = 0;
	a.deep(removes.sort(), [obj31, obj31._iteRemtest].map(getId).sort(),
		"Add obj item: Removes");
	removes.length = 0;

	obj32 = ns3();
	obj11.otherMultipleObj.delete(obj32);
	a.deep(updates, [], "Invoke delete item: Updates");
	updates.length = 0;
	a.deep(removes, [], "Invoke delete item: Removes");
	removes.length = 0;
};
'use strict';

var i              = require('es5-ext/function/i')
  , isFunction     = require('es5-ext/function/is-function')
  , assign         = require('es5-ext/object/assign')
  , mixin          = require('es5-ext/object/mixin')
  , setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , d              = require('d/d')
  , lazy           = require('d/lazy')
  , DbjsError      = require('../error')
  , Event          = require('../event')
  , ObjectsSet     = require('../objects-set')
  , getIdent       = require('../utils/get-ident')
  , turnPrototype  = require('../utils/propagate-prototype-turn').object
  , serialize      = require('../utils/serialize')
  , getMessage     = require('../utils/get-sub-error-message')
  , updateEnum     = require('../utils/update-enumerability')
  , unserialize    = require('../unserialize/value')

  , push = Array.prototype.push, slice = Array.prototype.slice
  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty, keys = Object.keys
  , getPrototypeOf = Object.getPrototypeOf
  , isValidTypeName = RegExp.prototype.test.bind(/^[A-Z][0-9a-zA-Z]*$/)
  , destroy = function (sKey) { this[sKey]._destroy_(); }
  , updateObjEnum;

updateObjEnum = function (obj) {
	var sKey, descs = obj.__descriptors__, desc;
	for (sKey in descs) {
		desc = descs[sKey];
		if (desc._reverse_) continue;
		if (desc.nested || desc.multiple) updateEnum(obj, sKey, true);
	}
	return obj;
};

module.exports = function (db, createObj, object) {
	var Base, existingIds = db.objects.__setData__;

	Base = module.exports = function Self(value) {
		if (Self.is(value)) return value;
		return Self.create.apply(Self, arguments);
	};
	setPrototypeOf(Base, object);
	try { mixin(Base, Function.prototype); } catch (ignore) {}

	defineProperties(Base, assign({
		__id__: d('', 'Base'),
		__object__: d('', Base),
		extend: d(function (name) {
			return this._extendAndInitialize_.apply(this,
				this._validateExtend_.apply(this, arguments));
		}),
		_validateExtend_: d(function (name) {
			if (!isValidTypeName(name)) {
				throw new DbjsError(name + " is not valid type name",
					'INVALID_TYPE_NAME');
			}
			if (existingIds[name]) {
				throw new DbjsError(name + " type is already created", 'TYPE_EXISTS');
			}
			return [name].concat(this._validateExtendInitialize_.apply(this,
				slice.call(arguments, 1)));
		}),
		_validateExtendInitialize_: d(function (initialize, nsProps, objProps) {
			var errors;
			if (!isFunction(initialize)) {
				objProps = nsProps;
				nsProps = initialize;
				initialize = null;
			} else if (!nsProps) {
				nsProps = { _initialize_: { value: initialize } };
			} else {
				nsProps._initialize_ = { value: initialize };
			}

			if (nsProps) {
				try {
					nsProps = create(this)._validateDefineProperties_(nsProps);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (e.errors) errors = e.errors;
					else errors = [e];
				}
			}
			if (objProps) {
				try {
					objProps =
						create(this.prototype)._validateDefineProperties_(objProps);
				} catch (e) {
					if (e.name !== 'DbjsError') throw e;
					if (errors) {
						if (e.errors) push.apply(errors, e.errors);
						else errors.push(e);
					} else {
						if (e.errors) errors = e.errors;
						else errors = [e];
					}
				}
			}
			if (!errors) return [nsProps, objProps];
			throw new DbjsError("Invalid properties:\n\t" +
				errors.map(getMessage).join('\t\n'), 'TYPE_CONSTRUCTION_ERROR',
				{ errors: errors });
		}),
		_extendAndInitialize_: d(function (name) {
			var constructor = this._extend_(name);
			new Event(constructor, this); //jslint: skip
			constructor._initialize_.apply(constructor, slice.call(arguments, 1));
			return constructor;
		}),
		_initialize_: d(function (nsProps, objProps) {
			if (nsProps) this._defineProperties_(nsProps);
			if (objProps) this.prototype._defineProperties_(objProps);
		}),
		is: d(function (value) { return Boolean(serialize(value)); }),
		normalize: d(function (value) { return this.is(value) ? value : null; }),
		validate: d(function (value) {
			if (!serialize(value)) {
				throw new DbjsError(value + " cannot be handled by dbjs",
					'NOT_SUPPORTED_VALUE');
			}
			return value;
		}),
		_extend_: d(function (name) {
			var constructor = function Self(value) {
				if (Self.is(value)) return value;
				return Self.create.apply(Self, arguments);
			};
			setPrototypeOf(constructor, this);
			defineProperties(constructor, {
				__id__: d('', name),
				__object__: d('', constructor)
			});
			constructor.prototype = create(this.prototype, {
				constructor: d(constructor),
				__id__: d('', name + '#')
			});
			defineProperty(constructor.prototype, '__object__', d('',
				constructor.prototype));
			db.objects._add(constructor);
			db.objects._add(constructor.prototype);
			this._descendants_._add(constructor);
			this.prototype._descendants_._add(constructor.prototype);
			if (!(name in db)) db[name] = constructor;
			updateObjEnum(constructor);
			updateObjEnum(constructor.prototype);
			return constructor;
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old = getPrototypeOf(this), postponed;
			if (!nu) nu = Base;
			if (old === nu) return;
			postponed = turnPrototype(this, nu, dbEvent);
			db._release_(turnPrototype(this.prototype, nu.prototype,
				dbEvent, postponed));
		}),
		create: d(function () {
			return this._createAndInitialize_.apply(this,
				this._validateCreate_.apply(this, arguments));
		}),
		_createNested_: d(function (object, sKey) {
			var nested, ident;
			if (!this._keys_[sKey]) this._serialize_(unserialize(sKey, db.objects));
			ident = getIdent(this._keys_[sKey], sKey);
			nested = this._create_(object.__id__ + '/' + ident, object.__master__);
			return defineProperties(nested, {
				__parent__: d('', object),
				__sKey__: d('', sKey),
				__ident__: d('', ident)
			});
		}),
		_validateCreate_: d(function (value) { return [this.validate(value)]; }),
		_createAndInitialize_: d(i),
		_create_: d(function (id, master) {
			return updateObjEnum(createObj(this.prototype, id, null, master));
		}),
		find: d(function (key, value) {
			var sKey = this._serialize_(key), sValue;
			if (sKey == null) {
				throw new DbjsError(key + " is invalid key", 'INVALID_KEY');
			}
			if (value == null) {
				throw new DbjsError(value + " is not a value", 'INVALID_VALUE');
			}
			sValue = serialize(value);
			if (sValue == null) {
				throw new DbjsError(value + " is invalid database value",
					'NOT_SUPPORTED_VALUE');
			}
			return this.prototype._getReverseMap_(sKey)._getMultiple_(sValue, value);
		}),
		_destroy_: d(function () {
			if (this.hasOwnProperty('__typeAssignments__')) {
				this.__typeAssignments__._plainForEach_(function (obj) {
					new Event(obj.$type); //jslint: skip
				});
			}
			this.prototype._destroy_();
			this.prototype._destroy_.call(this);
		})
	}, lazy({
		_typeAssignments_: d(function () { return new ObjectsSet(); },
			{ cacheName: '__typeAssignments__', desc: '' })
	})));

	db.objects._add(Base);
	db.Base = Base;
	Base.prototype = object;

	defineProperties(object, {
		constructor: d(Base),
		_destroy_: d(function () {
			if (this.hasOwnProperty('__descendants__')) {
				this.__descendants__._plainForEach_(function (obj) {
					obj._destroy_();
				});
			}
			if (this.hasOwnProperty('__assignments__')) {
				this.__assignments__._plainForEach_(function (obj) {
					new Event(this); //jslint: skip
				});
			}
			if (this.hasOwnProperty('__objects__')) {
				keys(this.__objects__).forEach(destroy, this.__objects__);
			}
			if (this.hasOwnProperty('__descriptors__')) {
				keys(this.__descriptors__).forEach(destroy, this.__descriptors__);
			}
			if (this.hasOwnProperty('__multiples__')) {
				keys(this.__multiples__).forEach(function (pKey) {
					keys(this[pKey]).forEach(destroy, this[pKey]);
				}, this.__multiples__);
			}
			if (this.constructor.prototype === this) return;
			new Event(this); //jslint: skip
		}),
		_setValue_: d(function (nu, dbEvent) {
			var old;
			if (this.constructor.prototype === this) {
				// Sanity check
				throw new DbjsError("Turn of prototype of the prototypes is forbidden",
					'PROTOTYPE_TURN');
			}
			old = getPrototypeOf(this);
			if (!nu) nu = object;
			if (old === nu) return;
			db._release_(turnPrototype(this, nu, dbEvent));
		})
	});
};
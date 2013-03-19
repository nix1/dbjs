'use strict';

var FilterSet        = require('./object-filter-set')
  , MapSet           = require('./object-map-set')
  , ObjectList       = require('./object-ordered-list')
  , SetIntersection  = require('./set-intersection')
  , SetUnion         = require('./set-union')
  , SetComplement    = require('./set-complement')
  , listByProperty   = require('./list-by-property')
  , filterByProperty   = require('./filter-by-property');

module.exports = function (set) {
	FilterSet.defineOn(set);
	MapSet.defineOn(set);
	ObjectList.defineOn(set);
	SetIntersection.defineOn(set);
	SetUnion.defineOn(set);
	SetComplement.defineOn(set);
	listByProperty.defineOn(set);
	filterByProperty.defineOn(set);
};
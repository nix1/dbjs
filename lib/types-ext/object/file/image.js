'use strict';

var uInteger = require('../../number/integer/u-integer');

module.exports = require('../file').create('Image', {
	width: uInteger,
	height: uInteger
});
'use strict';
var twAirQuality = require('../src/tw-air-quality.js');

module.exports = {
  setUp: function (done) {
    done();
  },
  'no args': function(test) {
    test.expect(1);
    test.equal(twAirQuality.awesome(), 'awesome', 'should be awesome');
    test.done();
  }
};

'use strict';
var twAirQuality = require('../src/tw-air-quality.js');

module.exports = {
  setUp: function (done) {
    done();
  },
  testMethodsExist: function(test) {
    test.ok(twAirQuality.queryStatusByCity);
    test.ok(twAirQuality.queryPm25ByCity);
    test.ok(twAirQuality.queryPm10ByCity);
    test.ok(twAirQuality.querySo2ByCity);
    test.ok(twAirQuality.queryCoByCity);
    test.ok(twAirQuality.queryO3ByCity);
    test.ok(twAirQuality.queryNo2ByCity);
    test.ok(twAirQuality.queryWindSpeedByCity);
    test.ok(twAirQuality.queryWindDirecByCity);
    test.ok(twAirQuality.queryFpmiByCity);
    test.ok(twAirQuality.queryNoxByCity);
    test.ok(twAirQuality.queryNoByCity);
    test.done();
  }
};

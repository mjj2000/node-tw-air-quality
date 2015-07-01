/*
 * tw-air-quality
 * https://github.com/mjj2000/node-tw-air-quality
 *
 * Copyright (c) 2015 MJJ
 * Licensed under the MIT license.
 */
/* globals require, module */
(function () {
  'use strict';

  var Promise = require('promise'),
      request = require('request'),
      _ = require('lodash'),
      dataSourceUrl = 'http://opendata.epa.gov.tw/ws/Data/AQX/?format=json',
      arrAirData = {},
      reqHandler;

  /**
   * Fetch all data
   * @return {promise} - Promise object.
   */
  function fetchData () {
    return new Promise(function (resolve, reject) {
      // abort existing request!
      if (reqHandler) {
        reqHandler.abort();
      }
      // do send request
      reqHandler = request(dataSourceUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          arrAirData = JSON.parse(body);
          // success callback with all data in array
          resolve(arrAirData);
        } else {
          // failure callback with error object
          reject(error);
        }
      });
    });
  }

  /**
   * Filter data by city
   * @param  {string} city - City name
   * @return {array}       - Data of all matched city
   */
  function searchCity (city) {
    var arrCityData = [],
        cityData,
        patCityName = new RegExp(city),
        objCityData;
    for(var c = 0; c < arrAirData.length; c++) {
      objCityData = arrAirData[c];
      if (
        patCityName.test(objCityData.County) ||
        patCityName.test(objCityData.SiteName)
      ) {
        arrCityData.push(objCityData);
      }
    }

    return arrCityData;
  }

  /**
   * Trigger querying data by city
   * @param  {string} city - City name
   * @return {promise}     - Promise object.
   */
  function queryAllByCity (city) {
    var arrCityData;

    return new Promise(function (resolve, reject) {
      fetchData()
        .then(function () {
          arrCityData = searchCity(city);
          if (arrCityData.length) {
            // success callback with Data of all matched city
            resolve(arrCityData);
          } else {
            // failure callback with error object
            reject(new Error('City not found'));
          }
        })
        .catch(function (e) { reject(e); });
    });
  }

  /**
   * Query value by target field and city name
   * @param  {string}   field   - Data field
   * @param  {string}   city    - City name
   * @param  {function} success - Success callback with value as argument
   * @param  {function} error   - Error callback with error object as argument
   */
  function queryValueByCity (field, city, success, error) {
    success = _.isFunction(success) ? success : _.noop;
    error = _.isFunction(error) ? error : _.noop;

    queryAllByCity(city)
      .then(function (arrCityData) {
        var value,
            valueType,
            collection;

        _.each(arrCityData, function (objCityData) {
          if (field in objCityData) {
            // initialize collection
            if (!valueType) {
              if (!_.isNaN(parseInt(objCityData[field], 10))) {
                valueType = 'number';
                collection = 0;
              } else {
                valueType = 'string';
                collection = [];
              }
            }

            switch (valueType) {
              case 'number':
                collection += parseInt(objCityData[field], 10);
                break;
              case 'string':
                collection.push(objCityData[field]);
                break;
            }
          }
        });

        value = (valueType === 'number') ?
                // calculate average of total
                Math.round(collection / arrCityData.length, 2) :
                // choose the most frequently occurring value if value is not number
                _.chain(collection).countBy().pairs().max(_.last).head().value();

        success(value);
      })
      .catch(function (e) { error(e); });
  }

  /**
   * Factory to create query function for city by field name
   * @param  {string} field - Field name of data
   * @return {function}     - Created function
   */
  function createQueryer (field) {
    return function () {
      Array.prototype.unshift.call(arguments, field);
      queryValueByCity.apply(null, arguments);
    };
  }

  module.exports = {
    queryStatusByCity: createQueryer('Status'),
    queryPm25ByCity: createQueryer('PM2.5'),
    queryPm10ByCity: createQueryer('PM10'),
    querySo2ByCity: createQueryer('SO2'),
    queryCoByCity: createQueryer('CO'),
    queryO3ByCity: createQueryer('O3'),
    queryNo2ByCity: createQueryer('NO2'),
    queryWindSpeed2ByCity: createQueryer('WindSpeed'),
    queryWindDirec2ByCity: createQueryer('WindDirec'),
    queryFpmiByCity: createQueryer('FPMI'),
    queryNoxByCity: createQueryer('NOx'),
    queryNoByCity: createQueryer('No')
  };

}(typeof exports === 'object' && exports || this));

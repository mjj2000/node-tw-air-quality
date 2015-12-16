###*
 * tw-air-quality
 * https://github.com/mjj2000/node-tw-air-quality
 *
 * Copyright (c) 2015 MJJ
 * Licensed under the MIT license.
###
### globals require, module ###

(->
  "use strict"
  Promise = require 'promise'
  request = require 'request'
  _ = require 'lodash'
  dataSourceUrl = 'http://opendata.epa.gov.tw/ws/Data/AQX/?format=json'
  arrAirData = {}

  ###*
   * Fetch all data
   * @return {promise} - Promise object.
  ###
  fetchData = ->
    new Promise (resolve, reject) ->
      # abort existing request!
      if reqHandler
        reqHandler.abort()

      # do send request
      options = {
        url: dataSourceUrl,
        followRedirect: true
      }
      reqHandler = request options, (error, response, body) ->
        if !error and (response.statusCode == 200)
          arrAirData = JSON.parse(body)
          # success callback with all data in array
          resolve arrAirData
        else
          # failure callback with error object
          reject error
  ###*
   * Filter data by city
   * @param  {string} city - City name
   * @return {array}       - Data of all matched city
  ###
  searchCity = (city) ->
    arrCityData = []
    patCityName = new RegExp(city)
    for objCityData in arrAirData
      if patCityName.test(objCityData.County) or patCityName.test(objCityData.SiteName)
        arrCityData.push objCityData
    arrCityData

  ###*
   * Trigger querying data by city
   * @param  {string} city - City name
   * @return {promise}     - Promise object.
  ###
  queryAllByCity = (city) ->
    new Promise (resolve, reject) ->
      fetchData()
        .then () ->
          arrCityData = searchCity(city)
          if arrCityData.length
            # success callback with Data of all matched city
            resolve arrCityData
          else
            # failure callback with error object
            reject new Error('City not found')
          return
       .catch (e) ->
          reject e

  ###*
   * Query value by target field and city name
   * @param  {string}   field   - Data field
   * @param  {string}   city    - City name
   * @param  {function} success - Success callback with value as argument
   * @param  {function} error   - Error callback with error object as argument
  ###
  queryValueByCity = (field, city, success, error) ->
    success = if _.isFunction(success) then success else _.noop
    error = if _.isFunction(error) then error else _.noop
    queryAllByCity(city)
      .then (arrCityData) ->
        for objCityData in arrCityData
          if field of objCityData
            # initialize collection
            if !valueType
              if !_.isNaN(parseInt(objCityData[field], 10))
                valueType = 'number'
                collection = 0
              else
                valueType = 'string'
                collection = []
            switch valueType
              when 'number'
                collection += parseInt(objCityData[field], 10)
              when 'string'
                collection.push objCityData[field]

        if valueType == 'number'
          value = Math.round(collection / arrCityData.length, 2)
        else
          value = _.chain(collection).countBy().pairs().max(_.last).head().value()
        success(value)
    .catch (e) ->
      error e
  ###*
   * Factory to create query function for city by field name
   * @param  {string} field - Field name of data
   * @return {function}     - Created function
  ###
  createQueryer = (field) ->
    ->
      Array::unshift.call(arguments, field)
      queryValueByCity.apply(null, arguments)

  module.exports =
    queryStatusByCity: createQueryer('Status')
    queryPm25ByCity: createQueryer('PM2.5')
    queryPm10ByCity: createQueryer('PM10')
    querySo2ByCity: createQueryer('SO2')
    queryCoByCity: createQueryer('CO')
    queryO3ByCity: createQueryer('O3')
    queryNo2ByCity: createQueryer('NO2')
    queryWindSpeedByCity: createQueryer('WindSpeed')
    queryWindDirecByCity: createQueryer('WindDirec')
    queryFpmiByCity: createQueryer('FPMI')
    queryNoxByCity: createQueryer('NOx')
    queryNoByCity: createQueryer('No')

) typeof exports == 'object' and exports or this

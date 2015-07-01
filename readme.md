# tw-air-quality

> Fetching air quality open data of Taiwan


## Getting started

### Node.js

```
$ npm install --save tw-air-quality
```

## Available APIs

### Query air quality by city name

**Arguments for all methods**

Argument | Type | Description
---|---|---
city|string|City name
success|function|success callback with value as the only argument
error|function|error callback with Error object as the only argument

**Methods**

- queryStatusByCity
- queryPm25ByCity
- queryPm10ByCity
- querySo2ByCity
- queryCoByCity
- queryO3ByCity
- queryNo2ByCity
- queryWindSpeed2ByCity
- queryWindDirec2ByCity
- queryFpmiByCity
- queryNoxByCity
- queryNoByCity



**Example**

```js
var twAirQuality = require('tw-air-quality');
// query PM2.5 by city name
twAirQuality.queryPm25ByCity('新店', function (value) {
  // success
  console.log(value);
}, function () {
  // failed
});
```

## License

MIT © MJJ

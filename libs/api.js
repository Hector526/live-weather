/**
 * 逆经纬度查询
 * @param {*} lat
 * @param {*} lon
 */
export const geocoder = (lat, lon) => {
  return uniCloud.callFunction({
    name: 'tencent-geocoder',
    data: {
      lat,
      lon
    }
  })
}

/**
 * 获取和风天气NOW
 * @param {*} lat
 * @param {*} lon
 */
export const heweatherNow = (lat, lon) => {
  return uniCloud.callFunction({
    name: 'heweather-now',
    data: {
      lat,
      lon
    }
  })
}

/**
 * 获取和风天气质量
 * @param {*} lat
 * @param {*} lon
 */
export const heweatherAir = (lat, lon) => {
  return uniCloud.callFunction({
    name: 'heweather-air',
    data: {
      lat,
      lon
    }
  })
}

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

/**
 * 获取和风天气3天预报
 * @param {*} lat
 * @param {*} lon
 */
export const heweather3d = (lat, lon) => {
	return uniCloud.callFunction({
		name: 'heweather-3d',
		data: {
			lat,
			lon
		}
	})
}

/**
 * 获取和风天气逐小时预报（未来24小时）
 * @param {*} lat
 * @param {*} lon
 */
export const heweather24h = (lat, lon) => {
	return uniCloud.callFunction({
		name: 'heweather-24h',
		data: {
			lat,
			lon
		}
	})
}

/**
 * 获取和风天气7天预报
 * @param {*} lat
 * @param {*} lon
 */
export const heweather7d = (lat, lon) => {
	return uniCloud.callFunction({
		name: 'heweather-7d',
		data: {
			lat,
			lon
		}
	})
}

/**
 * 获取和风天气当天生活指数预报
 * @param {*} lat
 * @param {*} lon
 */
export const heweatherIndices = (lat, lon) => {
	return uniCloud.callFunction({
		name: 'heweather-indices',
		data: {
			lat,
			lon
		}
	})
}

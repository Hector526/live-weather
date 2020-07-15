const QQ_MAP_KEY = 'NQSBZ-QFT3G-OHPQU-INYXB-SIYY5-UPFLX'

/**
 *  逆经纬度查询
 * @param {*} lat
 * @param {*} lon
 */
export async function geocoder(lat, lon) {
	const [err, res] = await uni.request({
		url: 'https://apis.map.qq.com/ws/geocoder/v1/',
		data: {
			location: `${lat},${lon}`,
			key: QQ_MAP_KEY,
			get_poi: 0
		}
	});
	if (err) {
		console.log(err);
		return null;
	} else {
		
		return res;
	}
}

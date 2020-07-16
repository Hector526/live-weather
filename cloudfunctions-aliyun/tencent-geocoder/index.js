'use strict';
const QQ_MAP_KEY = 'NQSBZ-QFT3G-OHPQU-INYXB-SIYY5-UPFLX';
const API_URL = 'https://apis.map.qq.com/ws/geocoder/v1/';

exports.main = async (event, context) => {
	const {lat, lon} = event;
	let location = `${lat},${lon}`
	const options = {
		method: 'GET',
		data: {
			location: location,
			key: QQ_MAP_KEY,
			get_poi: 0
		},
		dataType: 'json'
	};

	return await uniCloud.httpclient.request(API_URL, options);
}

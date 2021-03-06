'use strict';
const HEWEATHER_KEY = 'c7266e3923a84a718c2e560993cc483c';
const API_URL = 'https://devapi.heweather.net/v7/indices/1d';

exports.main = async (event, context) => {
	const {lat, lon} = event;
	let location = `${lon},${lat}`;

	const options = {
		method: 'GET',
		data: {
			location: location,
			key: HEWEATHER_KEY,
			type: 0
		},
		dataType: 'json'
	};

	return await uniCloud.httpclient.request(API_URL, options);
}

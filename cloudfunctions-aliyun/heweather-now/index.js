'use strict';
const HEWEATHER_KEY = 'c7266e3923a84a718c2e560993cc483c';
const API_URL = 'https://devapi.heweather.net/v7/weather/now';

exports.main = async (event, context) => {
	const {lat, lon} = event;
	let location = `${lon},${lat}`;
	console.log(location);
	const options = {
		method: 'GET',
		data: {
			location: location,
			key: HEWEATHER_KEY,
		},
		dataType: 'json'
	};

	return await uniCloud.httpclient.request(API_URL, options);
}


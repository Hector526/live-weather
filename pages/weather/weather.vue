<template>
	<view class="wrapper" :style="{ background: 'url(' + backgroundImage + ') center -178rpx / 100% no-repeat ' + backgroundColor }">
		<view class="container" id="canvas-wrapper" :style="{ paddingTop: paddingTop + 'px' }">
			<view class="now">
				<!--当前实时天气和空气质量-->
				<view class="location" @click="chooseLocation">
					<image :src="iconLocation" mode="aspectFill" />
					<text>{{ address }}</text>
				</view>
				<view v-if="airExist" class="air-quality">
					<text class="circle" :style="{ backgroundColor: airColor }"></text>
					<text class="value">{{ air.category }} {{ air.aqi }}</text>
				</view>
				<view class="now-weather">
					<view class="temp">
						<text>{{ nowWeather.temp }}</text>
						<text class="degree">°</text>
					</view>
					<view class="cur-weather">
						<view class="inline">
							<image :src="nowWeather.iconNowWeather" mode="aspectFill" />
							<text>{{ nowWeather.text }}</text>
						</view>
						<view class="inline today">
							<text class="item">湿度 {{ nowWeather.humidity }}%</text>
							<text class="item">{{ nowWeather.windDir }} {{ nowWeather.windScale }}级</text>
						</view>
					</view>
					<view class="tips"><text>私人订制天气</text></view>
				</view>
			</view>
			<view class="two-days">
				<!--今明两天天气-->
				<view class="item">
					<view class="top">
						<text class="date">今天</text>
						<text class="temp">{{ today.tempMin }}/{{ today.tempMax }}</text>
					</view>
					<view class="bottom">
						<text class="twotext">{{ today.textDay }}/{{ today.textNight }}</text>
						<view class="twoicon">
							<image :src="today.dayIcon" mode="aspectFill"></image>
							<text>/</text>
							<image :src="today.nightIcon" mode="aspectFill"></image>
						</view>
					</view>
				</view>
				<view class="item">
					<view class="top">
						<text class="date">明天</text>
						<text class="temp">{{ tomorrow.tempMin }}/{{ tomorrow.tempMax }}</text>
					</view>
					<view class="bottom">
						<text class="twotext">{{ tomorrow.textDay }}/{{ tomorrow.textNight }}</text>
						<view class="twoicon">
							<image :src="tomorrow.dayIcon" mode="aspectFill"></image>
							<text>/</text>
							<image :src="tomorrow.nightIcon" mode="aspectFill"></image>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="weather" :style="{ backgroundColor: backgroundColor }">
			<view class="container"><!--24 小时天气--></view>
			<view class="container">
				<view class="week"><!--七天天气--></view>
			</view>
			<view class="container">
				<view class="life-style"><!--生活指数--></view>
			</view>
		</view>
	</view>
</template>

<script>
import utils from '@/utils/utils';
import { geocoder, heweatherNow, heweatherAir, heweather3d } from '@/libs/api';

export default {
	data() {
		return {
			statusBarHeight: 32,
			backgroundImage: '../../static/cloud.jpg',
			backgroundColor: '#62aadc',
			// backgroundColor: '#000',
			paddingTop: '',
			width: 375,
			scale: 1,
			iconLocation: '/static/location.png',
			address: '定位中',
			province: '',
			county: '',
			city: '苏州',
			latitude: 40.056974,
			longitude: 116.307689,
			nowWeather: {},
			airExist: false,
			airColor: '#00cf9a',
			air: {},
			today: {},
			tomorrow: {},
			hourlyData: [],
			weeklyData: []
		};
	},
	onLoad() {
		// 设置系统信息
		this.setSystemInfo();
		this.checkLocationInfo();
		this.cacheInit();
	},
	async onReady() {
		await this.getLocation();
		await this.updateHeweather();
	},
	methods: {
		cacheInit() {
			const cacheData = uni.getStorageSync('cacheData');
			
			this.address = cacheData.address;
			this.nowWeather = cacheData.nowWeather;
			this.airExist = cacheData.airExist;
			this.airColor = cacheData.airColor;
			this.air = cacheData.air;
			this.today = cacheData.today;
			this.tomorrow = cacheData.tomorrow;
			// this.hourlyData = cacheData.hourlyData;
			// this.weeklyData = cacheData.weeklyData;
		},
		async setSystemInfo() {
			const [err, res] = await uni.getSystemInfo();
			if (err) {
				return;
			}
			this.width = res.windowWidth;
			this.scale = this.width / 375;
			this.paddingTop = res.statusBarHeight + 12;
		},
		async checkLocationInfo() {
			const [err, res] = await uni.getSetting();
			if (!res.authSetting['scope.userLocation']) {
				this.openLocationError();
			}
		},
		async getLocation() {
			const [err, res] = await uni.getLocation({ type: 'gcj02' });
			if (err) {
				this.openLocationError();
			} else {
				console.log(res);
				this.initLocation(res);
			}
		},
		openLocationError() {
			utils.showError('检测到您未授权使用位置权限，请先开启哦');
		},
		initLocation(res) {
			let { latitude: lat, longitude: lon } = res;
			this.latitude = lat;
			this.longitude = lon;
			this.getAddress(lat, lon);
		},
		// 处理逆经纬度
		async getAddress(latitude, longitude) {
			utils.showLoading('定位中');

			const res = await geocoder(latitude, longitude);
			if (!res.success) {
				utils.hideLoading();
				return;
			}

			const resData = res.result.res;

			let result = (resData.data || {}).result;

			if (resData.statusCode === 200 && result && result.address) {
				let { address, formatted_addresses, address_component } = result;
				if (formatted_addresses && (formatted_addresses.recommend || formatted_addresses.rough)) {
					address = formatted_addresses.recommend || formatted_addresses.rough;
				}
				let { province, city, district: county } = address_component;

				this.province = province;
				this.city = city;
				this.county = county;
				this.address = address;
			}
			utils.hideLoading();
		},
		async chooseLocation() {
			const [err, res] = await uni.chooseLocation();
			if (err) {
				return;
			}
			let { latitude, longitude } = res;
			if (latitude == this.latitude && this.longitude == longitude) {
				// this.getWeatherData();
				console.log('same');
			} else {
				this.initLocation(res);
			}
		},
		async updateHeweather() {
			await this.getHeweatherNow();
			await this.getHeweatherAir();
			await this.getHeweather3d();
		},
		async getHeweatherNow() {
			const res = await heweatherNow(this.latitude, this.longitude);
			console.log('getHeweatherNow:');
			console.log(res);
			this.nowWeather = res.result.data.now;
			this.nowWeather.iconNowWeather = '/static/weather/' + this.nowWeather.icon + '.png';
		},
		async getHeweatherAir() {
			const res = await heweatherAir(this.latitude, this.longitude);
			console.log('getHeweatherAir:');
			console.log(res);
			if (res.result.data.code == '200') {
				this.airExist = true;
			} else {
				this.airExist = false;
			}
			this.air = res.result.data.now;
			this.airColor = utils.airBackgroundColor(this.air.aqi);
		},
		async getHeweather3d() {
			const res = await heweather3d(this.latitude, this.longitude);
			console.log('getHeweather3d:');
			console.log(res);
			this.today = res.result.data.daily[0];
			this.tomorrow = res.result.data.daily[1];
			this.today.dayIcon = '/static/weather/' + this.today.iconDay + '.png';
			this.today.nightIcon = '/static/weather/' + this.today.iconNight + '.png';
			this.tomorrow.dayIcon = '/static/weather/' + this.tomorrow.iconDay + '.png';
			this.tomorrow.nightIcon = '/static/weather/' + this.tomorrow.iconNight + '.png';
		}
	},
	onHide() {
		const cacheData = {
			address: this.address,
			nowWeather: this.nowWeather,
			airExist: this.airExist,
			airColor: this.airColor,
			air: this.air,
			today: this.today,
			tomorrow: this.tomorrow,
			hourlyData: this.hourlyData,
			weeklyData: this.weeklyData
		};
		uni.setStorageSync('cacheData', cacheData);
	}
};
</script>

<style scoped lang="scss">
@mixin flex-row {
	display: flex;
	flex-direction: row;
}

@mixin flex-column {
	display: flex;
	flex-direction: column;
}

.flex-row {
	@include flex-row;
}

.flex-column {
	@include flex-column;
}

.block {
	display: block;
}

$grid-margin: 20rpx;

.wrapper {
	width: 100%;
	height: 784rpx;
}

.container {
	margin-bottom: $grid-margin;
	max-width: 750rpx;
	box-sizing: border-box;
	color: #fff;
	// color: #e0e0e0;
}
.now {
	height: 560rpx;
	overflow: hidden;
	position: relative;
	color: #fff;

	.location {
		text-align: center;
		font-size: 26rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0 200rpx;

		image {
			width: 24rpx;
			height: 24rpx;
			font-size: 26rpx;
			margin-right: 4rpx;
		}
	}

	.air-quality {
		position: absolute;
		top: auto;
		left: 20rpx;
		height: 28rpx;
		line-height: 28rpx;
		padding: 16rpx 20rpx;
		border-radius: 8rpx;
		color: #fff;
		background: rgba(0, 0, 0, 0.1);
		font-size: 24rpx;

		.circle {
			content: '';
			display: inline-block;
			width: 8rpx;
			height: 28rpx;
			margin-right: 14rpx;
			vertical-align: middle;
			border-radius: 4rpx;
		}
		.value {
			vertical-align: middle;
		}
	}
	.now-weather {
		position: absolute;
		top: 60%;
		left: 0;
		width: 100%;
		text-align: center;
		transform: translateY(-50%);
		line-height: 1;
	}
	.temp {
		margin-bottom: 10rpx;
	}
	.temp text {
		color: #fff;
		font-weight: lighter;
		font-family: helvetica-ultra-light;
		font-size: 240rpx;
		display: inline-block;
		vertical-align: top;
	}
	.temp text.degree {
		font-size: 80rpx;
	}
	.cur-weather {
		font-size: 40rpx;
		margin-bottom: 40rpx;
		line-height: 1;
		position: relative;

		.inline {
			margin-bottom: 30rpx;
			font-size: 48rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			image {
				height: 64rpx;
				width: 64rpx;
			}

			text {
				margin-left: 24rpx;
			}
		}

		.today {
			@include flex-row;
			.item {
				display: block;
				padding-right: 16rpx;
				margin: 0 16rpx 0 0;
				border-right: 2rpx solid rgba(255, 255, 255, 0.4);
				font-size: 28rpx;
				flex: 1;
				text-align: right;
				&:last-child {
					text-align: left;
					border: none;
					padding: 0;
					margin: 0;
				}
			}
		}
	}
}

// 两天天气
.two-days {
	@include flex-row;
	margin-top: 20rpx;
	$gap: 24rpx;
	padding: $gap 0; // background: rgba(0, 0, 0, .1);
	overflow: hidden;
	width: 100%;
	.item {
		display: flex;
		flex-direction: column;
		width: 50%;
		font-size: 28rpx;
		line-height: 28rpx;
		padding: 0 40rpx;
		border-right: 2rpx solid rgba(255, 255, 255, 0.4);
		&:last-child {
			border-right: none;
		}
		.top {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			height: 24rpx;
			margin-bottom: 26rpx;
			margin-right: -20rpx;

			.date {
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: center;
			}
			.temp {
				display: flex;
				flex-direction: row;
				justify-content: flex-end;
				align-items: center;
			}
		}

		// bottom
		.bottom {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			height: 44rpx;
			margin-right: -20rpx;

			.twotext {
				// float: left;
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: center;
				height: 44rpx;
				line-height: 44rpx;
			}

			.twoicon {
				height: 44rpx;
				display: flex;
				flex-direction: row;
				justify-content: flex-end;
				align-items: center;
				image {
					width: 44rpx;
					height: 44rpx;
				}
			}
		}
	}
}
</style>

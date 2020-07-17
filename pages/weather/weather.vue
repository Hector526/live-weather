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
			<!-- <view class="container"> -->
				<!--24 小时天气-->
				<!-- 				<scroll-view scroll-x class="hourly">
					<view class="scrollX">
						<view class="item" v-for="(item, index) in hourlyData" :key="index">
							<text class="time">{{ item.time }}</text>
							<icon type="{{item.icon}}" class="icon"></icon>
							<image :src="item.icon"></image>
							<text class="temp">{{ item.temp }}°</text>
						</view>
					</view>
				</scroll-view> -->
			<!-- </view> -->
<!-- 			<view class="container">
				<view class="week"> -->
					<!--七天天气-->
					<!-- </view> -->
			<!-- </view> -->
			<view class="container">
				<view class="life-style">
					<!--生活指数-->
					<view class="item" v-for="(item, index) in lifeStyle" :key="index" @click="lifeStyleDetail(item)">
						<view class="title">
							{{ item.name }}
						</view>
						<view class="content">{{ item.category }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import utils from '@/utils/utils';
import { geocoder, heweatherNow, heweatherAir, heweather3d, heweather24h, heweather7d, heweatherIndices } from '@/libs/api';

export default {
	data() {
		return {
			statusBarHeight: 32,
			backgroundImage:
				'data:image/jpg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA+AAD/4QN8aHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjUtYzAxNCA3OS4xNTE0ODEsIDIwMTMvMDMvMTMtMTI6MDk6MTUgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MmM0YWYxNTItMjNlZS00M2VhLTliMmMtOWRlMmIxZDVlYzk3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkVEQ0UyMUFENEY5RDExRTU5M0FDRUJFN0RFNkQ5NTQ2IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkVEQ0UyMUFDNEY5RDExRTU5M0FDRUJFN0RFNkQ5NTQ2IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjcwZGNmYzRhLTJhMGQtNDk5YS05ZTE4LTg0MmY0YzA3YWE0YyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyYzRhZjE1Mi0yM2VlLTQzZWEtOWIyYy05ZGUyYjFkNWVjOTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwv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EBAIBASAQAEgEAgiRQgAJAIBASAQQgIoQAEABIAAIAgAAIAAAogAAAIAIAAAAgAAAAAAAAO4cXdAAAFRIBAAQCAAkAgAIqEABIAACQCAkAggCRQABIACAAQAEAgJAIBBEgEUICQACAkAgEESARQBIAACAQCCIAAACAQBRAAAAAQQAAABAAAAAAdy4u6AAAAgAAIqAAAJAAICAQEAioQEAgEBAIBASAQRIoAQCAgEAgIACQACAkAAERQAgJAICAACJAFCAkAgAJAAIAIgAAJAAAFEAAABABAAAEAAB3Li+gEAAAQAAEgAEABIqAAJAIBASAQCAgCoAgEBIBAAICCEBIoAAkAAgIAACQCAQEgEEQCKEBIABAQAQgJAIoAgAAIAAIkAAABAAFEAAAAEQAUEAdy4voBAAVBAAAEAAgAIABARUAASAQCAgAEBAFQBAIBAQCAQEAggogAIABASAAQEAgAJAIIQEigCAQCAgAAiARQBAAASAAQARAAARQQFAEAAABAd04O4AACKAgACAAAAgAAIABAASKgBAQACAkAgEBBBQgJAICQCAQEgEEASKEAgIBAAQCAQEgAEBIIAihAICQCAQEgEAERQABIAACAAAggAACQCKAAIDuXB3AAAAARQAAAEQAAAEAAABAAASCCgCAQCAkAgAAiKAJAIBASAQAEEICQBQBIBAICQACAkAgEBIBBCAkUAICQAEgAEBIIRQgJAAASAAACIAACAA7hxd1BAAAAAAAFEAAEAAQAAAEAABAAIBARUIACAAQEAgEBBCKEBIACAAQEgEEARQgEBAICAQAEgAEBIBBCAkUIBASAAAkAgEERQAgJAAAQCACIADuHF3QAFBAUEAAAAAAUAQAAQBAAAAQAAEAAgAIqEABIBAICAAAQRIoQEAgEBIABASCAJFCAQEgEAgJAIBASAQCAgEEFEABAAICAQAQgIoAkAABAAdu4uyAoAICgAgKAACAAAAAAigAABBEAgAAIABAQAABUQCAQEgEAgJAAICRUIBAQAEgAEBABBRIACAAQEAAgJAIACQAQBIoQAEgEAgJAAQQgEUSAA7ZxdkABQAAAQAAAFABAAAAAAAFEAEAAQAAAEAABAAAARUAASAAQEAgAJFAQgJAIACQACAkEICRQABAIACQCAQEgAAJABEgEUASAQCAkAgAiQHauTsgAKACAAAAAoIAAACgAgAAAAAACiCAoAIgAAAIAACAAAKiAAAgAAIABASKhAAQCAgEAgIBBCAihASAQCAgAEBIAACQCCAJAFCAkAgEB2bk6oCgAAAAgAAAAAKAACAAoAICggACggAigAABBEAgAAIABAAQACCJFCAAkAAgJAAARUIACAAAkABAIIQEUIACAQAEAgAJAIACQCCIBFCA7JydQAEBQAQAFBAUEBQAQFBAAUAEAAAAAAAAAAUQAAAARAAAAQAAEAAgEVEgAAJAIACQCAQEioQEgEAgJAIBASCEAgJFCAgAAEBIBAAQCAkAgjsKw6lAoFAoFAoFAoFEKBQKBQKBRSgUCgUCgUCoAAFAoAAACiCFAoFAoAIBQKCUCgUCglBKBVQoFAFABEAABAKCUABQQJgEUSYIAgIAAIAgHgCYBMAmATAJgJMA64odcB9VZaKBQKBQKBQKBQKBQKBQKBQKKtAqBQAAAWgUCgUCgUCgUCgUE3VEohQKBQKCUCglClClBKoVAoIAoILQKCKFEKBQQAAAAAAAEBAAQAQABAAABQAAAAAHN2VDsB2A7AdgOwHYDsB2A7AdgOwHYDsB2IL2SKUKtClAoHYDsB2RSgdiB2A7EDsQOxA7EQ7EDssKnYEoFA7AUCiJRSqh2AoFBKBQKBUCgUCgUEqhQKBQKBQAAAKBQSgAAAgAAAAAAAACAAAoAvZqMU7EKdiFOxCnYhTsQp2IU7EKdiFOxCnYhTsQp2IU7EKdiLV7EKdkhTsQq9iLTsQp2IU7EKdiFOxCnYhTsQp2IU7BTsQp2IU7EKnYiU7BU7EKdiFOxCnYhTsBQqdlhTsQp2IHYgdiB2IHYgVIFAoFAoFAoFAoFAoFAoFAoFAoFCpSKUgUAAAAAAAAAAAAAGezUc6diFOxCnYhTsQp2IU7EKdiFOxCnYhTsQp2IU7EKdiFOxCr2IU7EWnYhTsQp2IU7EKdiFOxCnYhTsQp2IU7JCnYhTsQp2CnYKnYhTsQp2IU7EKdiFKFKFKFKFKFKFKFKFKFKFKFKFKpSgUCgUCgUCgVIUopQKBQKBQKBQKBQKBQKBQKBQKBQKBQKBQKDj7NuR2A7AdgOwHYDsB2A7AtAopQKBQKB2A7AdgOwHYDsB2A7AdgOxA7AdkDsBQKBQKBRSgUCgUDsQOxA7EDsBQKBQKBQKBQKBQKBQKC0CilAoFAqBQKBQKBQKBQKBQKBQKBQKBQKBQKBQKBQcVdHIoFAoFBaBQKKUCgUCgUCgUCgUCgUCgUCgUCgUCoFAopQKBQKBQKBQKBQKBQKBQKBQWgUUoFAoFQKFKFAAAAAAAEAAAFoUoUoAoAAAAAAAAAAAAADi8ujkeQAAAUDyKeQPIHkDyB5A8geQPIHkDyB5A8geQPIHkDyB5A8geQPKB5A8geQPIAp5A8geQPIL5AAAAAQAAAAAUAU8geQPIHkDyB5A8gAAAeUDyKeQPIHkDyB5A8geQPIHkAAAAAAAADyB5B//2Q==',
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
			weeklyData: [],
			lifeStyle: []
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
			await this.getHeweather24h();
			await this.getHeweather7d();
			await this.getHeweatherIndices();
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
		},
		async getHeweather24h() {
			const res = await heweather24h(this.latitude, this.longitude);
			console.log('getHeweather24h:');
			console.log(res);
		},
		async getHeweather7d() {
			const res = await heweather7d(this.latitude, this.longitude);
			console.log('getHeweather7d:');
			console.log(res);
		},
		async getHeweatherIndices() {
			const res = await heweatherIndices(this.latitude, this.longitude);
			console.log('getHeweatherIndices:');
			console.log(res);
			this.lifeStyle = this.lifeStyleFormat(res.result.data.daily);
		},
		lifeStyleFormat(daily) {
			let result = [];
			daily.forEach(item => {
				switch (item.type) {
					case '3':
						result[1] = item;
						break;
					case '5':
						result[5] = item;
						break;
					case '6':
						result[4] = item;
						break;
					case '8':
						result[0] = item;
						break;
					case '9':
						result[2] = item;
						break;
					case '1':
						result[3] = item;
						break;
					case '2':
						result[6] = item;
						break;
					case '4':
						result[7] = item;
						break;
					default:
						break;
				}
			});
			return result;
		},
		lifeStyleDetail(e) {}
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
	height: 786rpx;
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
	// margin-top: 20rpx;
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

// 生活指数
.life-style {
  @include flex-row; // border-top: 2rpx solid #e6e6e6;
  flex-wrap: wrap;

  .item {
    float: left;
    text-align: center;
    width: 25%;
    height: 188rpx;
    border-right: 2rpx solid rgba(255, 255, 255, .1);
    border-bottom: 2rpx solid rgba(255, 255, 255, .1);
    box-sizing: border-box;
    padding: 50rpx 0 0;
  }
  .content {
    font-size: 36rpx;
    margin-top: 20rpx;
  }
  .title {
    // icon {
    //   font-size: 24rpx;
    //   margin-right: 10rpx;
    //   margin-top: -2rpx;
    // }
    color: #fff;
    opacity: 0.7;
    font-size: 24rpx;
    height: 24rpx;
    line-height: 24rpx;
  }
}
</style>

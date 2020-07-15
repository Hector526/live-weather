<template>
	<view class="wrapper" :style="{ background: 'url(' + backgroundImage + ') center -178rpx / 100% no-repeat ' + backgroundColor }">
		<view class="container" id="canvas-wrapper" :style="{ paddingTop: paddingTop + 'px' }">
			<view class="now">
				<!--当前实时天气和空气质量-->
				<view class="location" @click="chooseLocation">
					<image :src="iconLocation" mode="aspectFill" />
					<text>{{ address }}</text>
				</view>
			</view>
			<view class="two-days"><!--今明两天天气--></view>
		</view>
	</view>
</template>

<script>
import utils from '@/utils/utils';
import { geocoder } from '@/libs/api';

export default {
	data() {
		return {
			statusBarHeight: 32,
			backgroundImage: '/static/cloud.jpg',
			backgroundColor: '#62aadc',
			paddingTop: '',
			width: 375,
			scale: 1,
			iconLocation: '/static/location.png',
			address: '定位中',
			province: '',
			county: '',
			city: '苏州',
			latitude: 40.056974,
			longitude: 116.307689
		};
	},
	onLoad() {
		// 设置系统信息
		this.setSystemInfo();
		this.checkLocationInfo();
	},
	onReady() {
		this.getLocation();
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
			if (!res) {
				utils.hideLoading();
				return;
			}

			let result = (res.data || {}).result;

			if (res.statusCode === 200 && result && result.address) {
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
		}
	}
};
</script>

<style scoped lang="scss">
$grid-margin: 20rpx;

.wrapper {
	width: 100%;
	height: 742rpx;
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
}
</style>

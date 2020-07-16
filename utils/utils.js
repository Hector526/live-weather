const utils = {
	// 提示错误信息
	showError(message) {
		uni.showToast({
			title: message,
			icon: 'none',
			duration: 2000
		})
	},
	// 提示成功信息信息
	showSuccess(message) {
		uni.showToast({
			title: message,
			icon: 'success',
			duration: 2000
		})
	},
	showMessage(message, title, success) {
		const self = this;
		self.showModal({
			title: title || '',
			content: message,
			showCancel: false,
			success: function(res) {
				if (!!success) {
					success(res);
				}
			}
		});
	},
	showModal(param = {}) {
		if (undefined == param.showCancel) {
			param.showCancel = true;
		}
		uni.showModal({
			title: param.title || '',
			content: param.content || '',
			showCancel: param.showCancel,
			cancelText: param.cancelText || '取消',
			cancelColor: param.cancelColor || '#000000',
			confirmText: param.confirmText || '确定',
			confirmColor: param.confirmColor || '#1890FF',
			success: function(res) {
				if (!!param.success) {
					param.success(res);
				}
			},
			fail: function(res) {
				if (!!param.fail) {
					param.fail(res);
				}
			},
			complete: function(res) {
				if (!!param.complete) {
					param.complete(res);
				}
			}
		});
	},
	sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	},
	//去除字段空格
	trim(str) {
		return str.replace(/(^\s*)|(\s*$)/g, "");
	},
	//loading
	showLoading(message) {
		uni.showLoading({
			title: message || '加载中',
		});
	},
	//hideLoading
	async hideLoading(time) {
		const self = this;
		if (!!time && time > 0) {
			await this.sleep(time)
			uni.hideLoading();

		} else {
			uni.hideLoading();
		}
	},

	getDate(type) {
		const date = new Date();

		let year = date.getFullYear();
		let month = date.getMonth() + 1;
		let day = date.getDate();

		if (type === 'start') {
			year = year - 60;
		} else if (type === 'end') {
			year = year + 2;
		}
		month = month > 9 ? month : '0' + month;
		day = day > 9 ? day : '0' + day;

		return `${year}-${month}-${day}`;
	},

	stringifyDate(datetime, simple = false) {
		// let weekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		let weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		datetime = new Date(datetime);
		let year = datetime.getFullYear();
		let simpleYear = datetime.getYear() - 100;
		let month = datetime.getMonth() + 1;
		month = month > 9 ? month : '0' + month;
		let day = datetime.getDate();
		day = day > 9 ? day : '0' + day;
		let hour = datetime.getHours();
		hour = hour > 9 ? hour : '0' + hour;
		let min = datetime.getMinutes();
		min = min > 9 ? min : '0' + min;
		let week = datetime.getDay();
		week = weekMap[week];
		let thatDay = (new Date(year, month - 1, day, 0, 0, 0)).getTime();

		if (simple) {
			return {
				withYear: `${day}/${month}/${simpleYear}`,
				withMonth: `${month}-${day}`,
				withDay: `${week}`,
				withLastDay: `昨天`,
				withHour: `${hour}:${min}`,
				thatDay,
			};
		} else {
			return {
				withYear: `${year}-${month}-${day} ${hour}:${min}`,
				withMonth: `${month}-${day} ${hour}:${min}`,
				withDay: `${week} ${hour}:${min}`,
				withLastDay: `昨天 ${hour}:${min}`,
				withHour: `${hour}:${min}`,
				thatDay,
			};
		}
	},

	formatDate(datetime, simple = false) {
		let tempDate = (new Date()).getTime();
		let result = this.stringifyDate(datetime, simple);
		let thatDay = result.thatDay;
		let deltaTime = (tempDate - thatDay) / 1000;

		if (deltaTime < 3600 * 24) {
			return result.withHour;
		} else if (deltaTime < 3600 * 24 * 2) {
			return result.withLastDay;
		} else if (deltaTime < 3600 * 24 * 7) {
			return result.withDay;
		} else if (deltaTime < 3600 * 24 * 30) {
			return result.withMonth;
		} else {
			return result.withYear;
		}
	},

	airBackgroundColor: (aqi) => {
		if (aqi < 50) {
			return '#00cf9a'
		} else if (aqi < 100) {
			return '#00cf9a'
		} else if (aqi < 200) {
			return '#4295f4'
		} else if (aqi > 300) {
			return '#ff6600'
		}
	},
};

export default utils;

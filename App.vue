<script>
import utils from '@/utils/utils';
export default {
	methods: {
		checkNewVersion() {
			// 获取小程序更新机制兼容
			if (uni.canIUse('getUpdateManager')) {
				const updateManager = uni.getUpdateManager();
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					if (res.hasUpdate) {
						updateManager.onUpdateReady(function() {f
							updateManager.applyUpdate();
						});
						updateManager.onUpdateFailed(function() {
							// 新的版本下载失败
							utils.showModal({
								title: '已经有新版本了哟~',
								content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
							});
						});
					}
				});
			} else {
				// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
				utils.showModal({
					title: '提示',
					content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
				});
			}
		}
	},
	onLaunch: function() {
		console.log('App Launch');
		// #ifdef MP-WEIXIN
		this.checkNewVersion();
		// #endif
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	}
};
</script>

<style>
/*每个页面公共css */
</style>

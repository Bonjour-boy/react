import Vue from 'vue'
import vuex from 'vuex'
Vue.use(vuex);

export default new vuex.Store({
	strict: process.env.NODE_ENV !== 'production',
	state: {
		isBridgeReady: false,
		readyFunctionsQueue: [],
		//业务数据，使用前请先在下面声明，占个坑
		globalData: {}
	},
	mutations: {
		setBridgeReady: function (state) {
			state.isBridgeReady = true;
		},
		onConfReady: function (state, fn) {
			if (state.isBridgeReady) {
				fn();
			} else {
				state.readyFunctionsQueue.push(fn);
			}
		},
		executeFunctionsInQueue: function (state) {
			if (state.isBridgeReady) {
				for (let i = 0; i < state.readyFunctionsQueue.length; i++) {
					if (state.readyFunctionsQueue.length) {
						state.readyFunctionsQueue[0]();
						state.readyFunctionsQueue.splice(0, 1);
					}
				}
			}
		},
		//请使用setData将数据保存到globalData
		setState: function (state, obj) {
			state[obj.key] = obj.value;
		},
		setData: function (state, obj) {
			state.globalData[obj.key] = obj.value;
		}
	}
})
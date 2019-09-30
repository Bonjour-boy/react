
import { createStore } from 'redux';
// 构造数据处理中心
const counter = (state = {
	isBridgeReady: false,
	readyFunctionsQueue: [],
	//业务数据，使用前请先在下面声明，占个坑
	globalData: {},
}, action) => {
    // 执行对应的动作
    switch (action.type) {
        case 'setBridgeReady':
			state.isBridgeReady = true;
		break;

        case 'executeFunctionsInQueue':
			if (state.isBridgeReady) {
				for (let i = 0; i < state.readyFunctionsQueue.length; i++) {
					if (state.readyFunctionsQueue.length) {
						state.readyFunctionsQueue[0]();
						state.readyFunctionsQueue.splice(0, 1);
					}
				}
			};
		break;
		
		case 'onConfReady':
			if (state.isBridgeReady) {
				action.fn()
			} else {
				state.readyFunctionsQueue.push(action.fn);
			};
		break;	

        default:
            return { ...state }
    }
}

// 创建仓库
const store = createStore(counter);
export default store;
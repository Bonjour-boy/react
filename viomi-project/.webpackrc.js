const pxtorem = require('postcss-pxtorem');
const pxtorem2 = _interopRequireDefault(pxtorem).default;
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
export default {
	entry: "./src/index.js",
	"env": {
	  "development": {
			"extraBabelPlugins": [
				["import", { "style": "css", "libraryName": "antd" ,"libraryDirectory": "lib"}]
	    ],
			publicPath: "/",
	    extraPostCSSPlugins: [
				pxtorem2({ rootValue: 32, propWhiteList: [], })
	    ]
	  },
	  "production": {
			"extraBabelPlugins": [
				["import", { "style": "css", "libraryName": "antd" ,"libraryDirectory": "lib"}]
	    ],
			publicPath: "/pad4/dist/",
	    extraPostCSSPlugins: [
	      pxtorem2({ rootValue: 32, propWhiteList: [], })
	    ]
	  }
	}
}

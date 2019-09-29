let isPC = navigator.platform === 'Win32' || navigator.platform === 'MacIntel';
let ua = navigator.userAgent.toLowerCase();
let isIOS = /iPad|iPhone|iPod/i.test(ua) && !window.MSStream;
let isAndroid = ua.indexOf('android') > 0;
let clientId;
if (isIOS) {
	clientId = "2882303761517582137";
} else {
	clientId = "2882303761517574298";
}

export default {
	isPC,
	isIOS,
	isAndroid,
	clientId,
	getUrlParam(url){//处理url '?' 后的数据; 如：getUrlParam('https://lanhuapp.com/web/#/item/project/product?uid=123')=>>>>>//{uid: "123"}
		url = url || location.href;
	  if(url.indexOf("?") !== -1){
	    var arr = url.split("?");
	    arr.shift();
	    var str = arr.join("?");
	    arr = str.split("&");
	    var obj = {};
	    for(var i=0,ii;ii=arr[i++];){
	      var mid = ii.split("=");
	      var key = mid.shift();
	      obj[key] = mid.join("=");
	    }
	    return obj;
	  }
	  return {};
	}
}
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
    } else {
        document.addEventListener(
            "WebViewJavascriptBridgeReady",
            function () {
                callback(WebViewJavascriptBridge);
            },
            false
        );
    }
    if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement("iframe");
    WVJBIframe.style.display = "none";
    WVJBIframe.src = "https://__bridge_loaded__";
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
        document.documentElement.removeChild(WVJBIframe);
    }, 0);
}


setupWebViewJavascriptBridge(function (bridge) {
    window.bridge = bridge;
    this.$store.commit("setBridgeReady");
    this.$store.commit("executeFunctionsInQueue");
})
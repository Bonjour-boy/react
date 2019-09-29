<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {};
  },
  created: function() {
    const self = this;
    this.setupWebViewJavascriptBridge(function(bridge) {
      window.bridge = bridge;
      self.$store.commit("setBridgeReady");
      self.$store.commit("executeFunctionsInQueue");
    });
  },
  methods: {
    setupWebViewJavascriptBridge: function(callback) {
      if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
      } else {
        document.addEventListener(
          "WebViewJavascriptBridgeReady",
          function() {
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
      setTimeout(function() {
        document.documentElement.removeChild(WVJBIframe);
      }, 0);
    }
  }
};
</script>

<style lang="less">
@import "~vux/src/styles/reset.less";
@import "~vux/src/styles/1px.less";

html {
  font-size: calc(100vw/7.5);
}
body {
  background-color: #fbf9fe;
}
</style>

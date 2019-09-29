<template>
  <div class="page">
    <div class="header font-26">TDS值：{{deviceProp[0]}} ppm</div>
    <div class="content font-22" v-if="flag.isLoading">
      <div>加载中</div>
    </div>
    <div class="content font-22" v-if="!flag.isLoading && flag.online">
      <div>当前出水温度</div>
      <div class="font-88">
        {{deviceProp[1]}}
        <span class="font-22">℃</span>
      </div>
    </div>
    <div class="content font-22" v-if="(!flag.isLoading) && (!flag.online)">
      <div>设备离线</div>
    </div>
    <div class="footer vux-1px-t font-26">
      <div class="titt">查看温度</div>
      <div class="cont">
        <div class="circ" @click="(!flag.isLoading) && (flag.online)? flag.normalWaterDialog = true : ''">常温</div>
        <div class="circ" @click="(!flag.isLoading) && (flag.online)? flag.warnWaterDialog = true : ''">温水</div>
        <div class="circ" @click="(!flag.isLoading) && (flag.online)? flag.hotWaterDialog = true : ''">热水</div>
      </div>
    </div>

    <confirm
      title="常温键温度"
      :value="flag.normalWaterDialog"
      :hide-on-blur="true"
      content="<span class='strong'>20</span><span class='unit'>℃</span>"
      :show-cancel-button="false"
      @on-confirm="flag.normalWaterDialog=false"
      @on-hide="flag.normalWaterDialog=false"
    ></confirm>

    <confirm
      title="热水键温度"
      :value="flag.hotWaterDialog"
      :hide-on-blur="true"
      content="<span class='strong'>100</span><span class='unit'>℃</span>"
      :show-cancel-button="false"
      @on-confirm="flag.hotWaterDialog=false"
      @on-hide="flag.hotWaterDialog=false"
    ></confirm>

    <confirm
      title="设定温水键温度"
      :value="flag.warnWaterDialog"
      :hide-on-blur="true"
      @on-confirm="setWarnWater()"
      @on-cancel="flag.warnWaterDialog=false"
      @on-hide="flag.warnWaterDialog=false"
    >
      <slot>
        <div style="margin: 0.54rem auto;">
          <span class="strong">{{value}}</span>
          <span class="unit">℃</span>
        </div>
        <div style="position: relative">
          <range
            v-if="flag.warnWaterDialog"
            :min="40"
            :max="90"
            :step="1"
            :value="value"
            :range-bar-height="42"
            v-model="value"
            @on-change="dragChange"
            @on-touchstart="touchstart"
          ></range>
          <span class="min">40℃</span>
          <span class="max">90℃</span>
        </div>
      </slot>
    </confirm>
    <!-- 
    <group>
      <cell title="编码前str"></cell>
      <cell :title="str"></cell>
      <cell title="response"></cell>
      <cell :title="response"></cell>
    </group>

    <group :title="flag.isLoading ? 'get_prop loading...' : 'get_prop done'">
      <cell title="decoderesult"></cell>
      <cell :title="decoderesult"></cell>
    </group>-->
  </div>
</template>

<script>
import qs from "qs";
import { Group, Cell, Confirm, Range } from "vux";
import common from "../../common";
import { types } from "util";
import { clearInterval } from "timers";

let interval;
export default {
  components: {
    Group,
    Cell,
    Confirm,
    Range
  },
  data() {
    return {
      flag: {
        normalWaterDialog: false,
        warnWaterDialog: false,
        hotWaterDialog: false,
        isLoading: false,//
        online: true
      },
      urlParam: {
        did: "84829471",
        token: "V3_81wopngEMwxfH2GIA5_tCES9t0U-2eJjwT-1W4Dy8Yr_fwEJ011TfxlUVLpPZgcOUa_L1DctAMgod_VtPK5edjIOTVnP906Lvt9DJcPnCH_w4yFc6IlKns2azfrUq6Uf"
        // did: "84829471",
        // token: "V3_zyU7xWpnKURtltf4oz_0LDw1g4X5jojBLJvK0h0SN69qi9UDKRcqSR4jVTkysEKacyq0tyb2coOZ6oEzaVzHm7jGSDWCAADh-csVdlidonALRe3UPcPozccVbsvMPxUN"
      },
      value: 40,
      deviceProp: [],
      str: "",
      response: "",
      decoderesult: ""
    };
  },
  created() {
    this.urlParam = common.getUrlParam();
    this.$store.commit("onConfReady", this.bridgeReadyFn);
  },
  destroyed() {//销毁定时器
    clearInterval(interval);
  },
  methods: {
    bridgeReadyFn: function() {//开始定时器
      const that = this;
      interval = setInterval(function() {
        that.getProp();
      }, 2000);
    },
    getProp: function() {//判断系统并执行相应代码
      const that = this;
      let str = {
        method: "get_prop",
        did: this.urlParam.did,
        id: "1",
        params: ["tds", "setup_tempe", "custom_tempe1"]
      };
      if (common.isAndroid) {
        this.getSignData(str, this.propGetAndroid);
      } else {
        this.propGetIOS(str);
      }
    },
    propGetAndroid: function(blockedData) {//安卓系统
      const that = this;
      //post请求序列化
      let form = new FormData();
      form.append("clientId", common.clientId);
      form.append("accessToken", that.urlParam.token);
      form.append("data", blockedData);
      this.$http
        .post(
          "https://ms.viomi.com.cn/gateway/openapp/device/rpc/" +
            that.urlParam.did,
          form,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then(res => {
          //成功，安卓返回加密的data
          if (typeof res.data == "string") {
            let cb = function(that, result) {
              that.flag.isLoading = false;
              let decoderesult = JSON.parse(result);
              if (decoderesult.code == -2) {
                that.flag.online = false;
                return;
              }
              that.deviceProp = decoderesult.result;
              that.flag.warnWaterDialog? '' : that.value = that.deviceProp[2];
            };
            that.getDecodeData(res.data, that, cb);
          } else {
            that.flag.isLoading = false;
          }
        })
        .catch(error => {
          that.flag.isLoading = false;
        });
    },
    propGetIOS: function(str) {//IOS系统
      const that = this;
       //获取属性、加密数据、解密数据的三个方法(str需要加密，返回数据需要解密)
      window.bridge.callHandler("getYunMiDate", str, function(result) {
        let res = JSON.parse(result).result[0];
        that.flag.isLoading = false;
        if (res.code == 0) {
          that.deviceProp = res.result;
          that.flag.warnWaterDialog? '' : that.value = that.deviceProp[2];
        } else if (res.code == -2) {
          that.flag.online = false;
        }
      });
    },
    setWarnWater: function() {//温水设置（判断系统并执行相应代码）
      let that = this;
      let data = {
        method: "set_tempe_setup",
        did: this.urlParam.did,
        id: "1",
        params: [1, this.value]
      };
      if (common.isAndroid) {
        this.getSignData(data, this.warnWaterSetAndroid);//加密与解密
      } else {
        this.warnWaterSetIOS(data);
      }
    },
    warnWaterSetAndroid: function(blockedData) {//安卓系统温水设置
      const that = this;
      //post请求序列化
      let form = new FormData();
      form.append("clientId", common.clientId);
      form.append("accessToken", that.urlParam.token);
      form.append("data", blockedData);
      that.$http
        .post(
          "https://ms.viomi.com.cn/gateway/openapp/device/rpc/" +
            that.urlParam.did,
          form,//传参，序列化后的数据
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
        .then(res => {
          if (typeof res.data == "string") {
            let cb = function(that, result) {
              that.getProp();
            };
            that.getDecodeData(res.data, that, cb);
          } else {
          }
          that.flag.warnWaterDialog = false;
        })
        .catch(error => {
          that.flag.warnWaterDialog = false;
        });
    },
    warnWaterSetIOS: function(data) {//IOS系统温水设置
      const that = this;
      //获取属性、加密数据、解密数据的三个方法(data需要加密，返回数据需要解密)
      window.bridge.callHandler("getYunMiDate", data, function(result) {
        that.getProp();
      });
    },
    getSignData: function(data, cb) {//加密、解密
      const that = this;
      let s = JSON.stringify(data);
      //获取属性、加密数据、解密数据的三个方法(s需要加密，返回数据需要解密)
      window.bridge.callHandler("getYunMiSignData", s, function(res) {
        typeof cb == "function" && cb(res);
      });
    },
    getDecodeData: function(data, that, cb) {//加密、解密

      //获取属性、加密数据、解密数据的三个方法(data需要加密，返回数据需要解密)
      window.bridge.callHandler("getYunMiDecodeData", data, function(result) {
        typeof cb == "function" && cb(that, result);
      });
    },
    dragChange: function() {},
    touchstart: function() {}
  }
};
</script>

<style scoped>
.vux-1px-t:before {
  border-top-color: #ffffff;
  opacity: 0.2;
}
.font-22 {
  font-size: 0.22rem;
}
.font-26 {
  font-size: 0.26rem;
}
.font-88 {
  font-size: 0.88rem;
}
.margin-45 {
  margin-top: 0.45rem;
  display: inline-block;
}
.page {
  width: 100vw;
  min-height: 100vh;
  background-image: linear-gradient(-180deg, #214fcf 0%, #7cabe9 100%);
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  line-height: 1;
}
.header {
  width: 100%;
  padding-top: 0.12rem;
  box-sizing: border-box;
  text-align: center;
  color: #e3e2ee;
}
.content {
  width: 2.9rem;
  height: 3.7rem;
  background-image: url("../../common/image/drop_3x.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin: 1.5rem auto auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;
}
.content div:first-child {
  height: 0.3rem;
  line-height: 0.3rem;
}
.content div:nth-child(2) {
  height: 0.88rem;
  margin-top: 0.12rem;
  text-align: right;
}
.content div:nth-child(2) span {
  vertical-align: top;
}
.footer {
  width: 100vw;
  height: calc(292 / (1334 - 128) * 100vh);
}
.footer .titt {
  padding: 0.16rem 0;
  color: #ffffff;
  text-align: center;
}
.footer .cont {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0.3rem 0.82rem 0.85rem;
  box-sizing: border-box;
}
.footer .cont .circ {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 1px solid #ffffff;
  line-height: 1.1rem;
  text-align: center;
  color: #ffffff;
}
/* 覆盖vux样式 */
.vux-confirm /deep/ .weui-mask {
  background: rgba(0, 0, 0, 0.5);
}
.vux-confirm /deep/ .weui-dialog {
  bottom: 0.29rem;
  top: auto;
  width: calc(100vw - 0.6rem);
  max-width: calc(100vw - 0.6rem);
  border-radius: 0.1rem;
}
.vux-confirm /deep/ .weui-dialog .weui-dialog__hd {
  height: 0.46rem;
  line-height: 0.46rem;
  padding: 0.4rem 0 0;
  color: #404040;
}
.vux-confirm /deep/ .weui-dialog .weui-dialog__bd {
  padding: 0 0 1.06rem;
}
.vux-confirm /deep/ .weui-dialog .weui-dialog__bd .strong {
  height: 0.9rem;
  line-height: 0.9rem;
  font-size: 0.88rem;
  color: #404040;
  vertical-align: top;
  margin-top: 0.45rem;
  display: inline-block;
}
.vux-confirm /deep/ .weui-dialog .weui-dialog__bd .unit {
  font-size: 0.24rem;
  vertical-align: top;
  margin-top: 0.45rem;
  display: inline-block;
}
.vux-confirm /deep/ .weui-dialog .weui-dialog__ft {
  padding: 0.26rem;
}
.vux-confirm /deep/ .weui-dialog .weui-dialog__ft a {
  height: 0.46rem;
  line-height: 0.46rem;
  font-size: 0.34rem;
}
.vux-confirm /deep/ a.weui-dialog__btn:active {
  background: #ffffff;
}
.vux-confirm /deep/ .vux-range-input-box {
  width: 5.47rem;
  height: 0.84rem !important;
  margin: auto !important;
}
.vux-confirm /deep/ .range-bar {
  height: 0.84rem !important;
  border-radius: 0.42rem;
}
.vux-confirm /deep/ .range-handle {
  top: 1px;
  height: 0.8rem;
  width: 0.8rem;
  z-index: 99999;
}
.vux-confirm /deep/ .range-quantity {
  min-width: 0.8rem !important;
  border-radius: 0.24rem;
}
.vux-confirm /deep/ .range-min {
  display: none !important;
}
.vux-confirm /deep/ .range-max {
  display: none !important;
}
.vux-confirm /deep/ .range-quantity {
  min-width: 0.8rem;
  border-radius: 0.42rem;
}
.min {
  position: absolute;
  left: 1.04rem;
  top: 0;
  height: 0.84rem;
  line-height: 0.84rem;
  font-size: 0.24rem;
  color: #ffffff;
  z-index: 9999;
}
.max {
  position: absolute;
  right: 1.04rem;
  top: 0;
  height: 0.84rem;
  line-height: 0.84rem;
  font-size: 0.24rem;
  color: #44d4d4;
  z-index: 9999;
}
</style>

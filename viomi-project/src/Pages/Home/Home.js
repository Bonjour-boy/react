import React, { Component } from 'react';
import styles from './Home.css'
import { Modal, Slider } from 'antd-mobile';
import common from "../../main";//兼容
import {Provider,connect} from 'react-redux'
import store from '../../models/store'
let interval;
let seft;

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal1: false,//常温弹出
            modal2: false,//温水弹出
            modal3: false,//热水弹出
            changeTemp: null,//温水时改变温度
            initTemp: false,//温水时初始温度

            isLoading: false,//加载中
            online: true,//在线
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
              decoderesult: "",
              seft:null
        };
    }
    componentDidMount() {
        seft = this
        this.urlParam = common.getUrlParam();
        this.state.modal2 ? '' : this.state.value =50;
        // store.subscribe(() => console.log(store.getState()));
        // store.dispatch({
        //     type:'setBridgeReady',//使用store里setBridgeReady的方法（自定义的方法）
        // })
        // store.dispatch({
        //     type:'executeFunctionsInQueue',
        // })
        // store.dispatch({
        //     type:'onConfReady',
        //     fn: this.bridgeReadyFn()
        // })
        // console.log(store);
   
        this.setupWebViewJavascriptBridge(function (bridge) {
            window.bridge = bridge;
            store.dispatch({
                type:'setBridgeReady',//使用store里setBridgeReady的方法（自定义的方法）
            })
            store.dispatch({
                type:'executeFunctionsInQueue',
            })
        });
        store.dispatch({
            type:'onConfReady',
            fn: this.bridgeReadyFn
        })

    }
    componentWillUnmount(){
        clearInterval(interval)
    }

    setupWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            return callback(window.WebViewJavascriptBridge);
        } else {
            document.addEventListener(
                "WebViewJavascriptBridgeReady",
                function () {
                    callback(window.WebViewJavascriptBridge);
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

    bridgeReadyFn() {//开始定时器
        interval = setInterval(function() {
        seft.getProp();
        // console.log(9090);
        }, 2000);
    }
    getProp() {//判断系统并执行相应代码
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
    }
    propGetAndroid(blockedData){//安卓系统
        const that = this;
        //post请求序列化
        let form = new FormData();
        form.append("clientId", common.clientId);
        form.append("accessToken", that.urlParam.token);
        form.append("data", blockedData);
        this.$http
          .post(
            "https://ms.viomi.com.cn/gateway/openapp/device/rpc/" +
              that.state.urlParam.did,
            form,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          )
          .then(res => {
            //成功，安卓返回加密的data
            if (typeof res.data === "string") {
              let cb = function(that, result) {
                that.state.isLoading = false;
                let decoderesult = JSON.parse(result);
                if (decoderesult.code === -2) {
                  that.state.online = false;
                  return;
                }
                that.setState({
                    deviceProp : decoderesult.result
                })
                // that.state.modal2 ? '' : that.value = that.deviceProp[2];
                
              };
              that.getDecodeData(res.data, that, cb);
            } else {
              that.state.isLoading = false;
            }
          })
          .catch(error => {
            that.state.isLoading = false;
          });
      }
    propGetIOS(str){//IOS系统
        const that = this;
         //获取属性、加密数据、解密数据的三个方法(str需要加密，返回数据需要解密)
        window.bridge.callHandler("getYunMiDate", str, function(result) {
          let res = JSON.parse(result).result[0];
          that.state.isLoading = false;
          if (res.code === 0) {
            that.deviceProp = res.result;
            that.state.modal2 ? '' : that.value = that.deviceProp[2];
          } else if (res.code === -2) {
            that.state.online = false;
          }
        });
    }
    setWarnWater(){//温水设置（判断系统并执行相应代码）
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
    }
    warnWaterSetAndroid(blockedData){//安卓系统温水设置
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
            if (typeof res.data === "string") {
              let cb = function(that, result) {
                that.getProp();
              };
              that.getDecodeData(res.data, that, cb);
            } else {
            }
            that.state.modal2 = false;
          })
          .catch(error => {
            that.state.modal2 = false;
          });
    }
    warnWaterSetIOS(data){//IOS系统温水设置
        const that = this;
        //获取属性、加密数据、解密数据的三个方法(data需要加密，返回数据需要解密)
        window.bridge.callHandler("getYunMiDate", data, function(result) {
          that.getProp();
        });
    }
    getSignData(data,cb) {//加密、解密
        let s = JSON.stringify(data);
        //获取属性、加密数据、解密数据的三个方法(s需要加密，返回数据需要解密)
        window.bridge.callHandler("getYunMiSignData", s, function(res) {
          typeof cb === "function" && cb(res);
        });
    }

    getDecodeData(data,that,cb) {//加密、解密
        //获取属性、加密数据、解密数据的三个方法(data需要加密，返回数据需要解密)
        window.bridge.callHandler("getYunMiDecodeData", data, function(result) {
          typeof cb === "function" && cb(that, result);
        });
    }

    //常温
    normalWaterDialog = key => (e) => {
        e.preventDefault();
        this.setState({
            [key]: true,
        });
    }
    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }

    //温水
    warnWaterDialog = key => (e) => {
        e.preventDefault();
        this.setState({
            [key]: true,
        });
    }
    //取消按钮
    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }
    //确认按钮
    onConfirm = key => () => {
        this.setState({
            [key]: false,
        })
        this.setWarnWater()
    }
    //设定温度
    log = (name) => {
        return (value) => {
            this.setState({
                initTemp: true,
                changeTemp: value,
            })
            // console.log(`${name}: ${value}`);
        };
    }

    //热水
    hotWaterDialog = key => (e) => {
        e.preventDefault();
        this.setState({
            [key]: true,
        });
    }
    onClose = key => () => {
        this.setState({
            [key]: false,
        });
    }

    render() {
        return (
            <Provider store={store}>
             
                <div className={styles.app}>
                    <header className={styles.title}>TDS值：6 ppm</header>
                    {this.state.isLoading ? (
                        <main className={styles.main}>
                            <div className={styles.temp}>加载中</div>
                        </main>
                    ) : ''}
                    {!this.state.isLoading && this.state.online ? (
                        <main className={styles.main}>
                            <div className={styles.temp}>当前出水温度</div>
                            <div className={styles.font88}>
                                <span className={styles.font22}>℃</span>
                            </div>
                        </main>
                    ) : ''}
                    {!this.state.isLoading && !this.state.online ? (
                        <main className={styles.main}>
                            <div className={styles.temp}>设备离线</div>
                        </main>
                    ) : ''}
                    <footer className={styles.foot}>
                        <div className={styles.font26}>查看温度</div>
                        <div className={styles.list}>
                            <div className={styles.list1} onClick={!this.state.isLoading && this.state.online ? this.normalWaterDialog('modal1') : null}>常温</div>
                            <Modal
                                popup
                                visible={this.state.modal1}
                                onClose={this.onClose('modal1')}
                                animationType="slide-up"
                                className={styles.popup}
                            >
                                <div className={styles.nomaltemp}>常温键温度</div>
                                <div className={styles.numtemp}>20
                                <span className={styles.font30}>℃</span>
                                </div>
                                <div type="primary" className={styles.button} onClick={this.onClose('modal1')}>确认</div>
                            </Modal>
                            <div className={styles.list1} onClick={!this.state.isLoading && this.state.online ? this.warnWaterDialog('modal2') : null}>温水</div>
                            <Modal
                                popup
                                visible={this.state.modal2}
                                onClose={this.onClose('modal2')}
                                animationType="slide-up"
                                className={styles.popup}
                                style={{ height: 309 }}
                            >
                                <div className={styles.nomaltemp}>设定温水键温度</div>
                                <div className={styles.numtemp} style={{ marginTop: 30, marginBottom: 30 }}>
                                    {this.state.initTemp ? this.state.changeTemp : 40}
                                    <span className={styles.font30}>℃</span>
                                </div>
                                <Slider
                                    style={{ marginLeft: 23, marginRight: 50, touchAction: 'none' }}
                                    defaultValue={26}
                                    min={40}
                                    max={90}
                                    handleStyle={{ width: 40, height: 40, marginTop: 0, zIndex: 2 }}
                                    trackStyle={{ height: 40, borderRadius: 40, backgroundColor: '#29c7ca' }}
                                    railStyle={{ height: 40, borderRadius: 40, width: 302 }}
                                    onChange={this.log('change')}
                                    onAfterChange={this.log('afterChange')}
                                />
                                <span className={styles.init}>40℃</span>
                                <span className={styles.end}>90℃</span>
                                <div className={styles.button}>
                                    <div type="primary" className={styles.cancel} onClick={this.onClose('modal2')}>取消</div>
                                    <div type="primary" className={styles.confirm} onClick={this.onConfirm('modal2')}>确认</div>
                                </div>
                            </Modal>
                            <div className={styles.list1} onClick={!this.state.isLoading && this.state.online ? this.hotWaterDialog('modal3') : null}>热水</div>
                            <Modal
                                popup
                                visible={this.state.modal3}
                                onClose={this.onClose('modal3')}
                                animationType="slide-up"
                                className={styles.popup}
                            >
                                <div className={styles.nomaltemp}>热水键温度</div>
                                <div className={styles.numtemp}>100
                                <span className={styles.font30}>℃</span>
                                </div>
                                <div type="primary" className={styles.button} onClick={this.onClose('modal3')}>确认</div>
                            </Modal>
                        </div>
                    </footer>
                </div>
            </Provider>
        )
    }
}

export default connect(({ store }) => ({
    store,
}))(Home)
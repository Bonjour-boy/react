import React, { Component } from 'react';
import styles from './Home.css'
import { Modal, Slider } from 'antd-mobile';
import common from "../../main";//兼容
export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal1: false,//常温弹出
            modal2: false,//温水弹出
            modal3: false,//热水弹出
            changeTemp: null,//温水时改变温度
            initTemp: false,//温水时初始温度

            isLoading: false,//加载中
            online: true//在线
        };
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
        });
    }
    //设定温度
    log = (name) => {
        return (value) => {
            this.setState({
                initTemp: true,
                changeTemp: value,
            })
            console.log(`${name}: ${value}`);
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
                                <div type="primary" className={styles.cancel} onClick={this.onConfirm('modal2')}>取消</div>
                                <div type="primary" className={styles.confirm} onClick={this.onClose('modal2')}>确认</div>
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
        )
    }
}

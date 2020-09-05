<template>
  <div class="rwAudio" :style="auStyle" @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove">
    <audio ref="au" :src="src" preload="auto" loop="true"></audio>
    <div class="rwAudioHeader"><!-- 左侧头部-->
      <div class="rwAudioLogo" :style="logoStyle"><img :src="logo"></div><!-- 旋转 logo -->
      <div class="rwAudioButton" :style="logoStyle" v-html="isPlay ? svg.pause : svg.play" @click="play"></div><!-- 播放、暂停按钮 -->
    </div>
    <div class="rwAudioBody"><!-- 主体 -->
      <div class="rwAudioTitle"><div :title="title">{{ title }}</div></div><!-- 歌名 -->
      <div class="rwAudioDesc"><div :title="desc" ref="desc">{{ desc }}</div></div><!-- 描述 -->
      <div class="rwAudioCurrentTime"><div>{{ convertTimeText(currentTime) }}</div></div><!-- 当前时间 -->
      <div class="rwAudioProcess" @mouseup="processup" @mousemove.stop="processmove"><!-- 进度条 -->
        <div class="processTrack" ref="processTrack" @click="processTrackClick"><!-- 滑轨 -->
          <div class="processBar" :style="{ width: `${ (currentTime / totalTime) * 100 }%` }"></div><!-- 已走进度 -->
          <div class="circlePoint" @mousedown.stop="processdown"></div><!-- 小圆点 -->
        </div>
      </div>
      <div class="rwAudioTotalTime"><div>{{ convertTimeText(totalTime) }}</div></div><!-- 总时长 -->
    </div>
    <slot><!-- 插槽，可以放一些按钮 -->

    </slot>
  </div>
</template>

<script>

import base from '../base/base.vue'; // 组件继承
import { loading, play, pause } from './svg.js'; // svg 图标
import processMethods from './process.js'; // 滑轨相关方法
import controlMethods from './control.js'; // 流程控制相关方法

// 参数
const params = {
  type: Object,
  default: () => ({
    width: '600px', // 整体宽高
    height: '100px',
    bg: '', // 背景图 url
    title: '', // 歌名
    desc: '', // 歌曲描述
    descTime: '20s', // 描述滚动一次的时长
    logo: '', // 歌曲 logo url
    logoWH: '70px', // logo 边长
    logoRouteTime: '8s', // logo 旋转一次的时间
    author: '', // 歌曲作者
    position: { x: window.innerWidth - 670, y: 140 }, // 初始位置
    volume: 0.5, // 初始音量
  }),
}

/*
  方法：
  
*/

export default {
  extends: base,

  props: {
    src: String,
    params,
  },

  data() {
    this.supplyDefault(this.params, params.default); // 补充默认参数

    return {
      ... this.params, // 外部传入参数
      au: {}, // audio dom
      canplay: false, // audio dom 是否已准备完毕可播放
      isMouseDown: false, // 当前状态是否可拖拽
      startPosition: {}, // 每次开始拖拽时元素的起始坐标
      startPointerXY: {}, // 每次开始拖拽时鼠标的起始坐标
      isPlay: false, // 是否播放
      svg: { // 两个 svg 图标
        play, // 播放
        pause, // 暂停
      },
      currentTime: 0, // 当前播放时间
      totalTime: 0, // 总时长
      isCircleDown: false, // 小圆点拖拽
      tempTime: 0, // 鼠标移动小圆点时的起点进度
      circleStartX: 0, // 鼠标移动小圆点时的起始点
      circleDx: 0, // 鼠标移动小圆点时的偏移量
      listenId: [], // 监听音乐播放进度的间歇调用 id
    };
  },

  mounted() {
    this.au = this.$refs.au; // 获取 dom
    this.au.volume = this.volume;
    this.au.addEventListener('loadstart', () => this.canplay = false); // 请求数据回调
    this.au.addEventListener('canplay', () => { // 加载至可播放回调
      this.currentTime = parseInt(this.au.currentTime);
      this.totalTime = parseInt(this.au.duration);
      this.canplay = true;
    });
    const num = setInterval(() => { // 循环试探
      if(this.canplay) {
        this.descTranslate(); // 使描述开始滚动
        clearInterval(num); // 停止试探
      }
    }, 1000);
  },

  watch: {
    src() {
      for(let k in this.params)
        this[k] = this.params[k];
    }
  },

  computed: {

    // 整体样式
    auStyle() {
      return {
        width: this.width,
        height: this.height,
        left: this.position.x + 'px',
        top: this.position.y + 'px',
        background: `linear-gradient(to bottom,rgba(0, 0, 0, 0.4),rgba(0, 0, 0, 0.4)),url(${ this.bg }) no-repeat left/100%`,
      };
    },
    
    // logo 样式
    logoStyle() {
      const { logoWH, width } = this;
      return {
        width: logoWH,
        height: logoWH,
        'margin-top': `-${ parseInt(logoWH) / 2 }px`,
        'margin-left': `-${ parseInt(logoWH) / 2 }px`,
        'animation-play-state': this.isPlay ? '' : 'paused', // 动画开始、暂停
        'animation-duration': this.logoRouteTime, // 旋转一次的时间
      };
    }
  },

  methods: {

    // 将 s 转为 00:00 的形式
    convertTimeText(num) {
      const m = parseInt(num / 60); // 分
      const s = num % 60; // 秒
      const addZero = n => n > 10 ? n : `0${ n }`;
      return `${ addZero(m) }:${ addZero(s) }`;
    },

    // 整体按下
    mousedown(e) {
      this.startPosition = { x: this.position.x, y: this.position.y }; // 保存元素起点位置
      this.startPointerXY = { x: e.screenX, y: e.screenY }; // 保存鼠标起点位置
      this.isMouseDown = true; // 开启拖拽
    },
    
    // 整体松开
    mouseup() {
      this.isMouseDown = false; // 关闭拖拽
    },
    
    // 整体移动
    mousemove(e) {
      if(!this.isMouseDown) return;
      const dx = e.screenX - this.startPointerXY.x; // x、y 轴偏移量
      const dy = e.screenY - this.startPointerXY.y;
      this.position = { x: this.startPosition.x + dx, y: this.startPosition.y + dy };
    },

    // 描述滚动
    descTranslate() {
      const { $refs: { desc } } = this;
      const { height } = window.getComputedStyle(desc); // 获取 dom 高度
      const time = parseInt(this.descTime); // 滚动一次的时间
      const scroll = () => {
        desc.style.top = '0px';
        desc.style.transition = 'none';
        this.$nextTick(() => setTimeout(() => { desc.style.transition = `all ${ time }s linear`; desc.style.top = '-' + height; }, 100));
      }
      scroll();
      setInterval(scroll, (time + 0.1) * 1000);
    },

    ... processMethods, // 滑轨相关方法
    ... controlMethods, // 流程控制相关方法

  },
};

</script>

<style lang="scss">
  @import './rwAudio.scss';
</style>

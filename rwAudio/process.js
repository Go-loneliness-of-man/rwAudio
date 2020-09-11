
export default {
  
  // 进度条按下
  processdown(e) {
    this.isCircleDown = true; // 开启小圆点拖拽
    this.circleStartX = e.screenX; // 保存起点
    this.tempTime = this.currentTime; // 保存拖拽起点时间
    this.circleDx = 0; // 重置偏移量
    this.stopListenProcess(); // 停止进度监听
  },
  
  // 进度条松开
  processup() {
    if(!this.isCircleDown) return;
    this.au.currentTime = parseInt(this.currentTime); // 改变 currentTime
    this.isCircleDown = false; // 关闭小圆点拖拽
    this.listenProcess(); // 继续监听进度
  },
  
  // 进度条移动
  processmove(e) {
    if(!this.isCircleDown) return;
    const { $refs: { processTrack } } = this;
    const { width } = window.getComputedStyle(processTrack); // 获取滑轨 dom 宽度
    this.circleDx = e.screenX - this.circleStartX; // 计算偏移量
    this.currentTime = parseInt(this.tempTime + (this.circleDx / parseInt(width)) * this.totalTime); // 根据偏移量计算移动到的时间
  },

  // 点击滑轨
  processTrackClick(e) {
    const { $refs: { processTrack } } = this;
    const start = processTrack.getBoundingClientRect().left; // 获取滑轨到屏幕左边缘距离
    const { width } = window.getComputedStyle(processTrack); // 获取滑轨 dom 宽度
    const dx = (e.screenX - start) / parseInt(width); // 计算比例
    this.au.currentTime = parseInt(dx * this.totalTime); // 算出具体跳转时间并跳转
    this.currentTime = this.au.currentTime; // 同步到进度条
  },
}

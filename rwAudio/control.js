
export default {
  
  // 播放
  play() {
    let num = null;
    const playMusic = () => {
      this.au.play();
      this.isPlay = true;
      this.$emit('play', this.au);
      this.stopListenProcess(); // 先清一波监听
      this.listenProcess(); // 监听播放进度
      clearInterval(num); // 播放成功，停止试探
    };
    if(!this.isPlay && this.canplay) playMusic(); // 暂停状态，且可播放，则播放
    else if(this.isPlay) this.pause(); // 在 play 状态下点击，即为暂停
    else num = setInterval(() => this.canplay ? playMusic() : '', 1000); // 未缓冲完毕，循环试探播放
  },

  // 暂停
  pause() {
    this.stopListenProcess(); // 先清一波监听
    this.au.pause();
    this.isPlay = false;
    this.$emit('pause', this.au);
  },

  // 监听音乐播放进度
  listenProcess() {
    this.listenId.push(setInterval(() => {
      this.currentTime = parseInt(this.au.currentTime);
      this.totalTime = parseInt(this.au.duration);
    }, 1000));
  },

  // 停止监听音乐播放进度
  stopListenProcess() {
    this.listenId.forEach(v => clearInterval(v));
  },
}

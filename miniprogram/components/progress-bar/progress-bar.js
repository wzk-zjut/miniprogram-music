// components/progress-bar/progress-bar.js
let movableAreaWidth = 0;
let movableViewWidth = 0;
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1;
let duration = 0;
let isMoving = false;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime:'00:00',
      totalTime:'00:00'
    },
    movabelDis:0,
    progress:0
  },
  lifetimes:{
    ready(){
      if(this.properties.isSame&&this.data.showTime.totalTime=='00:00'){
        this._setTime()
      }
      this._getMovableDis();
      this._bindBGMEvent();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){
      if(event.detail.source === 'touch'){
        // console.log(event.detail.x)
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving=true;
      }
    },
    onTouchEnd(){
      // const currentTimeFmt = this._dataFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress:this.data.progress,
        movabelDis:this.data.movabelDis,
        // ['showTime.currentTime']:currentTimeFmt.min+':'+currentTimeFmt.sec
      })
      backgroundAudioManager.seek(duration*this.data.progress/100)
      isMoving=false;
    },
    _getMovableDis(){
      const query = this.createSelectorQuery();
      query.select('.movable-area').boundingClientRect();
      query.select('.movable-view').boundingClientRect();
      query.exec((rect)=>{
        movableAreaWidth = rect[0].width;
        movableViewWidth = rect[1].width;
      })
    },
    _bindBGMEvent(){
      backgroundAudioManager.onPlay(()=>{
        isMoving = false;
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {

      })
      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {

      })
      backgroundAudioManager.onCanplay(() => {
        if(typeof backgroundAudioManager.duration!='undefined'){
          this._setTime();
        }else{
          setTimeout(()=>{
            this._setTime();
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        if(!isMoving){
          const currentTime = backgroundAudioManager.currentTime;
          const duration = backgroundAudioManager.duration;
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            const currentTimeFmt = this._dataFormat(currentTime)
            this.setData({
              movabelDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = sec
            this.triggerEvent('timeUpdate',{
              currentTime
            })
          }
        }
      })
      
      backgroundAudioManager.onError((res) => {
        console.log(res.errMsg)
      })
    },
    _setTime(){
      duration = backgroundAudioManager.duration
      const durationFmt = this._dataFormat(duration)
      this.setData({
        ['showTime.totalTime']:`${durationFmt.min}:${durationFmt.sec}`
      })
      
    },
    _dataFormat(sec){
      const min = Math.floor(sec/60);
      sec = Math.floor(sec%60);
      return {
        'min':this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    _parse0(sec){
      return sec<10? '0'+sec:sec
    }
  }
})

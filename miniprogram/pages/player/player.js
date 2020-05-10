// pages/player/player.js
let musiclist = []
let nowPlayingIndex = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: "",
    isPlaying: false,
    isloop:false,
    isLyricShow:false,
    lyric:"",
    isSame:false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync("musiclist")
    this._loadMusicDetail(options.musicId)
    this._BGMEvent(options)
  },
  toggleLoop(){
    this.setData({
      isloop:!this.data.isloop
    })
    if (this.data.isloop){
      wx.showToast({
        title: '单曲循环',
        icon: 'none',
        duration: 1000
      })
    }else{
      wx.showToast({
        title: '列表循环',
        icon: 'none',
        duration: 1000
      })
    }
  },
  onPlay(){
    this.setData({
      isPlaying:true
    })
  },
  onPause(){
    this.setData({
      isPlaying: false
    })
  },
  savePlayHistory(){
    const music=musiclist[nowPlayingIndex]
    const openid=app.globalData.openid
    const history=wx.getStorageSync(openid)
    let bHave=false
    for(let i=0;i<history.length;i++){
      if(history[i].id==music.id){
        bHave=true
        break
      }
    }
    if(!bHave){
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
      })
    }
  },
  _BGMEvent(options){
    // console.log(options)
    backgroundAudioManager.onEnded(()=>{
      // console.log(options)
      // console.log(this.data.isloop)
      if (!this.data.isloop) {
        this.onNext();
      } else {
        let music = musiclist[nowPlayingIndex]
        // console.log(music)
        wx.setNavigationBarTitle({
          title: music.name,
        })
        this.setData({
          picUrl: music.al.picUrl,
          isPlaying: false
        })
        app.setPlayingMusicId(options.musicId)
        wx.showLoading({
          title: '全力加载中',
          mask: true
        })
        wx.cloud.callFunction({
          name: 'music',
          data: {
            $url: 'musicUrl',
            musicId: options.musicId
          }
        }).then((res) => {
          // console.log(JSON.parse(res.result))
          let result = JSON.parse(res.result)
          if (result.data[0].url == null) {
            wx.hideLoading();
            this.onNext();
          } else {
            
              backgroundAudioManager.src = result.data[0].url;
              backgroundAudioManager.title = music.name;
              backgroundAudioManager.coverImgUrl = music.al.picUrl;
              backgroundAudioManager.singer = music.ar[0].name;
              backgroundAudioManager.epname = music.al.name;
              
              // console.log(111)
            
            this.setData({
              isPlaying: true
            })
            // app.setIsPlaying(this.data.isPlaying);
            wx.hideLoading()
            wx.cloud.callFunction({
              name: 'music',
              data: {
                musicId:options.musicId,
                $url: 'lyric',
              }
            }).then((res) => {
              // console.log(res)
              let lyric = '暂无歌词'
              const lrc = JSON.parse(res.result).lrc;
              if (lrc && lrc.lyric != "") {
                lyric = lrc.lyric
              }
              this.setData({
                lyric
              })
            })
          }

        })
      }
      // this._loadMusicDetail(options.musicId);
      // console.log(this.data.isSame)
      // this.togglePlaying()
      // console.log(this.data.isSame);
      
      // this.setData({
      //   isPlaying: true
      // })
    })
      
    
  },
  _loadMusicDetail(musicId) {
    if(musicId==app.getPlayingMusicId()){
      this.setData({
        isSame:true
      })
    }else{
      this.setData({
        isSame:false
      })
    }
    if(!this.data.isSame){
      backgroundAudioManager.stop();
      // console.log(111)
    }
    let music = musiclist[nowPlayingIndex]
    // console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    app.setPlayingMusicId(musicId)
    wx.showLoading({
      title: '全力加载中',
      mask:true
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        $url: 'musicUrl',
        musicId: musicId
      }
    }).then((res) => {
      // console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)
      if (result.data[0].url==null){
        wx.hideLoading();
        this.onNext();
      }else{
        if(!this.data.isSame){
          backgroundAudioManager.src = result.data[0].url;
          backgroundAudioManager.title = music.name;
          backgroundAudioManager.coverImgUrl = music.al.picUrl;
          backgroundAudioManager.singer = music.ar[0].name;
          backgroundAudioManager.epname = music.al.name;
          this.savePlayHistory()
          // console.log(111)
        }
        this.setData({
          isPlaying: true
        })
        // app.setIsPlaying(this.data.isPlaying);
        wx.hideLoading()
        wx.cloud.callFunction({
          name:'music',
          data:{
            musicId,
            $url:'lyric',
          }
        }).then((res)=>{
          // console.log(res)
          let lyric = '暂无歌词'
          const lrc = JSON.parse(res.result).lrc;
          if(lrc&&lrc.lyric!=""){
            lyric = lrc.lyric
          }
          this.setData({
            lyric
          })
        })
      }
      
    })
  },
  onChangeLyricShow(){
    this.setData({
      isLyricShow:!this.data.isLyricShow
    })
  },
  timeUpdate(event){
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  togglePlaying() {
    // console.log(111);
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  onPrev() {
    nowPlayingIndex--;
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext() {
    nowPlayingIndex++;
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0;
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    if (this.data.isSame) {
      this.togglePlaying()
    }
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
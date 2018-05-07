// pages/list/list.js
const dayMap= ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({
  data:{
    weekWeather: [],
    city:""
  },

  onLoad(options){
    console.log("成功进入第二个页面onLoad" + options.city)
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },

  onPullDownRefresh(){
    this.getWeekWeather(()=>{
      wx.stopPullDownRefresh()
    })
  },

  getWeekWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: this.data.city
      },
      success: res => {
        console.log("成功进入第二个页面getWeekWeather"+this.data.city)
        let result = res.data.result
        this.setWeekWeather(result)
      },
      complete: ()=>{
        callback&&callback()
      }
    })
  },

  setWeekWeather(result) {
    let weekWeather = []
    for (let i = 0; i < 7; i++) {
      let date = new Date()
      date.setDate(date.getDate() + i)
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].minTemp}°-${result[i].maxTemp}°`,
        iconPath: '/image/' + result[i].weather + '-icon.png'
      })
    }
    this.setData({
      weekWeather: weekWeather
    })
  }

})
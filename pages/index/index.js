const weatherMap={
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

const QQMapWX = require('../libs/qqmap-wx-jssdk.js')

Page({
  data:{
    nowTemp: '14',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
    cityName:'广州市',
    locationAuthType: UNPROMPTED,
    locationTipsText: UNPROMPTED_TIPS
  },

  onPullDownRefsh:function(){
  this.getNow(()=>{wx.stopPullDownRefresh()
  })
  },

  onLoad(){
    console.log('onLoad')
    this.qqmapsdk = new QQMapWX({
      key: 'HB7BZ-HS5KJ-FK5FI-KELCC-HDUE2-3SFRU'
    })
    this.onTapLocation()
  },

  onShow(){
    console.log('onShow')
    wx.getSetting({
      success: res =>{
        let auth = res.authSetting['scope.userLocation']
        console.log("auth "+auth)
        if(auth&&this.data.locationAuthType!==AUTHORIZED){
          //权限从无到有
          this.setData({
            locationAuthType:AUTHORIZED,
            locationTipsText:AUTHORIZED_TIPS
          })
          this.getLocation()
        }
      }
    })
  },

  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', //仅为示例，并非真实的接口地址
      data: {
        city: this.data.cityName 
      },
      success: res => {
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  //获取当前天气
  setNow(result){
    
    let temp = result.now.temp
    let weather = result.now.weather
    console.log(temp, weather)

    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherColor: weatherColorMap[weather],
      nowWeatherBackground: '/image/' + weather + '-bg.png'
    })

    /*设置标题行颜色*/
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

 //获取未来天气
  setHourlyWeather(result){
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 24; i += 3) {
      hourlyWeather.push({
        time: (i + nowHour) % 24 + '时',
        iconPath: '/image/' + forecast[i / 3].weather + '-icon.png',
        temp: forecast[i / 3].temp + '°'
      })
    }

    //赋值
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  //获取今天日期、最低最高温度
  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp:  `${result.today.minTemp}°-${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 今天`
    })
  },

  //获取位置
  onTapLocation(){
    if (this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting({})
    else
      this.getLocation()
    },

  getLocation(){
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        this.qqmapsdk.reverseGeocoder({
          location:{
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res=> {
            let city= res.result.address_component.city
            this.setData({
              cityName: city,
              locationTipsText:""
            })
            this.getNow()
          }
        })
      },
      fail:()=>{
        this.setData({
          locationAuthType:UNAUTHORIZED,
          locationTipsText:UNAUTHORIZED_TIPS
        })
      }
    })
  },

  //切换到第二个页面
  onTabDayWeather(){
    console.log("onTabDayWeather")
    wx.showToast()
    wx.navigateTo({
    url: '/pages/list/list?city='+this.data.cityName
    })
  }
})
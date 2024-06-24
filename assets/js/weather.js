// import {dfs_xy_conv, apiKey} from "./utils.js";
import {apiKey, dfs_xy_conv} from "./utils.js";

const $ = (elem) => document.querySelector(elem);
const API_KEY = apiKey;

// 시간 데이터 설정
const date = new Date();
const today = date.toISOString().split('T')[0].replace(/-/g, '');
// 기상청 자료 매시 40분에 업데이트, 40분 전에는 이전시간으로 나오도록
const nowTime = date.getMinutes() < 40 ? (date.getHours() - 1).toString().padStart(2, '0') + '00' : (date.getHours()).toString().padStart(2, '0') + '00';

// 기상청 현재 지역 날씨 가져오는 API
const getWeather = async (today, nowTime) => {
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${today}&base_time=${nowTime}&nx=60&ny=127`;
  try {
    const response = await axios.get(url, { responseType: 'json' });
    switch(response.data.response.header.resultCode){
      case '00':
        return response.data.response.body.items.item;
      default:
        alert('error!') // server error (기상청)
    }
  } catch(error){
    alert('error!'); // client error (ex APIKEY)
  }
}

// // 현재 지역 가져오기
// const getCurrentLocation = async () => {
//   try {
//     const position = await new Promise((resolve, reject) => {
//       navigator.geolocation.getCurrentPosition(resolve, reject);
//     });
//     const { latitude: lat, longitude: lon } = position.coords;
//     const { x: latX, y: lonY } = dfs_xy_conv("toXY", lat, lon);
//     const weatherData = await getWeather(latX, lonY, today, nowTime);
//     return weatherData;
//   } catch (error) {
//     throw error; // 위치 정보 동의 error or getWeather error
//   }
// };

getWeather(today, nowTime)
    .then(response => {
      console.log(response)
      let temp, rainy;
      response.find(item => {
        if(item.category === 'T1H') temp = item.obsrValue;
        if(item.category === 'PTY') rainy = item.obsrValue;
      });
      $('.temp').innerText = `현재 날씨는 ${temp}°C입니다`;
      $('.rainy').innerText = rainy > 0 ? '지금 비가 오고 있어요☂️' : '지금은 맑아요☀️'
    })
    .catch(error => {
      if(error.message === 'User denied Geolocation'){
        $('.temp').innerText = '기능을 사용하기 위해서 위치 정보 수집을 허용해주세요'
      }else {
        alert('error2!')
      }
    });
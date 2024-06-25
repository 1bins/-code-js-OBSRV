import {apiKey} from "./utils.js";

// fastClick
window.addEventListener('DOMContentLoaded', function() {
  FastClick.attach(document.body);
}, false);

const $ = (elem) => document.querySelector(elem);
const API_KEY = apiKey;

// 시간 데이터 설정
const newDate = new Date();

// 오늘날짜 구하기
const today = () => {
  const year = newDate.getFullYear();
  const month = newDate.getMonth() + 1;
  const date = newDate.getDate();

  return `${year}${String(month).padStart(2,'0')}${String(date).padStart(2,'0')}`
}

// 기상청 자료 매시 40분에 업데이트, 40분 전에는 이전시간으로 나오도록
const nowTime = newDate.getMinutes() < 40 ? (newDate.getHours() - 1).toString().padStart(2, '0') + '00' : (newDate.getHours()).toString().padStart(2, '0') + '00';

// 기상청 현재 지역 날씨 가져오는 API
const getWeather = async (today, nowTime) => {
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${today}&base_time=${nowTime}&nx=60&ny=127`;
  try {
    const response = await axios.get(url, { responseType: 'json' });
    switch(response.data.response.header.resultCode){
      case '00':
        return response.data.response.body.items.item;
      default:
        console.log(response)
    }
  } catch(error){
    alert('error!'); // client error (ex APIKEY)
  }
}

// touchAction
const touchAction = (initialTemp) => {
  let temp = Math.round(initialTemp);
  let opacityIncrement = parseFloat((1/initialTemp).toFixed(3));
  let currentOpacity = 0;
  $('.temp').innerText = temp;

  const updateDisplay = () => {
    $('.temp').innerText = temp;
    $('.item').style.transform = temp % 2 === 0 ? 'rotate(-12deg)' : 'rotate(12deg)';
    $('.bg').style.opacity = currentOpacity;

    if (temp === 0) {
      $('.item').style.transform = 'rotate(-12deg) scale(1.2)';
    }
  };

  const handleInteraction = () => {
    if (temp > 0) {
      temp -= 1;
      currentOpacity += opacityIncrement;
      updateDisplay();
    }
  }
  $('.touch-box').addEventListener('touchstart', handleInteraction);
}

getWeather(today(), nowTime)
    .then(response => {
      let temp;
      response.find(item => {
        if(item.category === 'T1H') temp = item.obsrValue;
      });
      touchAction(temp);
    })
    .catch(error => {
      console.log(error);
    });
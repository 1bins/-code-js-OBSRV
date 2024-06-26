import {apiKey} from "./utils.js";

// ========================
// 데이터 설정 및 초기화
// ========================
// fastClick
window.addEventListener('DOMContentLoaded', function() {
  FastClick.attach(document.body);
}, false);

const $ = (elem) => document.querySelector(elem);
const newDate = new Date();

// ========================
// WeatherModule
// ========================
const WeatherModule = (() => {
  const API_KEY = apiKey;

  // 오늘날짜 구하기
  const today = () => {
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const date = newDate.getDate();

    return `${year}${String(month).padStart(2,'0')}${String(date).padStart(2,'0')}`
  }

  // 기상청 자료 매시 40분에 업데이트, 40분 전에는 이전시간으로 나오도록
  const nowTime = () =>{
    return newDate.getMinutes() < 40
    ? (newDate.getHours() - 1).toString().padStart(2, '0') + '00'
    : (newDate.getHours()).toString().padStart(2, '0') + '00';
  }

  // 기상청 현재 지역 날씨 가져오는 API
  const getWeather = async () => {
    const todayDate = today();
    const time = nowTime();
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${todayDate}&base_time=${time}&nx=60&ny=127`;

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

  return {
    init: getWeather
  };
})();

// ========================
// TouchAnimationModule
// ========================
const TouchAnimationModule = (() => {
  // makeTwwen
  const canAnimation = (initialTemp) => {
    const tl = gsap.timeline({defaults: {ease: "back.out()"}})
      .to('.item', {rotate: initialTemp % 2 == 0 ? 19 : -19, scale: 1.08, duration: .2})
      .to('.item', {scale: 1, duration: .1}, '-=.05')

    return tl;
  }

  // touchAction
  const touchAction = (initialTemp) => {
    let temp = Math.round(initialTemp);
    let opacityIncrement = parseFloat((1/initialTemp).toFixed(3));
    let currentOpacity = 0;
    $('.temp').innerText = temp;

    const updateDisplay = () => {
      $('.temp').innerText = temp;
      canAnimation(temp);
      $('.bg').style.opacity = currentOpacity;

      if (temp === 0) {
        gsap.killTweensOf('.item');
        gsap.to('.item', {rotate: 8, scale: 1.1, duration: .1, ease: "back.out()"})
      }
    };

    const handleInteraction = () => {
      if (temp > 0) {
        temp -= 1;
        currentOpacity += opacityIncrement;
        updateDisplay();
      }
    }
    $('.touch-box').addEventListener('touchstart', handleInteraction); //click
  }

  return {
    init: touchAction
  }

})();

// ========================
// DayNightModule
// ========================
const DayNightModule = (() => {
  // 낮과 밤 구분
  const determineDayOrNight = () => {
    let hour = new Date().getHours();
    return (hour >= 9 && hour < 21) ? 'day' : 'night';
  }

  // body태그 추가
  const applyBodyClass = () => {
    if(determineDayOrNight() === 'night') document.body.classList.add('-night');
  }

  // 이미지 구분(낮/밤)
  const changeImages = () => {
    let now = determineDayOrNight();
    // changeImage
    if(now === 'night'){
      document.querySelectorAll('img').forEach(img => {
          let src = img.getAttribute('src');
          if(src.includes('.jpg')){
            img.src = src.replace('_day.jpg', '_night.jpg');
          }else if(src.includes('.png')){
            img.src = src.replace('_day.png', '_night.png');
          }
      });
    }  
  }

  return {
    init: () => {
      applyBodyClass();
      changeImages();
    }
  }
})();


// ========================
// 함수 호출
// ========================
// DayNightModule_낮과 밤 구분
DayNightModule.init();
// WeatherModule_기상청 날씨 가져오기 및 터치애니메이션
WeatherModule.init()
    .then(response => {
      let temp;
      response.find(item => {
        if(item.category === 'T1H') temp = item.obsrValue;
      });
      TouchAnimationModule.init(temp);
    })
    .catch(error => {
      console.log(error);
    });
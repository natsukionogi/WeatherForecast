//変数名を定義·宣言 +++++++++++++++++++++++++++++++++++

//追加するウィジット要素定義
const hot_anime = '<span class="sun"></span><span class="sunx"></span>';
const cloudy_anime = '<span class="cloud"></span><span class="cloudx"></span>';
const stormy_anime = '<ul><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul><span class="snowe"></span><span class="snowex"></span><span class="stick"></span><span class="stick2"></span>';
const breezy_anime = '<ul><li></li><li></li><li></li><li></li><li></li>	</ul><span class="cloudr"></span>'

//現在地の町の名前と国名
var city_name;
var country_name;
//今のひにち
var next_mindatetime;
//現在の天気と温度と湿度
var now_weather;
var now_temperature;
var now_humidity;
//今日(その日)の3時間ごとの気象データの配列
var three_array = [];
//5日間の気象データの配列
var five_array = [];
//現在の時刻
const now = new Date();
const now_date = now.getDate();

//データの取得完了フラグ
var flg_load = false;



//++++++++++++++++++++++++++++++++++++++++++++++++++++++
//地理情報
function success(pos) {//唯一，GeolocationPositionオブジェクトを引数として受け取る
    ajaxRequest(pos.coords.latitude, pos.coords.longitude);//coords:座標，latitude:緯度，longitude:経度
}
//エラーを引数に受け取る
function fail(error) {
  alert('位置情報の取得に失敗しました。エラーコード:' + error.code);
}

//デバイス(PCやスマホ)の現在位置を取得するメソッド，引数1:成功した時に，値を渡すメソッド,引数2：エラーを受け取るメソッド
navigator.geolocation.getCurrentPosition(success, fail);
  
//UTCをミリ秒に
function utcToJSTime(utcTime) {
  return utcTime * 1000;
}

//データ取得メソッド
function ajaxRequest(lat, long) {
    const appId = '';  //自分のAPI_KEY
    const url = 'https://api.openweathermap.org/data/2.5/forecast';//クエリ送り先のURL

    $.ajax({
      url: url,//クエリ送り先のURL
      data: {
        appid: appId,//API_KEY
        lat: lat,//現在地の緯度
        lon: long,//現在地の経度
        units: 'metric',//単位の指定(metric:メートル制)
        lang: 'ja',//日本語を指定
        type: 'GET'//HTTPメソッドを指定(指定しなくてもGETになるけど)
      }
    })

  //通信が成功したときのコールバックの処理
  .done(
    function(data) {//dataに，ajax通信でAPIから送られてきたデータが入っている(JSON型)
      //console.log(data);//レスポンスの全データ

      //「現在地の町の名前と国名」取得
      city_name = data.city.name;//console.log(city_name);
      country_name = data.city.country;//console.log(country_name);
    
      data.list.forEach(
        function(forecast,index){//forecast:その要素を表してる, indexは配列の添字

          //観測された日時の取得 
          const dateTime = new Date(utcToJSTime(forecast.dt));//日時の取得（datetime型）
          const month = dateTime.getMonth() + 1;//月
          const date = dateTime.getDate();//日付
          const hours = dateTime.getHours();//時間
          const min = String(dateTime.getMinutes()).padStart(2, '0');//分

          //気象データ
          const weather = forecast.weather[0].main;//天気
          const temperature = Math.round(forecast.main.temp);//温度
          const humidity = forecast.main.humidity;//湿度
          const tenkiIcon = forecast.weather[0].icon;//天気のアイコンの識別子

          //「現在の温度と湿度」取得
          if(index == 0){
            now_weather = weather;//直近の天気
            now_temperature = temperature;//直近の温度
            now_humidity = humidity;//直近の湿度
            //next_mindatetime = date;//0を含めて3の倍数の時刻の最小値の日付を取得

            let [now_weather_img,now_weather_str] = DiplayTenkiIcon(now_weather);
            //天気のアイコンと天気名称を取得
            console.log(now_weather_img);
            console.log(now_weather_str);
            //HTML表示の処理
            $('#place').text('City: ' + city_name + '　 ' + 'Country:' + country_name);//現在地の都市名、国名
            $('#weatherStr').text('天気:' + now_weather_str + '　　温度:' + now_temperature + '°C' + '　　湿度:' +now_humidity + '%');//現在地の天気を示す文字列
            $('#widget').append(`<img class="imgCss" src=${now_weather_img}></img>`);//天気アイコン追加 
            DisplayTenki(tenkiIcon);
          }
          //「今日の3時間ごとの気象データ」取得
          if(date == now_date){//条件:まだ今日の日付であれば
            //3時間ごとの気象データを配列に追加までの処理
            var three_hours_forecast = {//今日(その日)の3時間ごとの気象データをまとめたオブジェクト
              weather: null,//その3時間の天気
              temperature: null,
              humidity: null,
              hours: null,
              min: null
            }
            three_hours_forecast.weather = weather;
            three_hours_forecast.temperature = temperature;
            three_hours_forecast.humidity = humidity;
            three_hours_forecast.hours = hours;
            three_hours_forecast.min = min;
            three_array.push(three_hours_forecast);
          }
          //「5日間の気象データ」取得
          if(String(hours) == '12'){
            //5日間の気象データを配列に追加までの処理
            var five_forecast = {//5日間の気象データをまとめたオブジェクト
              weather: null,//その日の天気
              temperature: null,//その日の12時の温度
              humidity: null,//その日の湿度
              month: null,
              date: null
            }
            five_forecast.weather = weather;
            five_forecast.temperature = temperature;
            five_forecast.humidity = humidity;
            five_forecast.month = month;
            five_forecast.date = date;
            five_array.push(five_forecast);
          }
        }
      )//list.forEachの終わり
    //HTML表示の処理  
    console.log(three_array);
    console.log(five_array);
    DisplayTable(three_array,'#hoursTable');//3時間おきの天気テーブル
    DisplayTable(five_array,'#fiveDaysTable');//5日間の天気テーブル
    }//ajax通信が成功した時の処理終了
  )//.doneメソッドの終わり
  //通信が失敗したときのコールバックの処理
  .fail(function() {console.log('$ajax failed!');})
  flg_load = true;//データ取得完了
}//ajaxRequestメソッドの終わり


//天気によって表示を変えるメソッド
function DisplayTenki(tenkiID){
  //天気IDによって，表示を変える条件分岐
  switch (tenkiID){//天気の識別子
    //nは夜
    case '01d'://快晴
    case '02d'://晴れ
    case '01n'://晴れ
    case '02n'://晴れ
      $('#widget').toggleClass('hot icon-bg');
      $('#widget').append(hot_anime);
      break;
    case '03d'://くもり
    case '04d'://くもり(やや強め)
    case '03n'://くもり
    case '04n'://くもり(やや強め)
    $('#widget').toggleClass('cloudy icon-bg');
    $('#widget').append(cloudy_anime);
      break;
    case '09d'://小雨
    case '10d'://雨
    case '11d'://激しい雨
    case '09n'://小雨
    case '10n'://雨
    case '11n'://激しい雨
      $('#widget').toggleClass('breezy icon-bg');
      $('#widget').append(breezy_anime);
      break;
    case '13d'://雪
    case '13n'://雪
      $('#widget').toggleClass('stormy icon-bg');
      $('#widget').append(stormy_anime);
      break;
    case '14d'://もや
    case '14n'://靄（もや）
      break;
  }
}

//テーブル表示メソッド
function DisplayTable(argArray,tableName){
  argArray.forEach(function(element){
    //アイコンを取得
    let [img_tenki,str_tenki] = DiplayTenkiIcon(element.weather);
    
    //引数の値を条件に処理を変える
    var hoge = (tableName == '#hoursTable') ? `<td>${element.hours}:${element.min}</td>` : `<td>${element.month}月${element.date}日</td>`;
    //HTML要素を定義
    const every_hours = 
    `
    <tr>
      <td class="icon" style="background-image:url(${img_tenki})">${str_tenki}</td>
      ${hoge}
      <td>${element.temperature} </td>
      <td>${element.humidity}</td>
    </tr>
    `;
    $(tableName).append(every_hours);//テーブルに追加 
  });
}


function DiplayTenkiIcon(arg_tenki){
  let img_tenki;
  let str_tenki;
  //天気に応じた天気アイコンを表示させる
  switch (arg_tenki){
    case 'Clouds':
      img_tenki ="http://openweathermap.org/img/w/04d.png";
      str_tenki = "曇り"
      break;
    case 'Snow':
      img_tenki = "http://openweathermap.org/img/w/13d.png";
      str_tenki = "雪"
      break;
    case 'Rain':
      img_tenki ="http://openweathermap.org/img/w/09d.png";
      str_tenki = "雨"
      break;
    case 'Clear':
      img_tenki ="http://openweathermap.org/img/w/01d.png";
      str_tenki = "晴れ"
      break;
    case 'Fog':
      img_tenki ="http://openweathermap.org/img/w/50d.png";
      str_tenki = "霧"
    break;
    case 'Mist':
      img_tenki ="http://openweathermap.org/img/w/50n.png";
      str_tenki = "靄"
    break;
    case 'Haze':
      img_tenki = "http://openweathermap.org/img/w/50d.png";
      str_tenki = "霞"
    break;
    default:
      img_tenki = "http://openweathermap.org/img/w/01n.png";
  }
  return [img_tenki,str_tenki];
}
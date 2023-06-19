

function getDayOfYear(dateString) {
    const [day, month, year] = dateString.split('-');
    const date = new Date(`${month}/${day}/${year}`);
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
  
    return dayOfYear;
  }
  
  function getSecondsInDay(timeString) {
    const [hours, minutes, seconds] = timeString.split(':');
    const totalSeconds = (+hours * 3600) + (+minutes * 60) + (+seconds);
    return totalSeconds;
  }
  
  
  export const handler = async(event) => {
      let data;
      let res = await fetch('https://ex2sqntzd4.execute-api.us-east-1.amazonaws.com/69DynamoApi/esp8266');
      if (res.ok) {
        data = await res.json();
        console.log(data);
      }
      
      let distS = data.Item.payload.M.distance.N;
      let dist = parseInt(distS);
      let timeS = data.Item.payload.M.time.S;
      let dateS = data.Item.payload.M.date.S;
      let days = getDayOfYear(dateS);
      let seconds = getSecondsInDay(timeS);
      let hourS = data.Item.payload.M.hours.N;
      let hour = parseInt(hourS);
      let minuteS = data.Item.payload.M.minutes.N;
      let minute = parseInt(minuteS);
      let secondS = data.Item.payload.M.seconds.N;
      let second = parseInt(secondS);
      let dayS = data.Item.payload.M.day.N;
      let day = parseInt(dayS);
      let monthS = data.Item.payload.M.month.N;
      let month = parseInt(monthS);
      let yearS = data.Item.payload.M.year.N;
      let year = parseInt(yearS);
      
      res = {
          "binLvlS": distS+"%",
          "binLvl": dist,
          "days": days,
          "seconds": seconds,
          "timeS": timeS,
          "dateS": dateS,
          "hour": hour,
          "minute": minute,
          "second": second,
          "day": day,
          "month": month,
          "year": year,
          S:{
            "hourS": hourS,
            "minuteS": minuteS,
            "secondS": secondS,
            "dayS": dayS,
            "monthS": monthS,
            "yearS": yearS,
          },
      }
      
      return res;
  };
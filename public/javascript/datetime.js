function padZero(value) {
  return value.toString().padStart(2, "0");
}

function updateTime() {
  var str = "";
  var days = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var now = new Date();
  var hours = padZero(now.getHours());
  var minutes = padZero(now.getMinutes());
  var seconds = padZero(now.getSeconds());
  str += days[now.getDay()] + ", " + now.getDate() +" "+ months[now.getMonth()] + " " + now.getFullYear() + " " + hours +":"+ minutes +":"+ seconds;
  document.getElementById("time").innerHTML = str;
}
setInterval(updateTime, 1000);
updateTime();
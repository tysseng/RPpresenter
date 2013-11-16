// load project end time from file
function loadCounterConfig(){
  $.getJSON('/js/counterconfig.json', function(data) {

    var showSeconds = getValue(data, "showSeconds", true);
    var counterLabel = getValue(data, "counterLabel", "");

    updateCounterLabel(counterLabel);

    var counter = $(counterDivId);
    counter.stopCountDown();
    counter.setCountDown({
      targetDate: {
        'year': getValue(data, "year", 0),
        'month': getValue(data, "month", 0),
        'day': getValue(data, "day", 0),
        'hour': getValue(data, "hour", 0),
        'min': getValue(data, "min", 0),
        'sec': getValue(data, "sec", 0)
      }
    });

    if(showSeconds){
      showSecondsDiv();
    } else {
      hideSecondsDiv();
    }

    counter.startCountDown();
    positionCounter();
  });
}

function updateCounterLabel(counterLabel){
    if(counterLabel == "" ){
        $("#counterLabel").hide();
    } else {
        $("#counterLabel").text(counterLabel);
        $("#counterLabel").show();
    }
}

function hideSecondsDiv(){
    $('#secondsPlaceholder').hide();
    $('#secondsLabel').hide();
}

function showSecondsDiv(){
    $('#secondsPlaceholder').show();
    $('#secondsLabel').show();
}


function hideWeeks(counter){
    $('#weeksPlaceholder').hide();
    counter.changeConfigParam("omitWeeks", true);
}

function startCounter(){
  $(counterDivId).countDown({
    targetDate: {
      'day': 0,
      'month': 0,
      'year': 0,
      'hour': 0,
      'min': 0,
      'sec': 0
    },
    omitWeeks: true

  });
}

function positionCounter(){
  var percentageTop = 5;
  var counter = $(counterDivId);
  var width = counter.width();
  var winWidth = $(window).width();
  var winHeight = $(window).height();

  var winCenterW = winWidth/2;
  var left = winCenterW - width / 2;
  counter.css("left", left + "px");

  var top = (winHeight * percentageTop) / 100;
  counter.css("top", top + "px");

}
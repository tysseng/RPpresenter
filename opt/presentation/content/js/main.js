/*
Facts that may or may not be true (depending on wether or not the documentation
is updated)

- The counter checks if the time has changed every second. Instead of counting
  down, it calculates the difference between now and the desired end time, 
  and updates the counter accordingly. This means that time may skip a few
  seconds whenever the javascript lags, but it will always be fairly accurate.
- The counter checks the time every second even when seconds are not displayed

*/

/**
TODO: 
- Disable request logging in simple http server
*/

var status = "STARTING";
var counterDivId = "#countdown_dashboard";
var slideConfig;

function reloadPage(){
    window.location.reload(true);
}


function startPresentation(){
    $.ajaxSetup({cache: false});

    // reload page every six hours to free up memory
    setTimeout(reloadPage, 3 * 60 * 60 * 1000);

    // check status every second
    setInterval(getStatus, 1000);
    loadSlidesConfig();
    startCounter();
    loadCounterConfig();
}

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

function getStatus(){
  $.getJSON('/js/status.json', function(data) {
    updateStatus(data.status);
  });
}

function updateStatus(newStatus){
  if(statusChanged(newStatus)){
    if(status == 'LOAD_COMPLETED' && newStatus == 'NORMAL'){
      loadSlidesConfig();
      loadCounterConfig();
    }

    status = newStatus;
    if(status == 'LOADING'){
      showStatusBox("Laster nye bilder fra minnepinne");
    } else if(status == 'NO_FILES_FOUND'){
      showWarningBox("Minnepinnen inneholder ingen bilder. De gamle bildene vil fortsatt bli brukt");
    } else if(status == 'LOAD_COMPLETED'){
      showSuccessBox("Last fullf&oslash;rt","Lasting av nye bilder er fullf&oslash;rt. Det er n&aring; trygt &aring; ta ut minnepinnen. Nye bilder vises straks.");
    } else if(status == 'ERROR'){
      showErrorBox("Feil under innlasting", "Noe gikk galt under lasting av nye bilder. Det er usikkert om det er gamle eller nye bilder som vises. Pr&oslash;v &aring; ta ut minnepinnen og sett den inn igjen.");
    } else if(status == 'NORMAL'){
      hideStatusBox();
    }
  }
}

function statusChanged(newStatus){
  return newStatus != status;
}

function showStatusBox(message){
  new Messi(message, {
    autoclose: 5000
  });
}

function showSuccessBox(title, message){
  new Messi(message, {
    title: title,
    titleClass: "success",
    autoclose: 7000
  });
}

function showErrorBox(title, message){
  new Messi(message, {
    autoclose: 7000,
    title: title,
    titleClass: 'error'
  });
}

function showWarningBox(message){
  new Messi(message, {
    autoclose: 7000,
    title: "Advarsel",
    titleClass: 'warning'
  });
}

function hideStatusBox(){
  $('#statusBox').html('');
}


// load slideshow configuration from file
function loadSlidesConfig(){
  $.ajax('/js/slidesconfig.json')
    .done(function(data) {
      slideConfig = data;
      $("body").css("background-color",  getValue(slideConfig, "background", "white"));
      loadSlideFileList();
    })
    .fail(function() {
      loadSlideFileList();
    });
}

function loadSlideFileList(){
  $.getJSON('/js/slidefiles.json', function(data) {
    updateSlides(data, false);
  });
}

function updateSlides(data){
  //replace old slides div with new one
  $("#slidewrapper").empty();
  $("#slidewrapper").append('<div id="slides"></div>');


  var slidesDiv = $('#slides');
  $(data).each(function(index, element){
    slidesDiv.append('<img src="/slides/' + element + '">');
  });

  //let first image load before starting slide show.
  setTimeout(initSlides, 500);
}

function scaleAndPositionImage(image){
  //position slides
  var scale = getValue(slideConfig, "scale", "original");
    if(scale == "original"){
        positionImageCenterBottom(image);
    } else if(scale == "scaleup"){
        scaleImageToFullscreen(image);
    } else if(scale == "scaletofit"){
        scaleImageToFitBelowCounter(image);
    }
}


function positionImageCenterBottom(img){
  var width = img.width();
  var height = img.height();
  positionImage(img, height, width);

}

function scaleImageToFitBelowCounter(img){
    var label = $(".counterLabel");
    var labelHeight = label.height();
    var bottomOfLabel = label.offset().top + labelHeight;
    var windowHeight = $(window).height();
    var height;
    if(labelHeight == 0){
        height = windowHeight - bottomOfLabel - 20;
    } else {
        height = windowHeight - bottomOfLabel - 30;
    }

    var originalHeight = img.height();
    var originalWidth = img.width();
    var aspect = originalWidth / originalHeight;

    var width = aspect * height;

    img.css("height", height);
    img.css("width", width);

    positionImage(img, height, width);
}

function positionImage(img, height, width){
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var left = Math.floor((windowWidth - width) / 2);
    var top = Math.floor((windowHeight - height));
    img.css("left", left);
    img.css("top", top);
}

function scaleImageToFullscreen(img){
    img.css("top", 0);
    img.css("left", 0);
    img.css("height", "100%");
    img.css("width", "100%");
}

function getValue(config, paramName, defaultValue){
  if(config && typeof config[paramName] != 'undefined'){
    return config[paramName];
  } else {
    return defaultValue;
  }
}

var currentIndex;
var carouselImages;
var carouselDelay;
var carouselRunning = false;

function initSlides(){

    //load new images
    var images = $("#slides").find("img");
    images.each(function(index, img){
        $(img).hide();
    });
    carouselImages = images;
    currentIndex = images.length-1;

    //reset delay times
    carouselDelay = getValue(slideConfig, "interval", 2000);

    //start carousel if necessary
    if(!carouselRunning){
        carouselRunning = true;
        advanceCarousel();
    }
}


function advanceCarousel(){
    var nextIndex = (currentIndex +1) % carouselImages.size();
    var currentImage = carouselImages.get(currentIndex);
    var nextImage = carouselImages.get(nextIndex);

    //Image is scaled and positioned here, as scaling it load time may not work
    //because we try to calculate the scale before the image has been loaded.
    scaleAndPositionImage($(nextImage));

    $(nextImage).show();
    if(currentImage){
        $(currentImage).hide();
    }

    currentIndex = nextIndex;

    setTimeout(advanceCarousel, carouselDelay);
}


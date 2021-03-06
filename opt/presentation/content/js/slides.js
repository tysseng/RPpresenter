/**
 * Module that controls the lifecycle of a slideshow. Loads images and config, and displays a slide show.
 */
function Slides(options){

  var configUrl = options.configUrl;
  var fileListUrl = options.fileListUrl;
  var slideWrapperDiv = options.slideWrapperDiv;
  var imageDir = options.imageDir;
  var offsetElement = options.offsetElement;

  var slideConfig;
  var currentIndex;
  var carouselImages;
  var carouselDelay;
  var carouselRunning = false;

  // load slideshow configuration from file and start slideshow
  this.start = function(){
    $.ajax(configUrl)
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
    $.getJSON(fileListUrl, function(data) {
      updateSlides(data, false);
    });
  }

  function updateSlides(data){
    //replace old slides div with new one
    slideWrapperDiv.empty();
    slideWrapperDiv.append('<div id="slides"></div>');


    var slidesDiv = $('#slides');
    $(data).each(function(index, element){
      slidesDiv.append('<img src="' + imageDir + '/' + element + '">');
    });

    //let first image load before starting slide show.
    setTimeout(startCarousel, 500);
  }

  function scaleAndPositionImage(image){
    //position slides
    var scale = getValue(slideConfig, "scale", "original");
      if(scale == "original"){
          positionImageCenterBottom(image);
      } else if(scale == "scaleup"){
          scaleImageToFullscreen(image);
      } else if(scale == "scaletofit"){
          scaleImageToFitBelowElement(image, offsetElement);
      }
  }


  function positionImageCenterBottom(img){
    var width = img.width();
    var height = img.height();
    positionImage(img, height, width);

  }

  function scaleImageToFitBelowElement(img, offsetElement){
      var elementHeight = offsetElement.height();
      var bottomOfElement = offsetElement.offset().top + elementHeight;
      var windowHeight = $(window).height();
      var height;
      if(elementHeight == 0){
          height = windowHeight - bottomOfElement - 20;
      } else {
          height = windowHeight - bottomOfElement - 30;
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

  function startCarousel(){

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

  /**
   * Get config value, returns defaultValue if parameter is not found
   *
   * @param config Config array
   * @param paramName Parameter to get
   * @param defaultValue Default parameter value
   */
  function getValue(config, paramName, defaultValue){
    if(config && typeof config[paramName] != 'undefined'){
      return config[paramName];
    } else {
      return defaultValue;
    }
  }
}
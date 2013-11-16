function fetchStatus(){
  $.getJSON('/js/status.json', function(data) {
    var updateCallback = function reloadPresenter(){
      loadSlidesConfig();
      loadCounterConfig();
    };

    updateStatus(data.status, updateCallback);
  });
}



function updateStatus(newStatus, updateCallback){
  if(statusChanged(newStatus)){
    if(status == 'LOAD_COMPLETED' && newStatus == 'NORMAL'){
        updateCallback();
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
/*
Facts that may or may not be true (depending on wether or not the documentation
is updated)

- The counter checks if the time has changed every second. Instead of counting
  down, it calculates the difference between now and the desired end time, 
  and updates the counter accordingly. This means that time may skip a few
  seconds whenever the javascript lags, but it will always be fairly accurate.
- The counter checks the time every second even when seconds are not displayed

*/


var counterDivId = "#countdown_dashboard";
var slideConfig;

function reloadPage(){
    window.location.reload(true);
}

function startPresentation(){
    $.ajaxSetup({cache: false});

    // reload page every six hours to free up memory
    setTimeout(reloadPage, 3 * 60 * 60 * 1000);

    var reloadPresenter = function (){
      console.log("Reloading presenter")
      loadSlidesConfig();
      loadCounterConfig();
    };

    var statusHandler = new Status({
      success: reloadPresenter
    });

    // check status every second
    setInterval(statusHandler.fetchStatus, 1000);
    loadSlidesConfig();
    startCounter();
    loadCounterConfig();
}







/*!
 * jQuery Countdown plugin v1.0
 * http://www.littlewebthings.com/projects/countdown/
 *
 * Copyright 2010, Vassilis Dourdounis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function($){

    $.fn.updateInProgress = false;

	$.fn.countDown = function (options) {

		config = {};

		$.extend(config, options);

		diffSecs = this.setCountDown(config);
	
		if (config.onComplete)
		{
			$.data($(this)[0], 'callback', config.onComplete);
		}
        if (config.omitWeeks)
        {
            $.data($(this)[0], 'omitWeeks', config.omitWeeks);
        }

		$('#' + $(this).attr('id') + ' .digit').html('<div class="top"></div><div class="bottom"></div>');
		$(this).doCountDown($(this).attr('id'), diffSecs, 500);

		return this;

	};

	$.fn.stopCountDown = function () {
		clearTimeout($.data(this[0], 'timer'));
	};

	$.fn.startCountDown = function () {
		this.doCountDown($(this).attr('id'),$.data(this[0], 'diffSecs'), 500);
	};

	$.fn.setCountDown = function (options) {
		var targetTime = new Date();

		if (options.targetDate)
		{
			targetTime = new Date(options.targetDate.month + '/' + options.targetDate.day + '/' + options.targetDate.year + ' ' + options.targetDate.hour + ':' + options.targetDate.min + ':' + options.targetDate.sec + (options.targetDate.utc ? ' UTC' : ''));
		}
		else if (options.targetOffset)
		{
			targetTime.setFullYear(options.targetOffset.year + targetTime.getFullYear());
			targetTime.setMonth(options.targetOffset.month + targetTime.getMonth());
			targetTime.setDate(options.targetOffset.day + targetTime.getDate());
			targetTime.setHours(options.targetOffset.hour + targetTime.getHours());
			targetTime.setMinutes(options.targetOffset.min + targetTime.getMinutes());
			targetTime.setSeconds(options.targetOffset.sec + targetTime.getSeconds());
		}

		var nowTime = new Date();

		diffSecs = Math.floor((targetTime.valueOf()-nowTime.valueOf())/1000);

		//MODIFICATION: Storing target time as we now check the difference every time the counter is updated.
        $.data(this[0], 'targetTime', targetTime.valueOf());

		$.data(this[0], 'diffSecs', diffSecs);

		return diffSecs;
	};

	$.fn.doCountDown = function (id, diffSecs, duration) {

		$this = $('#' + id);
		
		// MODIFIED BEHAVIOUR
        // Now checks end time every time the clock is updated, to account for delays
        // due to the slow Raspberry Pi processor
        var targetTime = $.data($this[0], 'targetTime');
		diffSecs = Math.floor((targetTime.valueOf()-new Date().valueOf())/1000);


        //if we have reached the desired time, e.g. time = 0, stop timer.
		if (diffSecs <= 0)
		{
			diffSecs = 0;
			if ($.data($this[0], 'timer'))
			{
				clearTimeout($.data($this[0], 'timer'));
			}
		}

		secs = diffSecs % 60;
		mins = Math.floor(diffSecs/60)%60;
		hours = Math.floor(diffSecs/60/60)%24;

        var omitWeeks = $.data($this[0], 'omitWeeks');
		if (omitWeeks)
		{
			days = Math.floor(diffSecs/60/60/24);
			weeks = Math.floor(diffSecs/60/60/24/7);
		}
		else 
		{
			days = Math.floor(diffSecs/60/60/24)%7;
			weeks = Math.floor(diffSecs/60/60/24/7);
		}

        //only draw updates when a digit changes
        if(secs != $.data($this[0], 'prevSeconds')){
            $this.dashChangeTo(id, 'seconds_dash', secs, duration ? duration : 800);
            $.data($this[0], 'prevSeconds', secs);
        }
        if(mins != $.data($this[0], 'prevMinutes')){
    		$this.dashChangeTo(id, 'minutes_dash', mins, duration ? duration : 1200);
            $.data($this[0], 'prevMinutes', mins);
        }
        if(hours != $.data($this[0], 'prevHours')){
    		$this.dashChangeTo(id, 'hours_dash', hours, duration ? duration : 1200);
            $.data($this[0], 'prevHours', hours);
        }
        if(days != $.data($this[0], 'prevDays')){
		    $this.dashChangeTo(id, 'days_dash', days, duration ? duration : 1200);
            $.data($this[0], 'prevDays', days);
        }
        if(weeks != $.data($this[0], 'prevWeeks')){
	    	$this.dashChangeTo(id, 'weeks_dash', weeks, duration ? duration : 1200);
            $.data($this[0], 'prevWeeks', weeks);
        }

		$.data($this[0], 'diffSecs', diffSecs);
		if (diffSecs > 0)
		{
            // check for update every 200 ms.
			e = $this;
			t = setTimeout(function() { e.doCountDown(id, diffSecs-1) } , 200);
			$.data(e[0], 'timer', t);
		} 
		else if (cb = $.data($this[0], 'callback')) 
		{
			$.data($this[0], 'callback')();
		}

	};

	$.fn.dashChangeTo = function(id, dash, n, duration) {
		  $this = $('#' + id);
		 
		  for (var i=($this.find('.' + dash + ' .digit').length-1); i>=0; i--)
		  {
				var d = n%10;
				n = (n - d) / 10;
				$this.digitChangeTo('#' + $this.attr('id') + ' .' + dash + ' .digit:eq('+i+')', d, duration);
		  }
	};

	$.fn.digitChangeTo = function (digit, n, duration) {
        var divTop = $(digit + ' div.top');
        divTop.html((n ? n : '0'));
        /*
		if (!duration)
		{
			duration = 800;
		}

        var divTop = $(digit + ' div.top');
        var divBottom = $(digit + ' div.bottom');

		if (divTop.html() != n + '')
		{

			divTop.css({'display': 'none'});
			divTop.html((n ? n : '0')).slideDown(duration);

			divBottom.animate({'height': ''}, duration, function() {
				divBottom.html(divTop.html());
				divBottom.css({'display': 'block', 'height': ''});
				divTop.hide().slideUp(10);

			
			});
		} */
	};

})(jQuery);



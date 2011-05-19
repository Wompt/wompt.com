UI.once('init', function(){
	var UI = this
	,   user = {}
	,   delay = 1500
	,   missed_messages = 0
	,   standard_title = document.title
	,   last_sound_time = 0;
	
	UI.notifications = {};
	
	var titleAlternator = {
		start: function(){
			if(this.timer) return;
			this.show_standard = false
			this.timer = setInterval(this.alternate.bind(this), delay);
			this.alternate();
		},
		
		stop: function(){
			clearInterval(this.timer);
			this.timer = null;
			/* Changing the title within the onFocus event doesn't seem to have any effect */
			setTimeout(this.alternate.bind(this), 100);
		},
		
		alternate: function(){
			document.title = !this.timer || this.show_standard ? standard_title : (missed_messages + " Unread Messages");
			this.show_standard = !this.show_standard;
		}
	}
	
	UI.on('user_message', function(data){
		missed_messages += $.isArray(data) ? data.length : 1;
		if(user.away)	titleAlternator.start();
	});	
	
	function onBlur(){
		user.away = true;
		missed_messages = 0;
	}
	
	function onFocus(){
		user.away = false;
		missed_messages = 0;
		titleAlternator.stop();
	}
	
	if($.browser.msie){
		document.onfocusin = onFocus;
		document.onfocusout = onBlur;
	}else{
		window.onfocus = onFocus;
		window.onblur = onBlur;
	}
	
	
	if(window.Audio){
		var sound;
		function ding(){
			if(!sound) sound = new Audio("/s/sounds/missed-message.wav");
			sound.play();
		}
		
		UI.on('user_message', function(data){
			if(shouldNotify(data)){
				var now = Util.ts()
				if(now - last_sound_time >= 60000){
					last_sound_time = now;
					ding();
					/* This seems to fix the issues we were having with Chrome */
					setTimeout(function(){sound.pause(); sound.currentTime =0;}, 2000)
				}
			}
		});
	}
	
	function shouldNotify(data){
		return user.away &&
			!mode.is('mute') &&
			(mode.is('all') || mode.is('mentions') && Util.Text.mentionMatcher(data.msg))
	}
	
	var mode = UI.notifications.mode = (function(){
		var modes = [
			['all','notify me on all messages'],
			['mentions', 'notify me when my name is @mentioned'],
			['mute', 'mute']],
		classes ="all mentions mute",
		button = $('#ding');
		
		var pub = {
			current:0,
			
			cycle: function(){
				pub.set((pub.current + 1) % modes.length);
			},
			
			set: function(i){
				var mode = modes[i];
				button.removeClass(classes);
				button.addClass(mode[0]);
				button.attr('title', mode[1]);
				pub.current = i;
			},
			
			is: function(m){
				return modes[pub.current][0] == m;
			}
		}
		button.click(function(e){
			pub.cycle();
			e.preventDefault();
		});		
		return pub;
	})();
});


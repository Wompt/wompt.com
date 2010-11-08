$(document).ready(function(){
	$('#message').keydown(function(e){
		if(e.keyCode == 13)
			send_message($(this).val());
	});
	
	var comet = new Comet('/chat/room1/recv', function(data){
		var line = $('<div>')
		line.append(data.msg);
		$('#messages').append(line);	
	});
	
	comet.start();
});

function send_message(msg){
	$.get('/chat/room1/post',{msg: msg});
}

function Comet(url, handler){
	this.go = false;
	
	this.start = function(){
		this.go = true;
		this.send_request();
	}
	
	this.send_request = function(){
		if(this.go == false) return;
		var me = this;
		$.ajax({
			cache:false,
			type: 'GET',
			url: url,
			data: {id:me.id},
			dataType: 'json',
			success: function(data, status, xhr){
				if(data.id && !me.id) me.id = data.id;
				handler.call(me, data);
			},
			complete: function(xhr, status){
				me.send_request();
			}
		});
	}
	
	this.stop = function(){
		this.go = false;
	}
}


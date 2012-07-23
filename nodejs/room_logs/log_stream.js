var fs = require('fs'),
util = require('util'),
events = require('events');

function logStream(filename, options){
	options = {
		linesPerChunk: 100,
		charsPerLine: 100
	}
	
	var self = this,
	msgsBuffer = [],
	msgsBufferLineCount = 0,
	stream = this.stream = fs.createReadStream(filename, {encoding: 'utf8'})
	partial_line = '';
	
	stream.on('data', function(str, err){
		if(!err){
			//Each data chunk is like this partial_line \n line \n line \n partial_line
			lines = str.split("\n");
			// prefix the previous partial line to the first line in this set
			lines[0] = partial_line + lines[0];
			// remove the last partial line
			partial_line = lines.pop();
			
			lines.forEach(onLine);
		}
	});
	
	stream.on('end', function(){
		onLine(partial_line);
		if(msgsBuffer.length > 0)
			self.emit('data', msgsBuffer);
		self.emit('end');
	});
	
	function onLine(line){
		if(line.substr(0,1) == '/') return;
		
		var p = line.indexOf(':');		
		line = line.substr(p+1);
		if(p > 0) onMessage(JSON.parse(line));
	}
	
	function onMessage(msg){
		if(msg.action != 'message') return;
		msg.msg = '' + msg.msg;
		
		var line_count = Math.ceil(msg.msg.length / options.charsPerLine);
		
		if((msgsBufferLineCount + line_count) > options.linesPerChunk){
			self.emit('data', msgsBuffer);
			msgsBuffer = [];
			msgsBufferLineCount = 0;
		}
		
		msgsBuffer.push(msg);
		msgsBufferLineCount += line_count
	}
}

util.inherits(logStream, events.EventEmitter);

exports.logStream = logStream;

var logStream = require('./log_stream').logStream,
dependencies = require("wompt_dependencies");

function LogProcessor(options){
	this.options = options;
}

LogProcessor.prototype = {
	file: function(filename){
		var log = new logStream('./test.log'),
		self = this;
		
		log.on('data', function(data){
			dependencies.jade.renderFile(
				self.options.template, {
					self:true,
					cache:true,
					locals:{msgs:data},
					filename: self.options.template
				},
				function(err, html){
					// do something with html
				});
		});
		
		log.on('end',function(){
			console.dir(last.pop());
		})
	}
}

exports.logProcessor = LogProcessor;

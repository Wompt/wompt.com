var logger = exports;

logger.on = true;

logger.log = function(str){
  if(logger.on) console.log(str);
}

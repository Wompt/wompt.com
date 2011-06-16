var Cron = require("../lib/cron.js");

function fmt(t){
	return pad(t.getUTCSeconds(), 2) + ":" + pad(t.getUTCMilliseconds(), 3);
}

var assert = require('assert');

var eq = assert.equal, m = Cron.math;
eq(m.round(8, 10), 10);
eq(m.round(3, 10), 0);
eq(m.round(50, 100), 100);
eq(m.round(49, 100), 0);

eq(m.floor(49, 100), 0);
eq(m.floor(99, 100), 0);
eq(m.floor(6, 7), 0);

eq(m.ceil(49, 100), 100);
eq(m.ceil(99, 100), 100);
eq(m.ceil(6, 7), 7);

function utc(){
	return new Date(Date.UTC.apply(this, arguments));
}

var c = Cron.time;

var d                    = utc(2000, 0, 1, 0, 30, 0, 0).getTime();
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 29, 29, 0)).getTime(), d);  // 0:29:29 -> 0:30:00
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 28, 30, 0)).getTime(), d);  // 0:28:30 -> 0:30:00 
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 29, 00, 0)).getTime(), d);  // 0:29:00 -> 0:30:00 

var d                    = utc(2000, 0, 1, 0, 30, 0, 0).getTime();
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 29, 59, 0), 'floor').getTime(), d);  // 0:29:59 -> 0:30:00
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 29, 30, 0), 'floor').getTime(), d);  // 0:29:30 -> 0:30:00 
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 29, 00, 0), 'floor').getTime(), d);  // 0:29:00 -> 0:30:00 

var d                    = utc(2000, 0, 1, 0, 30, 0, 0).getTime();
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 28, 01, 0), 'ceil').getTime(), d);  // 0:28:01 -> 0:30:00
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 28, 59, 0), 'ceil').getTime(), d);  // 0:28:59 -> 0:30:00 
eq(c.roundToNext('minute', utc(2000, 0, 1, 0, 29, 00, 0), 'ceil').getTime(), d);  // 0:29:00 -> 0:30:00 

var d                    = utc(2000, 0, 1, 0, 30,  0,   0).getTime();
eq(c.roundToNext('second', utc(2000, 0, 1, 0, 29, 59,   0)).getTime(), d);  // 0:29:59 -> 0:30:00
eq(c.roundToNext('second', utc(2000, 0, 1, 0, 29, 59, 499)).getTime(), d);  // 0:29:30 -> 0:30:00 
eq(c.roundToNext('second', utc(2000, 0, 1, 0, 29, 58, 500)).getTime(), d);  // 0:29:00 -> 0:30:00 

var d                  = utc(2000, 0, 1, 2, 0,  0,    0).getTime();
eq(c.roundToNext('hour', utc(2000, 0, 1, 1, 29, 59, 499)).getTime(), d);  // 0:29:59 -> 0:30:00
eq(c.roundToNext('hour', utc(2000, 0, 1, 0, 30,  0,   0)).getTime(), d);  // 0:29:30 -> 0:30:00 
eq(c.roundToNext('hour', utc(2000, 0, 1, 1,  0,  0,   0)).getTime(), d);  // 0:29:00 -> 0:30:00 

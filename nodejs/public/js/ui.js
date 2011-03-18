
// UI is a singleton with events
function UI(){};
UI.prototype = new EventEmitter();
UI = new UI();


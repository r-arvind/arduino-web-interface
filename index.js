var server = require("./server");
var router = require("./route");
var requestHandlers = require("./requestHandlers");

var debug = false;

var handle = requestHandlers.sendInterface;
server.start(handle,debug);
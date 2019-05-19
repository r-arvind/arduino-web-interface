var fs = require('fs')
,http = require('http'),
socketio = require('socket.io'),
url = require("url"), 
SerialPort = require("serialport")
// console.log(getPortList());

var socketServer;
var serialPort;
var portName = '/dev/ttyACM0'; //change this to your Arduino port
var sendData = "";
// handle contains locations to browse to (vote and poll); pathnames.
function startServer(handle,debug)
{
	function onRequest(request, response) {
	  return handle(response,request);
	}
	
	var httpServer = http.createServer(onRequest).listen(1337, function(){
		console.log("Listening at: http://localhost:1337");
		console.log("Server is up");
	}); 

	initSocketIO(httpServer,debug);
	serialListener(debug)
}

function initSocketIO(httpServer,debug)
{
	socketServer = socketio.listen(httpServer);
	// if(debug == false){
		// socketServer.set('log level', 1); // socket IO debug off
	// }
	socketServer.on('connection', function (socket) {
		// console.log("user connected");
		socket.emit('onconnection', {pollOneValue:sendData});
		socketServer.on('update', function(data) {
			socket.emit('updateData',{pollOneValue:data});
		});
		socket.on('buttonval', function(data) {
			serialPort.write(data.toString());
		});
		socket.on('sliderval', function(data) {
			serialPort.write(data);
		});
		
    });
}

function getPortList(){
	var availablePorts = [];
	SerialPort.list(function(err,ports){
		// console.log(ports);
	})

	// console.log(availablePorts);
	// return availablePorts;
}

// Listen to serial port
function serialListener(debug)
{
	var receivedData = "";
	
    serialPort = new SerialPort(portName, {
        baudRate: 9600,
        // defaults for Arduino serial communication
         dataBits: 8,
         parity: 'none',
         stopBits: 1,
         flowControl: false
    });
 
    serialPort.on("open", function () {
      console.log('open serial communication');
            // Listens to incoming data
        serialPort.on('data', function(data) {
             receivedData += data.toString();
        //   if (receivedData .indexOf('E') >= 0 && receivedData .indexOf('B') >= 0) {
        //    sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
        //    receivedData = '';
        //  }
		 // send the incoming data to browser with websockets.
		// console.log(` data is ${receivedData}`)
       socketServer.emit('update', receivedData);
      });  
    });  
}

exports.start = startServer;
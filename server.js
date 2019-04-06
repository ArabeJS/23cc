var net = require('net');
var fs = require('fs');
var jsome = require('jsome');
var cor = require('./libs/api');
var EMsg = require('./libs/dev/emsg');

var srvIP = 'game-server1.dz-war.ga';
var srvPORT = 9335;

var gameServer = new net.Socket();





var msgData = require('./packet/client/10100-ClientHello.json');


gameServer.connect(srvPORT, srvIP, function() {
    console.log('Connected to game server on IP/PORT:' + gameServer.remoteAddress + ':' + gameServer.remotePort);
    var enc = cor.clientEncrypt(msgData);
    gameServer.write(enc);
});


gameServer.on("data", function(chunk) {
	cor.clientDecrypt(chunk,function(data) {
		var message = data.d;
		console.log("=======================================");
		console.log("===========|Message Decoded|===========");
		console.log("=======================================");
		jsome(message);
		console.log("=======================================");
		var fileName = message.messageType+'-'+EMsg[message.messageType];
		saveJson(message,fileName,'server');
	});
});


gameServer.on("end", function() {
    console.log('Disconnected from game server');
});


function saveJson(message,fileName,dir) {
    var json = JSON.stringify(message, undefined, 4);
    var pathSave = '../packet/'+dir+'/'+fileName+'.json';
    fs.writeFile(pathSave, json, 'utf8', function (err) {
        if (err) throw err;
        console.log('json file create success in: ',);
        console.log(pathSave);
        console.log("=======================================");
        console.log("==============|END Message|============");
        console.log("=======================================");
    });
}


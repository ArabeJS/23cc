var net = require('net');
var fs = require('fs');
var jsome = require('jsome');
var cor = require('./libs/api');
var EMsg = require('./libs/dev/emsg');




var msgData = require('./packet/server/20100-ServerHello.json');
var msgData2 = require('./packet/server/2.json');


var server = net.createServer();
var clients = {};
server.on('error', function(err) {
    if (err.code == 'EADDRINUSE') {
        console.log('Address in use, exiting...');
    } else {
        console.log('Unknown error setting up proxy: ' + err);
    }
});

server.on('listening', function() {
    console.log('listening on ' + server.address().address + ':' + server.address().port);
});

server.on('connection', function(socket) {
    socket.key = socket.remoteAddress + ":" + socket.remotePort;
    clients[socket.key] = socket;

    console.log('new client ' + socket.key + ' connected.');//, establishing connection to game server

    clients[socket.key].on('data', function(chunk) {
        cor.serverDecrypt(chunk,function(data) {
            var message = data.d;
            console.log("=======================================");
            console.log("===========|Message Decoded|===========");
            console.log("=======================================");
            jsome(message);
            console.log("=======================================");
            var fileName = message.messageType+'-'+EMsg[message.messageType];
            if (message.messageType ==  10100) {
                var res = cor.serverEncrypt(msgData);
                clients[socket.key].write(new Buffer.from(msgData2));
                
                console.log('res ok: *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
                saveJson(message,fileName,'client');
            }

            

        });
            
    });

    clients[socket.key].on('end', function() {
            console.log('Client ' + socket.key + ' disconnected from proxy.');
            delete clients[socket.key];
            
    });
});

function saveJson(message,fileName,dir) {
    var json = JSON.stringify(message, undefined, 4);
    var pathSave = './packet/'+dir+'/'+fileName+'.json';
    fs.writeFile(pathSave, json, 'utf8', function (err) {
        if (err) throw err;
        console.log('json file create Success in: ');
        console.log(pathSave);
        console.log("=======================================");
        console.log("==============|END Message|============");
        console.log("=======================================");
    });
}

server.listen({ host: '0.0.0.0', port: 9339, exclusive: true }, function(err) {
    if (err) {
        console.log(err);
    }
});











var srvIP = 'game-server1.dz-war.ga';
var srvPORT = 9335;

var gameServer = new net.Socket();





var msgData = require('./packet/client/10100-ClientHello.json');


gameServer.connect(srvPORT, srvIP, function() {
    console.log('Connected to game server on IP/PORT:' + gameServer.remoteAddress + ':' + gameServer.remotePort);
    gameServer.write('hi');
});


gameServer.on("data", function(chunk) {
	
});


gameServer.on("end", function() {
    console.log('Disconnected from game server');
});

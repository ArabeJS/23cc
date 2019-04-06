var PacketReceiver = require('./dev/packetreceiver');
var ClientCrypto = require('./dev/client_crypto');
var ServerCrypto = require('./dev/server_crypto');
var Definitions = require('./dev/definitions');

var settings = require('../settings.json');

var definitions = new Definitions();

var clientPacketReceiver = new PacketReceiver();
var serverPacketReceiver = new PacketReceiver();

var clientCrypto = new ClientCrypto(settings);
var serverCrypto = new ServerCrypto(settings);

clientCrypto.setServer(serverCrypto);
serverCrypto.setClient(clientCrypto);

function cEncrypt(message) {
	clientCrypto.encryptPacket(message);

	let header = Buffer.alloc(7);

	header.writeUInt16BE(message.messageType, 0);
	header.writeUIntBE(message.encrypted.length, 2, 3);
	header.writeUInt16BE(message.version, 5);

	return Buffer.concat([header, Buffer.from(message.encrypted)]);
}

function cDecrypt(chunk,cb) {
	serverPacketReceiver.packetize(chunk, function(packet) {
		var message = {
            'messageType': packet.readUInt16BE(0),
            'length': packet.readUIntBE(2, 3),
            'version': packet.readUInt16BE(5),
            'payload': packet.slice(7, packet.length)
        };

        clientCrypto.decryptPacket(message);
        definitions.decode(message);

        if (message.decoded) {
        	cb({i: true,d:message});
        }else{
        	cb({i: false,d:'[message.decode] : .decode is null'});
        }
	});
}

function cDecryptLite(message,cb) {
    serverCrypto.decryptPacket(message);
        definitions.decode(message);

        if (message.decoded) {
            cb({i: true,d:message});
        }else{
            cb({i: false,d:'[message.decode] : .decode is null'});
        }
}

function sEncrypt(message) {
	serverCrypto.encryptPacket(message);

	let header = Buffer.alloc(7);

	header.writeUInt16BE(message.messageType, 0);
	header.writeUIntBE(message.encrypted.length, 2, 3);
	header.writeUInt16BE(message.version, 5);

	return Buffer.concat([header, Buffer.from(message.encrypted)]);
}

function sDecrypt(chunk,cb) {
	clientPacketReceiver.packetize(chunk, function(packet) {
		var message = {
            'messageType': packet.readUInt16BE(0),
            'length': packet.readUIntBE(2, 3),
            'version': packet.readUInt16BE(5),
            'payload': packet.slice(7, packet.length)
        };

        serverCrypto.decryptPacket(message);
        definitions.decode(message);

        if (message.decoded) {
        	cb({i: true,d:message});
        }else{
        	cb({i: false,d:'[message.decode] : .decode is null'});
        }
	});
}

module.exports = {
	clientEncrypt: cEncrypt,
    clientDecrypt: cDecrypt,
	clientDecryptLite: cDecryptLite,
	serverEncrypt: sEncrypt,
	serverDecrypt: sDecrypt
};
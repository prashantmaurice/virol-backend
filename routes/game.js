var fn = require('../lib/common-utils/functions');

var GameServer = function (app, io) {
    app.get('/cards/all', function (req, res) {
        res.end("working");

    });
    io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });
};

module.exports = function (app, io) {
    return new GameServer(app, io);
};
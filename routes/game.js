var fn = require('../lib/common-utils/functions');

var userIdGenerator = 0;
var users = [];
function userObject(socket){
    this.socket = socket;
    this.userId = userIdGenerator++;
}

var GameServer = function (app, io) {
    app.get('/', function (req, res) {
        res.end("working");

    });
    io.on('connection', function(socket){
        console.log('a user connected');
        var user = new userObject(socket);
        users.push(user);

        socket.on('all users', function(){
            console.log('User requested to connect');
            var usernames = [];
            for(var i =0;i<users.length;i++){
                usernames.push(users[i].userId);
            }
            socket.emit('all users', usernames);
        });

        socket.on('connectUser', function(){
            console.log('User requested to connect');
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
            for(var i =0;i<users.length;i++){
                if(users[i].socket==socket)
                    users.splice(i,1);
            }
        });
    });
};

module.exports = function (app, io) {
    return new GameServer(app, io);
};
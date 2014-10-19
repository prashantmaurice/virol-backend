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
        socket.emit('new connection',{ id : user.userId});
        this.opponent = null;
//        this.id = uesr.id;


        socket.on('all users', function(){
            console.log('User requested to connect');
            var usernames = [];
            for(var i =0;i<users.length;i++){
                usernames.push(users[i].userId);
            }
            io.emit('all users', usernames);
        });

        socket.on('connectUser', function(){
            console.log('User requested to connect');
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
            for(var i =0;i<users.length;i++){
                if(users[i].socket==socket){
                    users.splice(i,1); console.log("removed user Found");
                }

            }
            var usernames = [];
            for(var i =0;i<users.length;i++){
                usernames.push(users[i].userId);
            }
            io.emit('all users', usernames);
        });

        //USER CONNECTING TO ANOTHER USER
        socket.on('user connect request', function(msg){
            console.log('User '+ msg.userId1 +' requested to connect to '+ msg.userId2);
            //send receiver call
            for(var i =0;i<users.length;i++){
                if(users[i].userId==msg.userId2){
                    console.log("sent request to receiver");
                    users[i].socket.emit('user request', {userId1 :msg.userId1 });
                }

            }
        });
        socket.on('user request reply', function(msg){
            console.log('User replied '+ msg.ok +'for  request to connect from '+ msg.userId1);
            //send caller call
            for(var i =0;i<users.length;i++){
                if(users[i].userId==msg.userId1){
                    console.log("sent reply to sender");
                    users[i].socket.emit('user request reply', msg);

                }

            }
        });
    });
};
module.exports = function (app, io) {
    return new GameServer(app, io);
};
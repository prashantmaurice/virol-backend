var fn = require('../lib/common-utils/functions');

var userIdGenerator = 0;
var users = {};
function userObject(socket){
    this.socket = socket;
    this.userId = userIdGenerator++;
    this.opponent = null;
}

var GameServer = function (app, io) {
    app.get('/', function (req, res) {
        res.end("working");

    });
    io.on('connection', function(socket){
        console.log('a user connected');
        var user = new userObject(socket);
        users[user.userId]=user;
        this.mainId = user.userId;
        socket.emit('new connection',{ id : user.userId});
        socket.userId = user.userId;
        this.opponent = null;



        socket.on('all users', function(){
            console.log('User requested to connect');
//            var usernames = [];
//            for(var i =0;i<users.length;i++){
//                usernames.push(users[i].userId);

//            }
            var reply = [];
            for (var key in users) {
                reply.push(users[key].userId)
            }
            io.emit('all users', reply);
        });

        socket.on('connectUser', function(){
            console.log('User requested to connect');
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
//            for(var i =0;i<users.length;i++){
//                if(users[i].socket==socket){
//                    users.splice(i,1); console.log("removed user Found");
//                }
//
//            }
//            var usernames = [];
//            for(var i =0;i<users.length;i++){
//                usernames.push(users[i].userId);
//            }
            delete users[socket.userId];
            io.emit('all users', null);
        });

        //USER CONNECTING TO ANOTHER USER
        socket.on('user connect request', function(msg){
            console.log('User '+ msg.userId1 +' requested to connect to '+ msg.userId2);
            //send receiver call
            for (var key in users) {
                if(users[key].userId==msg.userId2){
                    console.log("sent request to receiver");
                    users[key].socket.emit('user request', {userId1 :msg.userId1 });
                }
            }
        });
        socket.on('user request reply', function(msg){
            console.log('User replied '+ msg.ok +'for  request to connect from '+ msg.userId1);
            if(msg.ok){//if confirmed add meta data
                //send caller call
                for (var key in users) {
                    if(users[key].userId==msg.userId1){
                        socket.opponent  =users[key].socket;
                        users[key].socket.opponent = socket;
                        //send caller call
                        users[key].socket.emit('user request reply', msg);

                    }
                }
            }
            else{

            }

        });

        //USER DISCONNECTING TO ANOTHER USER
        socket.on('user disconnect', function(msg){
            users[msg.user1].opponent = null;
            users[msg.user2].opponent = null;
            users[msg.user1].socket.emit('user disconnect',null);
            users[msg.user2].socket.emit('user disconnect',null);
        });

        //CONNECTED USER COMMANDS
        socket.on('command', function(msg){
//            if(users[msg.user1].opponent == null) return;
//            if(users[msg.user2].opponent == null) return;
            console.log("CMD:"+JSON.stringify(msg));
            if(users[msg.user1]!=null)
                users[msg.user1].socket.emit('command',msg);
            if(users[msg.user2]!=null)
                users[msg.user2].socket.emit('command',msg);
        });

    });
};
module.exports = function (app, io) {
    return new GameServer(app, io);
};
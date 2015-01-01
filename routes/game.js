var fn = require('../lib/common-utils/functions');

var userIdGenerator = 0;
var users = {};
var freeUser = null;
function userObject(socket){
    this.socket = socket;
    this.userId = userIdGenerator++;
    this.opponent = null;
    this.username = "";
}
function getUsersOnline(){
    var reply = [];
    for (var key in users) {
        reply.push(users[key].userId)
    }
    return reply;
}
function printUsers(){
    var reply = [];
    for (var key in users) {
        var user = users[key];
        reply.push({key:key, userId:user.userId,opponent:user.opponent,socket:((user.socket==null)?0:1)})
    }
    return JSON.stringify(reply);
}
var GameServer = function (app, io) {
    app.get('/', function (req, res) {
        res.end("working");

    });
    io.on('connection', function(socket){
        var user = new userObject(socket);
        console.log('a new user connected:'+user.userId);
        users[user.userId]=user;
        socket.emit('new connection',{ id : user.userId});
        socket.userId = user.userId;
        socket.opponent = null;


        //SERVER RELATED CALLS
        socket.on('all users', function(){
            console.log('User: all users');
            io.emit('all users', getUsersOnline());
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

            if(users[socket.userId].opponent!=null)
                if (users[users[socket.userId].opponent]!=null)
                    users[users[socket.userId].opponent].socket.emit("opponent disconnected",{id:socket.userId});
            delete users[socket.userId];
            if(freeUser == socket.userId) freeUser=null;
            io.emit('all users', getUsersOnline());
        });

        //USER CONNECTING TO ANOTHER USER
        socket.on('connectUser', function(msg){
            console.log('User '+ msg.userId1 +' requested to connect to '+ msg.userId2);

            //ask opponent
            console.log("sent connection request to receiver");
            console.log("SERVERUSERS="+printUsers());
            users[msg.userId2].socket.emit('user connect request', {userId1 :msg.userId1 , userId2 : msg.userId2});

        });
        socket.on('user request reply', function(msg){
            console.log('User replied '+ msg.ok +'for  request to connect from '+ msg.userId1);
            if(msg.ok){

                //adding connections
                users[msg.userId2].opponent  =users[msg.userId1].userId;
                users[msg.userId1].opponent  =users[msg.userId2].userId;

                //send caller call
                users[msg.userId1].socket.emit('user request reply', msg);
            }
            else{
                console.log("opponent user is busy"+msg.userId2);
            }
        });

        //USER DISCONNECTING TO ANOTHER USER
        socket.on('user disconnect', function(msg){
            var opponentId = users[msg.userId1].opponent;
            users[msg.userId1].opponent = null;
            users[opponentId].opponent = null;
            users[msg.userId1].socket.emit('user disconnect',null);
            users[opponentId].socket.emit('user disconnect',null);
        });

        //CONNECTED USER COMMANDS
        socket.on('command', function(msg){
            console.log("User: command:"+JSON.stringify(msg));
            if(users[msg.userId1].opponent == null) return;
            if(users[msg.userId2].opponent == null) return;
            users[msg.userId1].socket.emit('command',msg);
            users[msg.userId2].socket.emit('command',msg);
        });

        //NEW PROTOCOL
        socket.on('request free user', function(msg){
            console.log('User: request free user'+JSON.stringify(msg));
            var reply = {};
            if(freeUser==null){
                freeUser=msg.id;
                reply.success = false;
                socket.emit('waiting for another free user', reply);
                console.log('sent: waiting for another free user:'+JSON.stringify(reply));
            }else{
                reply.userId1 = msg.id;
                console.log('LOGGER: freeUser:'+freeUser);
                console.log('LOGGER: users:'+printUsers());
                users[freeUser].socket.emit('u wanna be opponent',reply);
                console.log('sent: u wanna be opponent:'+JSON.stringify(reply));
            }
        });
        socket.on('u wanna be opponent', function(msg){
            console.log('User: u wanna be opponent:'+JSON.stringify(msg));
            if(msg.accept){
                users[msg.userId2].opponent  =users[msg.userId1].userId;
                users[msg.userId1].opponent  =users[msg.userId2].userId;
                users[msg.userId2].socket.emit("opponent connected",{userId1:msg.userId1,userId2:msg.userId2});
                console.log('sent: opponent connected:');
                users[msg.userId1].socket.emit("opponent connected",{userId1:msg.userId1,userId2:msg.userId2});
                console.log('sent: opponent connected:');
            }else{
                //rare
            }
        });
        socket.on('reply opponent request', function(msg){
            console.log('User: reply opponent request:'+JSON.stringify(msg));
            var reply = {};
            if(freeUser==null){
                freeUser=msg.id;
                reply.success = false;
                socket.emit('waiting for another free user', reply);
                console.log('sent: waiting for another free user:'+JSON.stringify(reply));
            }else{
                users[freeUser].socket.emit('u wanna be opponent',reply);
            }
        });

    });
};
module.exports = function (app, io) {
    return new GameServer(app, io);
};
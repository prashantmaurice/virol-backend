var fn = require('../lib/common-utils/functions');

var userIdGenerator = 0;
var users = {};
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
        console.log('a new user connected');
        var user = new userObject(socket);
        users[user.userId]=user;
//        this.mainId = user.userId;
        socket.emit('new connection',{ id : user.userId});
        socket.userId = user.userId;
        this.opponent = null;


        //SERVER RELATED CALLS
        socket.on('all users', function(){
            console.log('User requested all users details');
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
            delete users[socket.userId];
            io.emit('all users', null);
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
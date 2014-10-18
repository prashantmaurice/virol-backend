
/**
 * Module dependencies.
 */

require('./lib/init/init_app.js');

var express = require('express');
var routes = require('./routes');
//var user = require('./routes/user');
var http = require('http');
var path = require('path');
var config = require('config');
var httpProxy = require('http-proxy');

var app = express();
var httpServer = require('http').Server(app);
//
//var backendProxy = httpProxy.createProxy();
//var backendProxyServer = http.createServer(function(req, res) {
//    req.url = '/proxy' + req.url; //so that we can know all the proxied apis in backend
//    backendProxy.web(req, res, { target: config.backendServerConfig.url },function (e) {
//        console.logger.error('backendProxy : ', e);
//        res.send(500, "Something went wrong.!");
//    });
//});

// all environments
app.set('port', process.env.NODE_PORT || config.remindmeServer.port || 9000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, csrfrequestidentifier, x-csrftoken");
    next();
};

app.use(allowCrossDomain);

app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use('/backend', backendProxyServer);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('jade').render);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// Define all routes here
require('./routes')(app);

httpServer.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

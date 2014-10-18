
/*
 * GET home page.
 */

// exports.index = function(req, res){
// 	console.log("got request to index page");
//   res.render('index', { title: 'Preburn' });
// };

module.exports = function (app, io) {
//    require('./dashboard.js')(app);
    require('./game.js')(app,io);
};

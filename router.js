var routes = require('i40')();
var fs = require('fs');
var db = require('monk')('localhost/tutorials');
var qs = require('qs');
var tutorials = db.get('tutorials');
var view = require('./view');
var mime = require('mime');

routes.addRoute('/', function(req,res,url){
    res.setHeader('Content-Type', 'text/html');
    if (req.method === 'GET') {
        tutorials.find({}, function (err, docs) {
            var template = view.render('/tutorials/index', {tutorials:docs});
            res.end(template);
        })
    }
    if (req.method === "POST") {
        var result = '';
        req.on('data', function (chunk) {
            result += chunk;
        });
        req.on('end', function () {
            var tutorial = qs.parse(result);
            tutorial.tags = tutorial.tags.split(',');
            tutorials.insert(tutorial, function (err, doc) {
                if (err) {
                    res.end('ERROR!!!!!!!!UZHASNO!');
                }
                res.writeHead(302, {'Location': '/'});
                res.end();

            })
        })
    }
});

routes.addRoute('/tutorials/:id', function (req, res, url) {
    url = url.params.id;
    if (req.method === 'GET'){
        res.setHeader('Content-Type', 'text/html');
        tutorials.findOne({_id: url}, function (err, docs) {
            var template = view.render('/tutorials/show', docs);
            res.end(template);
        })
    }
});

routes.addRoute('/public/*', function (req, res, url) {
    res.setHeader('Content-Type', mime.lookup(req.url));
    fs.readFile('.' + req.url, function (err, file) {
        if (err) {
            res.setHeader('Content-Type', 'text/html');
            res.write('404')
        }
        res.end(file);
    })
});

routes.addRoute('/tutorials/:id/edit', function (req, res, url) {
    url = url.params.id;
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        tutorials.findOne({_id: url}, function (err, docs) {
            var template = view.render('tutorials/edit', docs);
            res.end(template);
        })
    }
});

routes.addRoute('/tutorials/:id/delete', function (req, res, url) {
    if (req.method === 'POST') {
        tutorials.remove({_id: url.params.id}, function (err, doc) {
            if (err) console.log(err);
            res.writeHead(302, {'Location': '/'});
            res.end()
        })
    }
});

routes.addRoute('/tutorials/:id/update', function(req, res , url){
    var data = '';
    req.on('data', function(chunk){
        data += chunk;
    });

    req.on('end', function(){
        var tutorial = qs.parse(data);
        tutorial.update({_id: url.params.id}, {topic: tutorial.topic, link: tutorial.link, description: tutorial.description, tags: tutorial.tags}, function(err,doc){
            res.writeHead(302, {'Location': '/'});
            res.end();
        })
    })
});


module.exports = routes;
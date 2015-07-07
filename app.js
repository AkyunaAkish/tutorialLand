var http = require('http'),
    router = require('./router'),
    url = require('url')

var server = http.createServer(function (req, res) {
    console.log(req.url);
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'})
        res.end();
        return;
    }
    var path = url.parse(req.url).pathname
    var currentRoute = router.match(path)
    currentRoute.fn(req, res, currentRoute)
})

server.listen(5555, function (err) {
    if (err) console.log('Doah', err)
    console.log('Woot. A server is running on port 5555')
})
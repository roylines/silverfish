var Cacheman = require('cacheman'),
  restify = require('restify');

var server = restify.createServer();
var cache = new Cacheman('silverfish');

function get(req, res, done) {
  return cache.get(req.params.key, function(e, v) {
    if (v === undefined) {
      res.send(404);
    } else {
      res.send(200, v);
    }
    return done();
  });
}

function put(req, res, done) {
  return cache.set(req.params.key, req.body, function(e) {
    res.send(200);
    return done();
  });
}

server.get('/object/:key', get);
server.put('/object/:key', put);

if (require.main === module) {
  return server.listen(process.env.PORT || 8080, function() {
    console.log('silverfish listening');
  });
}

module.exports = server;

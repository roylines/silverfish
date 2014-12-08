var async = require('async'),
  router = new require('router')(),
  finalhandler = require('finalhandler'),
  http = require('http');

var _cache = {};

function get(req, res) {
  var v = _cache[req.params.key];
  if (v === undefined) {
    res.statusCode = 404;
    return res.end();
  }

  function each(chunk, done) {
    res.write(chunk);
    return done();
  }

  function end() {
    res.end();
  }

  return async.eachSeries(v.chunks, each, end);
}

function put(req, res) {
  var chunks = [];
  req.on('data', function(chunk) {
    chunks.push(chunk);
  });
  req.on('end', function() {
    _cache[req.params.key] = {
      chunks: chunks
    };
    return res.end();
  });
}

router.get('/object/:key', get);
router.put('/object/:key', put);

var server = http.createServer(function(req, res) {
  return router(req, res, finalhandler(req, res));
});

if (require.main === module) {
  return server.listen(process.env.PORT || 8080, function() {
    console.log('silverfish listening');
  });
}

module.exports = server;

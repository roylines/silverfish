var net = require('net');

var commands = {};

/* 
https: //github.com/memcached/memcached/blob/master/doc/protocol.txt
*/

var COMMAND = 0,
  KEY = 1,
  FLAGS = 2,
  EXPTIME = 3,
  BYTES = 4,
  NOREPLY = 4;

commands.set = function(sock, command, data) {
  //console.log('SET', command[KEY], data);
  sock.write('STORED\r\n');
};

var server = net.createServer(function(sock) {
  var memo;

  function onData(d) {
    if (memo == null) {
      var i = d.indexOf('\r\n');
      var remaining = d.length - i - 4;

      memo = {
        command: d.substr(0, d.indexOf('\r\n')).split(' '),
        data: [d.substr(i + 2, remaining)],
        bytes: remaining
      };
    } else {
      var size = d.length;
      memo.bytes += size;
      memo.data.push(d.substr(0, size));
    }

    if (memo.bytes === +(memo.command[BYTES])) {
      commands[memo.command[COMMAND]](sock, memo.command, memo.data);
      memo = null;
    }
  }

  function onError(e) {
    console.error('ERROR', e);
  }

  function onEnd() {
    console.log('END');
  }

  sock.setEncoding('utf-8');
  sock.on('data', onData);
  sock.on('error', onError);
  sock.on('end', onEnd);
});

if (require.main === module) {
  server.listen(process.env.PORT || 8080, '127.0.0.1');
  console.log('listening...');
}

module.exports = server;


/*
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
*/

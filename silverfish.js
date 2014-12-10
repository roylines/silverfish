var async = require('async'),
  net = require('net');

var commands = {};

/* 
https: //github.com/memcached/memcached/blob/master/doc/protocol.txt
*/
commands.cache = {};

var COMMAND = 0,
  KEY = 1,
  FLAGS = 2,
  EXPTIME = 3,
  BYTES = 4,
  NOREPLY = 5;

commands.set = function(sock, memo, data, done) {
  if (!memo.data) {
    memo.data = [];
    memo.count = 0;
  }

  memo.data.push(data);
  memo.count += data.length;
  if (memo.count === +memo.args[BYTES] + 2) {
    //all done...
    if (!memo.args[NOREPLY]) {
      var item = {
        header: ['VALUE', memo.args[KEY], memo.args[FLAGS], memo.args[BYTES]].join(' ') + '\r\n',
        data: memo.data
      }
      commands.cache[memo.args[KEY]] = item;
      sock.write('STORED\r\n');
    }
    return done(null, true);
  }
  return done(null, false);
};

commands.get = function(sock, memo, data, done) {
  var item = commands.cache[memo.args[KEY]];
  sock.write(item.header);
  return async.eachSeries(item.data, function(d, cb) {
    sock.write(d);
    return cb();
  }, function() {
    sock.write('END\r\n');
    return done(null, true);
  });
};

var server = net.createServer(function(sock) {
  var memo;

  function onData(data) {
    if (memo == null) {
      var i = data.indexOf('\r\n');
      memo = {
        args: data.substr(0, i).split(' ')
      }
      data = data.substr(i + 2)
    }

    return commands[memo.args[COMMAND]](sock, memo, data, function(e, clear) {
      if (e || clear) {
        memo = null;
      }
    });
  }

  function onError(e) {
    memo = null;
    console.error('ERROR', e);
  }

  function onEnd() {
    memo = null;
    //console.log('END');
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

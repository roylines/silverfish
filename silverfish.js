var restify = require('restify');

this.server = restify.createServer();

if (require.main === module) {
  return this.server.listen(process.env.PORT || 8080, function() {
    console.log('silverfish listening');
  });
}

exports.listen = function() {
  this.server.listen.apply(this.server, arguments);
};

exports.close = this.server.close; 

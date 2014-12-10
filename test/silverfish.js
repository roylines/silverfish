var expect = require('chai').expect,
  Memcached = require('memcached'),
  silverfish = require('../silverfish');

var port = process.env.TESTPORT || 8081;

describe('listening on ' + port, function() {
  var testData = {
    field: 'value'
  };

  var large;

  before(function(done) {
    large = '1234567890',
      count = 8;
    for (var i = 0; i < count; i++) {
      large += large + large;
    }

    memcached = new Memcached('127.0.0.1:' + port);
    return silverfish.listen(port, done);
  });

  after(function(done) {
    silverfish.close();
    return done();
  });

  it('can set a value', function(done) {
    return memcached.set('foo', 'bar', 10, function(e) {
      expect(e).to.equal(undefined);
      return done();
    });
  });

  it('can set a large value', function(done) {

    return memcached.set('large', large, 10, function(e) {
      expect(e).to.equal(undefined);
      return done();
    });
  });

  it('can get a value', function(done) {
    return memcached.get('foo', function(e, d) {
      expect(e).to.equal(undefined);
      expect(d).to.equal('bar');
      return done();
    });
  });
  
  it('can get a large value', function(done) {
    return memcached.get('large', function(e, d) {
      expect(e).to.equal(undefined);
      expect(d).to.equal(large);
      return done();
    });
  });

});

var expect = require('chai').expect,
  request = require('request'),
  silverfish = require('../silverfish');

var port = process.env.TESTPORT || 8081;

describe('listening on ' + port, function() {
  var testData = {
    field: 'value'
  };

  before(function(done) {
    return silverfish.listen(port, done);
  });

  after(function(done) {
    silverfish.close();
    return done();
  });

  function url(path) {
    return 'http://localhost:' + port + path;
  }

  it('should return 404 for getting a missing object', function(done) {
    return request
      .get(url('/object/missing'))
      .on('response', function(r) {
        expect(r.statusCode).to.equal(404);
        return done();
      });
  });

  it('should return 200 for putting an object', function(done) {
    return request
      .put({
        url: url('/object/silverfish'),
        json: testData,
      }, function(e, r, b) {
        expect(r.statusCode).to.equal(200);
        return done();
      });
  });

  it('should return a valid object', function(done) {
    return request
      .get(url('/object/silverfish'), function(e, r) {
        expect(r.statusCode).to.equal(200);
        expect(r.body).to.deep.equal(JSON.stringify(testData));
        return done();
      });
  });
});

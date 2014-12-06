var expect = require('chai').expect,
  silverfish = require('../silverfish');

var port = process.env.TESTPORT || 8081;

describe('listening on ' + port, function() {
  before(function(done) {
    return silverfish.listen(port, done);
  });

  after(function(done) {
    return silverfish.close(done) 
  });
  
  it('should...', function() {
    expect(true).to.equal(true);
  });
});

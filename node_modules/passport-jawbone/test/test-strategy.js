var JawboneStrategy = require('passport-jawbone/strategy');
var should = require('should');

describe('JawboneStrategy', function() {
             before(function(done) {
                        this.strategy = new JawboneStrategy(
                            {clientID: '12345', clientSecret: 'secret'}
                        );
                        done();
                    });
             it("should be named jawbone", function(done) {
                    this.strategy.name.should.eql('jawbone');
                    done();
                });
             it("should have a default user agent", function(done) {
                    this.strategy._oauth2._customHeaders['User-Agent'].should.eql('passport-jawbone');
                    done();
                });
         });

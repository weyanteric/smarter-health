var jawbone = require('passport-jawbone');
var should = require('should');

describe("passport-jawbone", function() {
             it("should have a version", function(done) {
                    jawbone.version.should.startWith('0.');
                    done();
             });
         });

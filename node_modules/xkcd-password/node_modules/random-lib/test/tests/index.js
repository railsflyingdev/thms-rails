'use strict';

var _ = require('underscore');
var randomlib = require('../../lib');
var async = require('async');
var path = require('path');

exports.randomlib = {
  generateRandomInt: function(test) {
    test.expect(1);
    
    var rand = new randomlib();
    
    var options = {
      min: 3,
      max: 10
    };
    rand.randomInt(options, function(err, result) {
      test.equal(true, result <= 10 && result >= 3, 'should get an integer less than 10 and more than 3');
      test.done();
    });
  },
  generateManyInts: function(test) {
    test.expect(2);
    
    var rand = new randomlib();
    
    var options = {
      num: 1000,
      min: 0,
      max: 2000
    };
    rand.randomInts(options, function(err, results) {
      test.equal(true, Array.isArray(results), 'should get an array of results');
      test.equal(true, results.length === 1000, 'should get 1000 results');
      test.done();
    });
  },
  generateManyBoundedInts: function(test) {
    test.expect(2);
    
    var rand = new randomlib();
    
    var options = {
      num: 1000,
      min: 0,
      max: 10
    };
    rand.randomInts(options, function(err, results) {
      test.equal(1000, results.length, 'should get 1000 results');
      
      var fail = false;
      for (var i = 0; i < results.length; i++) {
        if (results[i] < options.min || results[i] > options.max) {
          fail = true;
        }
      }
      test.equal(false, fail, 'should see all results within requested bounds');
      test.done();
    });
  },
  randomIntsDefaults: function(test) {
    test.expect(1);
    
    var rand = new randomlib();
    
    rand.randomInts(function(err, results) {
      test.equal(10, results.length, 'should get 10 results');
      test.done();
    });
  },
  randomIntDefaults: function(test) {
    test.expect(1);
    
    var rand = new randomlib();
    
    rand.randomInt(function(err, result) {
      test.equal(true, result <= 10 && result >= 0, 'should get an integer less than 10 and more than 0');
      test.done();
    });
  },
  randomFloat: function(test) {
    test.expect(2);
    
    var rand = new randomlib();
    
    rand.randomFloat(function(err, result) {
      test.equal(true, result >= 0 && result <= 1, 'should be between 0 and 1');
      test.equal(true, result % 1 !== 0, 'should be a float');
      test.done();
    });
  },
  randomFloats: function(test) {
    test.expect(2);
    
    var rand = new randomlib();
    
    var fail = false;
    rand.randomFloats({num: 200}, function(err, results) {
      test.equal(200, results.length, 'should get 200 results');
      for(var i = 0; i < results.length; i++) {
        if (results[i] < 0 || results[i] > 1) {
          fail = true;
        }
        if (results[i] % 1 === 0) {
          fail = true;
        }
      }
      test.equal(false, fail, 'all results should be floats');
      test.done();
    });
  },
  multipleGenerateCalls: function(test) {
    test.expect(2);
    
    var rand = new randomlib();
    
    rand.randomInts({num: 500}, function(err, results) {
      test.equal(500, results.length, 'should get 500 results');
      
      rand.randomInts({num: 1000}, function(err, results) {
        test.equal(1000, results.length, 'should get 1000 results');
        test.done();
      });
    });
  },
  randomUniqueInts: function(test) {
    test.expect(2);
    
    var rand = new randomlib();
    
    rand.randomUniqueInts({num: 10, min: 0, max: 9}, function(err, results) {
      test.equal(10, results.length, 'should get 10 results');
      var unique = _.uniq(results);
      test.equal(10, unique.length, 'should have 10 unique results');
      test.done();
    });
  },
  tooManyRandomUniqueInts: function(test) {
    test.expect(1);
    
    var rand = new randomlib();
    
    rand.randomUniqueInts({num: 10, min: 3, max: 9}, function(err, results) {
      test.ok(err, 'should get an error message');
      test.done();
    });
  },
  randomUniqueFloats: function(test) {
    test.expect(2);
    
    var rand = new randomlib();
    
    rand.randomUniqueFloats({num: 10, min: 0, max: 9}, function(err, results) {
      test.equal(10, results.length, 'should get 10 results');
      var unique = _.uniq(results);
      test.equal(10, unique.length, 'should have 10 unique results');
      test.done();
    });
  }
};

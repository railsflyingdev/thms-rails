/*
 * random-lib
 * https://github.com/fardog/node-random-lib
 *
 * @since 0.1.0
 * @author Nathan Wittstock <nate@milkandtang.com>
 * @copyright 2014 Nathan Wittstock, contributors
 * @license MIT License - See file 'LICENSE' in this project.
 */

'use strict';
var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
        '*.json',
        '*.js',
        'lib/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    nodeunit: {
      tests: ['test/node_host.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-testling');

  grunt.registerTask('test', ['nodeunit']);
  grunt.registerTask('default', ['jshint', 'test', 'testling']);
};

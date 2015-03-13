module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            sass: {
                files: ['frontend/assets/stylesheets/**/*.scss'],
                tasks: ['sass:dist']
            },
            rig: {
                files: ['frontend/assets/javascripts/**/*.js','frontend/assets/javascripts/**/*.coffee'],
                tasks: ['rig:compile', 'uglify:default']
            },
            template: {
                files: ['frontend/assets/javascripts/views/**/*.jade', 'frontend/assets/javascripts/views/*.jade'],
                tasks: ['clean:templates', 'jade:compile', 'html2js:main','rig:compile', 'uglify:default', 'clean:templates']
            }
        },

        clean: {
            templates: ['frontend/assets/build/templates'],
            javascripts: ['frontend/assets/build/javascripts'],
            all: ['frontend/assets/build']
        },

        sass: {
            dist: {
                options: {
                  style: 'compressed',
                  banner: '/* Copyright 2014 Turnkey Hospitality Management Pty Ltd */'
                },
                files: {
                    'public/stylesheets/style.css': 'frontend/assets/stylesheets/application.scss',
                    'public/stylesheets/print.css': 'frontend/assets/stylesheets/print.scss'
                }
            }
        },

        rig: {
            compile: {
                files: {
                    'public/js/application.js' : ['frontend/assets/javascripts/application.js']
                }
            }
        },

        uglify: {
            options: {
                mangle: false
//                compress: {
////                    drop_console: true
//                }
            },
            default: {
                files: {
                    'public/js/application.min.js' : ['public/js/application.js']
                }
            }
        },

        jade: {
            options: {
//                amd: true,
//                namespace: 'JST',
//                client: true,
//                processName: function(filename) {
//                    a = filename.replace('assets/javascripts/views/','');
//                    return a.replace('.jade', '');
//                }
            },
            compile: {
                files: [{
                    expand: true,
                    cwd: "frontend/assets/javascripts/views",
                    src: ["**/*.jade"],
                    dest: "frontend/assets/build/templates",
                    ext: '.html'
                }]
            }
        },

        html2js: {
            options: {
                base: 'frontend/assets/build/templates',
                rename: function(filename) {
                    return filename.replace('.html', '');
                },
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: false,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }

            },
            main: {
                dest: 'frontend/assets/javascripts/lib/templates.js',
                src: ['frontend/assets/build/templates/**/*.html']
            }
//          ,
//            tasks: ['uglify:templates']
        }

//        concat: {
//            templates: {
//                src: ['build/javascripts/application.js', 'build/javascripts/templates.js'],
//                dest: ['public/js/application.min.js']
//            }
//        }

    });


    grunt.registerTask('default', ['clean', 'sass:dist', 'jade:compile', 'html2js:main', 'rig:compile', 'uglify', 'watch']);
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-rigger');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jade');
};

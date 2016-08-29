module.exports = function(grunt) {

  var package = grunt.file.readJSON('package.json');
  var spawn = require('child_process').spawn;

  grunt.initConfig({
    pkg: package,
    concat: {
      options: {
        separator: '',
        process: {
          data: {
            // TODO: get indent somehow
            include: function(file, indent){
              var res = grunt.file.read('src/'+file+'.coffee');
              if(res.endsWith('\n')){
                res = res.replace(/\s+$/, '');
              }
              if(indent != null){
                res = res.split('\n');
                res = res.join('\n'+indent);
              }
              return res;
            },
            version: package.version
          }
        }
      },
      dist: {
        src: [ 'src/module.coffee' ],
        dest: 'dist/waff-query.coffee'
      }
    },
    coffee: {
      compile: {
        options: {
          bare: true
        },
        files: {
          'dist/waff-query.js': 'dist/waff-query.coffee'
        }
      },
      test: {
        options: {
          bare: true
        },
        files: [{
          expand: true,
          cwd: 'test',
          src: '**/*.coffee',
          dest: 'test',
          ext: '.js'

        }]
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) | Released under the MIT license */\n'
      },
      waff: {
        files: {
          'dist/waff-query.min.js': 'dist/waff-query.js'
        }
      }
    },
    usebanner: {
      js: {
        options: {
          banner: '/*\n * <%= pkg.name %> v<%= pkg.version %>\n * <%= pkg.homepage %>\n *\n * Copyright wvffle.net\n * Released under the MIT license\n *\n * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n */\n',
          linebreak: true
        },
        files: {
          src: [ 'dist/waff-query.js' ]
        }
      },
      coffee: {
        options: {
          banner: '###\n# <%= pkg.name %> v<%= pkg.version %>\n# <%= pkg.homepage %>\n#\n# Copyright wvffle.net\n# Released under the MIT license\n#\n# Date: <%= grunt.template.today("yyyy-mm-dd") %>\n###\n',
          linebreak: true
        },
        files: {
          src: [ 'dist/waff-query.coffee' ]
        }
      }
    },
    open: {
      tests: {
        path: process.cwd()+'/test/index.html'
      }
    },
    modify_json: {
      options: {
        indent: '  ',
        fields: {
          name: package.name,
          version: package.version,
          description: package.description,
          repository: package.repository,
          keywords: package.keywords,
          authors: package.authors,
          license: package.license,
          homepage: package.homepage
        }
      },
      files: {
        src: [ 'bower.json' ]
      }
    },
    jsdoc2md: {
      readme: {
        options: {
          template: grunt.file.read('readme.hbs')
        },
        src: 'dist/waff-query.js',
        dest: 'README.md'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-modify-json');
  grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('tests', function () {
    index = grunt.file.read('test/index.html');
    modules = grunt.file.expand(['test/module.js']);
    files = grunt.file.expand(['test/**/*.js', '!test/module.js']);
    res = '<!-- {{ -->\n'
    for (var i = 0; i < modules.length; i++) {
      res += '<script src="../'+modules[i]+'"></script>\n'
    }
    for (var i = 0; i < files.length; i++) {
      file = files[i]
      res += '<script src="../'+file+'"></script>\n'
    }
    res += '<!-- }} -->'
    grunt.file.write('test/index.html', index.replace(/<!-- {{ -->([^]+)<!-- }} -->/, res))
  })

  grunt.registerTask('default', ['build', 'test', 'docs', 'publish']);
  grunt.registerTask('build', ['concat', 'coffee:compile', 'usebanner', 'uglify']);
  grunt.registerTask('test', ['coffee:test', 'tests', 'open:tests']);
  grunt.registerTask('docs', ['jsdoc2md']);
  grunt.registerTask('publish', ['modify_json']);

};

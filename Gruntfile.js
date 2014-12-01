module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    shell: {
      clean: {
        command: [
          'rm -rf build',
          'mkdir -p build'
        ].join("&&"),
      },
      generic: {
        command: [
          'mkdir -p build',
          'for i in $(find * -type d -maxdepth 0 | grep -viw "node_modules\\|build\\|sass\\|private"); do rm -rf build/$i && cp -rf $i build/$i; done',
        ].join("&&")
      },
      markup: {
        command: [
          '$(npm bin)/jade index.jade && mv index.html build/index.html',
        ].join("&&")
      },
      sass: {
        command: [
          'mkdir -p build/css',
          'cd sass',
          'for i in $(find *.scss -maxdepth 0); do sass $i:../build/css/$i.css --cache-location "cache" --style compressed ; done',
          'cd ..'
        ].join("&&")
      },
      js: {
        command: [
          'rm -rf build/js && cp -rf js build/js',
          // 'cp $(npm root)/angular/angular.min.js build/js/angular.min.js',
          // 'cp $(npm root)/angular/angular.min.js.map build/js/angular.min.js.map',
          'cp $(npm root)/jquery/dist/jquery.min.js build/js/jquery.min.js',
          'cp $(npm root)/jquery/dist/jquery.min.map build/js/jquery.min.map',
          'cp $(npm root)/async/lib/async.js build/js/async.js'
        ].join("&&")
      },
      server: {
        command: "clear && node server.js"
      }
    }

  });

  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', [
    'shell:generic',
    'shell:markup',
    'shell:sass',
    'shell:js'
  ]);

  grunt.registerTask('clean', [
    'shell:clean'
  ]);

  grunt.registerTask('markup', [
    'shell:markup'
  ]);

  grunt.registerTask('sass', [
    'shell:sass'
  ]);

  grunt.registerTask('js', [
    'shell:js'
  ]);

  grunt.registerTask('server', [
    'shell:server'
  ]);

};
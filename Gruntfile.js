module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    shell: {
      clean: {
        command: 'rm -rf css'
      },
      sass: {
        command: 'sass --update sass:css --cache-location "sass/cache" --style compressed --sourcemap=none'
      },
      sasswatch: {
        command: 'sass --watch sass:css --cache-location "sass/cache" --style compressed --sourcemap=none'
      },
      js: {
        command: [
          'mkdir -p js/copied',
          'cp bower_components/jquery/dist/jquery.min.js js/copied/jquery.min.js',
          'cp bower_components/jquery/dist/jquery.min.map js/copied/jquery.min.map',
          'cp bower_components/async/lib/async.js js/copied/async.js',
          'cp bower_components/underscore/underscore-min.js js/copied/underscore-min.js',
          'cp bower_components/underscore/underscore-min.map js/copied/underscore-min.map'
        ].join("&&")
      },
      server: {
        command: "forever --minUptime 1000 --minUptime --spinSleepTime 1000 -m 10 server.js"
      }
    }

  });

  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', [
    'shell:clean',
    'shell:js',
    'shell:sass'
  ]);

  grunt.registerTask('clean', [
    'shell:clean'
  ]);

  grunt.registerTask('js', [
    'shell:js'
  ]);

  grunt.registerTask('sass', [
    'shell:sass'
  ]);

  grunt.registerTask('sasswatch', [
    'shell:sasswatch'
  ]);

  grunt.registerTask('server', [
    'shell:server'
  ]);

};
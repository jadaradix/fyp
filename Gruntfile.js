module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    shell: {
      clean: {
        command: 'rm -rf css'
      },
      sass: {
        command: 'sass --watch sass:css --cache-location "sass/cache" --style compressed'
      },
      js: {
        command: [
          'mkdir -p js/copied',
          'cp $(npm root)/jquery/dist/jquery.min.js js/copied/jquery.min.js',
          'cp $(npm root)/jquery/dist/jquery.min.map js/copied/jquery.min.map',
          'cp $(npm root)/async/lib/async.js js/copied/async.js'
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
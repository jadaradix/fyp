module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    shell: {
      clean: {
        command: 'rm -rf css'
      },
      sass: {
        command: [
          'mkdir -p css',
          'cd sass',
          'for i in $(find *.scss -maxdepth 0); do sass $i:../css/$i.css --cache-location "cache" --style compressed ; done',
          'cd ..'
        ].join("&&")
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
        command: "npm start"
      }
    }

  });

  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', [
    'shell:clean',
    'shell:sass',
    'shell:js'
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

};
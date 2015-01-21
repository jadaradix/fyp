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
          'cp $(npm root)/jquery/dist/jquery.min.js js/jquery.min.js',
          'cp $(npm root)/jquery/dist/jquery.min.map js/jquery.min.map',
          'cp $(npm root)/async/lib/async.js js/async.js'
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
({
    baseUrl: './scripts/',
    mainConfigFile: './scripts/main.js',
 
    out: 'dist/text_animator.min.js',
    /*optimize: 'uglify2',*/
    optimize: 'none',
    
    include: ['main'],
    name: '../bower_components/almond/almond',
    "wrap": {
    "startFile": "wrap.start",
    "endFile": "wrap.end"
  }
})
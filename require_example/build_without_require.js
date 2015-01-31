({
    baseUrl: './scripts/',
    mainConfigFile: './scripts/main.js',
 
    out: 'dist/main-built-no-require.min.js',
    optimize: 'uglify2',
 
    include: ['main'],
    name: '../bower_components/almond/almond',
})
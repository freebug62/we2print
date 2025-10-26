const mix = require('laravel-mix');

mix.setPublicPath('dist');

mix.styles([
    'bin/css/ui.css',
    // Components.
    'bin/js/components/Loading/Loading.css',
    'bin/js/components/RightBar/RightBar.css',
    'bin/js/components/LeftBar/LeftBar.css',
    'bin/js/components/MainWindow/MainWindow.css',
], 'dist/css/w2p.min.css')
    .js([
        'bin/js/app.js'
    ], 'dist/js/w2p.min.js')
    .version();
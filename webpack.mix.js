const mix = require('laravel-mix');
const JavaScriptObfuscator = require('webpack-obfuscator');

mix.setPublicPath('./');

/**
 * Compile sample app initializer.
 */
mix
    .styles([
        'sample/document-info.css',
        'sample/draw-element.css',
        'sample/element-text.css',
        'sample/shape-image.css',
        'sample/element-image.css',
        'sample/bg-image.css',
        'sample/drag-window.css',
        'sample/bg-color.css',
        'sample/main.css'
    ], 'app.min.css')
    .js([
        'sample/main.js'
    ], 'app.min.js')
    .version();

mix.copyDirectory('bin/asset', 'dist/asset');

/**
 * Minify and obfuscate production assets.
 */
if (mix.inProduction()) {
    mix.webpackConfig({
        plugins: [
            new JavaScriptObfuscator(
                {
                    rotateStringArray: true,
                    stringArray: true,
                    stringArrayThreshold: 0.75,
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 0.8,
                    deadCodeInjection: true,
                    deadCodeInjectionThreshold: 0.4,
                    debugProtection: false,
                    disableConsoleOutput: true,
                },
                ['vendor.js'] // optional: exclude vendor bundles
            ),
        ],
    });
}
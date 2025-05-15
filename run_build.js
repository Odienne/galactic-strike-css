import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['src/js/main.js'],
    bundle: true,
    outfile: 'game.js',
})
http: http-server ./dist -c-1
css: chokidar --silent "scripts/css.packer.js" "src/css/**/*.css" --initial -c "npm run build-css"
js: chokidar --silent "webpack.config.js" "scripts/js.packer.js" "src/js/**/*.js" "src/svg/**/*.svg" --initial -c "npm run build-js"

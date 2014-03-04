var gutil = require('gulp-util'),
  _ = require('lodash'),
  path = require('path'),
  clone = require('gulp-clone'),
  cssMin = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  filter = require('gulp-filter');

var self = module.exports = {
  __module: {
    properties: {
      isProd: "config!isProd",
      util: "../../util"
    },
    provides: {
      "assetmanager/build/transforms/define_transforms": {
        before: ["./dest", "./inject"],
        after: ["./concatStyles"]
      }
    }
  },

  define_transforms: function(definitions) {
    if(!self.isProd) {
      return definitions;
    }
    
    var concatStream = [];

    definitions.resources.styles.namespaces = _.mapValues(definitions.resources.styles.namespaces, 
      function(styles, namespace) {
        var namespaceFilter = filter(styles.files.slice(0));
        var clonseSink = clone();
        concatStream.push(
          namespaceFilter,
          clonseSink,
          cssMin(),
          rename({
            extname: ".min.css"
          }),
          clonseSink.tap(),
          namespaceFilter.restore()
        );
        
        //rewrite the new namespace
        return {
          urls: styles.urls,
          files: _.map(styles.files, function(file) {
            return file.replace(/\.css$/, ".min.css");
          })
        };
      });
    
    Array.prototype.push.apply(definitions.streams.assets, concatStream);
    return definitions;
  }
};


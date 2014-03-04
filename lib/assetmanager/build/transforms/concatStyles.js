var gutil = require('gulp-util'),
  gulpConcatCss = require('gulp-concat-css'),
  through = require('through2'),
  _ = require('lodash'),
  clone = require('gulp-clone'),
  order = require('gulp-order'),
  path = require('path'),
  filter = require('gulp-filter');

var self = module.exports = {
  __module: {
    properties: {
      isProd: "config!isProd",
      util: "../../util",
      bundlesDir: "config!resources.bundlesSubDir"
    },
    provides: {
      "assetmanager/build/transforms/define_transforms": {
        before: ["./dest", "./inject"],
        after: ['./less']
      }
    }
  },

  define_transforms: function(definitions) {
    if(!self.isProd) {
      return definitions;
    }
    
    var concatStream = [];
    _.each(definitions.resources.styles.namespaces, function(styles, namespace) {
      var files = styles.files.slice(0);
      var namespaceFilter = filter(files);
      var clonseSink = clone();
      var bundleName = path.join(self.bundlesDir, namespace+".css");
      concatStream.push(
        namespaceFilter,
        clonseSink,
        order(files),
        gulpConcatCss(bundleName),
        clonseSink.tap(),
        namespaceFilter.restore()
      );
      
      //rewrite the new namespace
      styles.files = [bundleName];
    });

    Array.prototype.push.apply(definitions.streams.assets, concatStream);
    return definitions;
  }
};


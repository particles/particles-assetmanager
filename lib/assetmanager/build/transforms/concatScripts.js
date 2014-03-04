var gutil = require('gulp-util'),
  gulpConcat = require('gulp-concat'),
  _ = require('lodash'),
  path = require('path'),
  order = require('gulp-order'),
  clone = require('gulp-clone'),
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
        before: ["./dest", "./inject"]
      }
    }
  },

  define_transforms: function(definitions) {
    if(!self.isProd) {
      return definitions;
    }
    
    var concatStream = [];
    _.each(definitions.resources.scripts.namespaces, function(scripts, namespace) {
      var files = scripts.files.slice(0);
      var namespaceFilter = filter(files);
      var clonseSink = clone();
      var bundleName = path.join(self.bundlesDir, namespace+".js");
      concatStream.push(
        namespaceFilter,
        clonseSink,
        order(files),
        gulpConcat(bundleName),
        clonseSink.tap(),
        namespaceFilter.restore()
      );
      
      //rewrite the new namespace
      scripts.files = [bundleName];
    });
    
    Array.prototype.push.apply(definitions.streams.assets, concatStream);
    return definitions;
  }
};


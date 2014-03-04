var gutil = require('gulp-util'),
  _ = require('lodash'),
  path = require('path'),
  clone = require('gulp-clone'),
  uglify = require('gulp-uglify'),
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
        after: ["./concatScripts"]
      }
    }
  },

  define_transforms: function(definitions) {
    if(!self.isProd) {
      return definitions;
    }
    
    var concatStream = [];

    definitions.resources.scripts.namespaces = _.mapValues(definitions.resources.scripts.namespaces, 
      function(scripts, namespace) {
        var namespaceFilter = filter(scripts.files.slice(0));
        var clonseSink = clone();
        concatStream.push(
          namespaceFilter,
          clonseSink,
          uglify(),
          rename({
            extname: ".min.js"
          }),
          clonseSink.tap(),
          namespaceFilter.restore()
        );
        
        //rewrite the new namespace
        return {
          urls: scripts.urls,
          files: _.map(scripts.files, function(file) {
            return file.replace(/\.js$/, ".min.js");
          })
        };
      });
    
    Array.prototype.push.apply(definitions.streams.assets, concatStream);
    return definitions;
  }
};


var less = require('gulp-less'),
  gutil = require('gulp-util'),
  gulp = require('gulp'),
  _ = require('lodash'),
  through = require('through2'),
  path = require('path'),
  clone = require('gulp-clone'),
  filter = require('gulp-filter');

var self = module.exports = {
  __module: {
    properties: {
      assetsDir: "config!resources.assetsDir",
      util: "../../util"
    },
    provides: {"assetmanager/build/transforms/define_transforms": {before: ["./dest", "./inject"]}}
  },

  define_transforms: function(definitions) {
    var lessFiles = [];
    definitions.resources.styles.namespaces = _.mapValues(definitions.resources.styles.namespaces, function(styles) {
      return {
        urls: styles.urls,
        files: _.map(styles.files, function(file) {
          var extension = path.extname(file);
          if(extension === ".less") {
            lessFiles.push(file);
            return file.replace(/\.less$/, ".css");
          }
          return file;
        })
      };
    });

    //compile only injected resources
    var lessResourcesFilter = filter(lessFiles);
    var lessFilter = filter('**/*.less');
    var cloneSink = clone();
    
    definitions.streams.assets.push(
      lessFilter,
      //save first because we need resources in place for @imports
      gulp.dest(self.assetsDir),
      //wait to copy all the files
      self.util.bufferStream(),
      lessResourcesFilter,
      cloneSink,
      less({
        paths: [self.assetsDir]
      }),
      cloneSink.tap(),
      lessResourcesFilter.restore(),
      lessFilter.restore()
    );
    return definitions;
  }
};

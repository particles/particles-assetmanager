var less = require('gulp-less'),
  gutil = require('gulp-util'),
  gulp = require('gulp'),
  _ = require('lodash'),
  path = require('path'),
  clone = require('gulp-clone'),
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
        after: ["./less"]
      }
    }
  },

  define_transforms: function(resources) {
    if(!self.isProd) {
      return;
    }
    
//    var concat
//    var lessFiles = [];
//    resources.styles.namespaces = _.mapValues(resources.styles.namespaces, function(styles) {
//      return {
//        urls: styles.urls,
//        files: _.map(styles.files, function(file) {
//          var extension = path.extname(file);
//          if(extension === ".less") {
//            lessFiles.push(file);
//            return file.replace(/\.less$/, ".css");
//          }
//          return file;
//        })
//      };
//    });
//
//    //compile only injected resources
//    var lessFilter = filter(lessFiles);
//    var cloneSink = clone();
//    
//    return {
//      assetsStream: gutil.combine(
//        lessFilter,
//        //save first because we need resources in place for @imports
//        gulp.dest(self.assetsDir),
//        self.util.bufferStream(),
//        cloneSink,
//        less({
//          paths: [self.assetsDir]
//        }),
//        cloneSink.tap(),
//        lessFilter.restore()
//      )()
//    };
  }
};

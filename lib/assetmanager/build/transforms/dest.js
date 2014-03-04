var gulp = require('gulp');

var self = module.exports = {
  __module: {
    properties: {
      viewsDir: 'config!resources.viewsDir',
      assetsDir: 'config!resources.assetsDir'
    },
    provides: {"assetmanager/build/transforms/define_transforms": {}}
  },

  define_transforms: function(definitions) {
    definitions.streams.assets.push(gulp.dest(self.assetsDir));
    definitions.streams.views.push(gulp.dest(self.viewsDir));
    return definitions;
  }
};

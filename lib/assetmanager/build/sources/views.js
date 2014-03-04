var gulp = require('gulp'),
  mergeStreams = require('multistream-merge');

var self = module.exports = {
  __module: {
    properties: {
      register_views_dir: 'svc!resources/register_views_dir',
    },
    provides: {"assetmanager/build/sources/define_sources": {}}
  },

  define_sources: function(definitions) {
    return self.register_views_dir()
      .then(function(views) {
        function viewsStream() {
          return mergeStreams.obj(views.map(function(src) {
            return gulp.src(src + "/**/*.*");
          }));
        }

        definitions.streams.views.push(viewsStream);
        return definitions;
      });
  }
};

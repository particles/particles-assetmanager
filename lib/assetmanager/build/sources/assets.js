var gulp = require('gulp'),
  mergeStreams = require('multistream-merge');

var self = module.exports = {
  __module: {
    properties: {
      register_assets_dir: 'svc!resources/register_assets_dir',
    },
    provides: {"assetmanager/build/sources/define_sources": {}}
  },

  define_sources: function(definitions) {
    return self.register_assets_dir()
      .then(function(assets) {
        function assetsStream() {
          return mergeStreams.obj(assets.map(function(src) {
            return gulp.src(src + "/**/*.*");
          }));
        }
        
        definitions.streams.assets.push(assetsStream);
        return definitions;
      });
  }
};

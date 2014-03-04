var path = require('path'),
  _ = require('lodash');


var self = module.exports = {
  __module: {
    properties: {
      register_assets_dir: 'svc!resources/register_assets_dir',
      register_views_dir: 'svc!resources/register_views_dir',
      promises: 'utils/promises',
      gulp: 'npm!gulp'
    },
    provides: {"assetmanager/watch/run": {}}
  },

  run: function() {
    //copy assets
    return self.promises.all([
      self.register_assets_dir(), 
      self.register_views_dir()
    ])
      .spread(function(assets, views) {
        assets = _.flatten(assets);
        assets = _.map(assets, function(dir) {
          return path.join(dir, "**");
        });
        
        views = _.flatten(views);
        views = _.map(views, function(dir) {
          return path.join(dir, "**");
        });
        
        
        self.gulp.watch(views, ['build']);
        self.gulp.watch(assets, ['build']);
      });
  }
};



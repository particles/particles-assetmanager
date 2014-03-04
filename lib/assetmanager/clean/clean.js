var rimraf = require('rimraf');

var self = module.exports = {
  __module: {
    properties: {
      assetsDir: 'config!resources.assetsDir',
      viewsDir: 'config!resources.viewsDir',
      promises: 'utils/promises'
    },
    provides: {"assetmanager/clean/run": {}}
  },

  run: function() {
    rimraf.sync(self.assetsDir);
    rimraf.sync(self.viewsDir);
  }
};

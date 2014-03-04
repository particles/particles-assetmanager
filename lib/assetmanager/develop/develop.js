var path = require('path'),
  _ = require('lodash');


var self = module.exports = {
  __module: {
    properties: {
      scatter: 'container!',
      gulp: 'npm!gulp'
    },
    provides: {"assetmanager/develop/run": {}}
  },

  run: function() {
    var files = [];
    self.scatter.module.container.resolver.iterateParticles(function(component) {
      files.push(path.join(component.root, "**/*.{js,json}"));
      Array.prototype.push.apply(files, component.descriptor.excludeFull);
    });

    self.gulp.watch(files, ['build', 'watch', 'server']);
  }
};



var _ = require('lodash');

var self = module.exports = {
  __module: {
    properties: {
      use_scripts: 'svc!resources/use_scripts',
      util: 'assetmanager/util',
      staticUrlRoot: 'config!resources.staticUrlRoot'
    },
    provides: {"assetmanager/build/sources/define_sources": {}}
  },

  define_sources: function(definitions) {
    return self.use_scripts().then(function(scripts) {
      definitions.resources.scripts = {
        namespaces: self.util.groupResources(
          _.compact(_.flatten(scripts, true))
        ),
        options: {
          injectFilter: "**/*.jade",
          injectOptions: {
            urlPrefix: self.staticUrlRoot,
            defaultExtension: "js"
          }
        }
      };
      return definitions;
    });
  }
};



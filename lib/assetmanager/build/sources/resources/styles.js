var _ = require('lodash');

var self = module.exports = {
  __module: {
    properties: {
      use_stylesheets: 'svc!resources/use_stylesheets',
      util: 'assetmanager/util',
      staticUrlRoot: 'config!resources.staticUrlRoot'
    },
    provides: {"assetmanager/build/sources/define_sources": {}}
  },

  define_sources: function(definitions) {
    return self.use_stylesheets().then(function(styles) {
      definitions.resources.styles = {
        namespaces: self.util.groupResources(
          _.compact(_.flatten(styles, true))
        ),
        options: {
          injectFilter: "**/*.jade",
          injectOptions: {
            urlPrefix: self.staticUrlRoot,
            defaultExtension: "css"
          }
        }
      };
      return definitions;
    });
  }
};

var _ = require('lodash'),
  objectPath = require('object-path');

var self = module.exports = {
  __module: {
    properties: {
      contributeViews: 'svc!resources/contribute_views'
    },
    provides: {"assetmanager/build/sources/define_sources": {}}
  },

  define_sources: function(definitions) {
    return self.contributeViews().then(function(contributions) {
      contributions = _(contributions).flatten(true).compact().value();
      var groupedContribution = {};
      contributions.forEach(function(contr) {
        objectPath.push(groupedContribution, [contr.name, 'files'], contr.view);
      });
      
      definitions.resources.viewContributions = {
        namespaces: groupedContribution,
        options: {
          injectFilter: "**/*.jade",
          injectOptions: {
            relative: true,
            urlPrefix: ""
          }
        }
      };
      return definitions;
    });
  }
};



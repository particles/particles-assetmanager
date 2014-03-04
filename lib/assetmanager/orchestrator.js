var _ = require('lodash'),
  gutil = require('gulp-util'),
  through = require('through2'),
  mergeStreams = require('multistream-merge');

var self = module.exports = {
  __module: {
    properties: {
      log: './log',
      define_sources: 'svc!assetmanager/build/sources/define_sources',
      define_transforms: 'svc!assetmanager/build/transforms/define_transforms',
      promises: 'utils/promises',
      util: './util'
    },
    provides: {"assetmanager/run": {}}
  },
  
  connectStreams: function(sources, transforms) {
    var promises = [];
    _.each(sources, function(sourceSet, name) {
      var deferred = self.promises.defer();
      
      var stream = gutil.combine(
        mergeStreams.obj(sourceSet.map(function(source) {
          //activate sources
          return source();
        }))
        .pipe(self.util.logStream("Resource read", "Source stream ended", name))
        .pipe(gutil.combine(transforms[name])())
        .pipe(self.util.logStream("Resource processed", "Transform stream ended", name))
      )()
        .on('error', onerror)
        //if last in the pipeline finish is emitted
        .once('finish', onfinish);

      promises.push(deferred.promise);

      function onerror(err) {
        self.log.error({err: err}, "["+name+"] Stream error");
        deferred.reject(err);
      }

      function onfinish() {
        self.log.info("["+name+"] Stream completed");
        //give the time the write stream to drain and close
        deferred.resolve();
      }
    });
    
    return self.promises.all(promises).then(function() {
      self.log.info("All tasks completed");
    });
  },

  run: function(taskName) {
    var resources = {};
    return self.promises.sequence([
      self.define_sources.bind(null, resources),
      self.define_transforms.bind(null, resources)
    ])
      .then(function(definitions) {
        definitions = definitions.map(function(streams) {
          streams = _.compact(streams);
          var streamsByName = {};
          streams.forEach(function(streamObj) {
            _.each(streamObj, function(stream, name) {
              streamsByName[name] = streamsByName[name] || [];
              streamsByName[name].push(stream);
            });
          });
          return streamsByName;
        });
        
        self.log.debug(resources, "Registered resources");
        
        return self.connectStreams(definitions[0], definitions[1]);
      });
  }
};

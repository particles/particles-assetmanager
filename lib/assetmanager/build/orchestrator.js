var _ = require('lodash'),
  gutil = require('gulp-util'),
  through = require('through2'),
  mergeStreams = require('multistream-merge');

var self = module.exports = {
  __module: {
    properties: {
      log: './log',
      define_sources: 'svc|pipeline!assetmanager/build/sources/define_sources',
      define_transforms: 'svc|pipeline!assetmanager/build/transforms/define_transforms',
      promises: 'utils/promises',
      util: '../util'
    },
    provides: {"assetmanager/build/run": {}}
  },
  
  connectStreams: function(sources, transforms) {
    var promises = [];
    _.each(sources.streams, function(sourceSet, name) {
      var deferred = self.promises.defer();
      
      var stream = gutil.combine(
        mergeStreams.obj(sourceSet.map(function(source) {
          //activate sources
          return source();
        }))
        .pipe(self.util.logStream("Resource read", "Source stream ended", name))
        .pipe(gutil.combine(transforms.streams[name])())
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

  run: function() {
    return self.define_sources({
      streams: {
        assets: [], views: []
      },
      resources: {}
    })
      .then(function(sources) {
        return self.define_transforms({
          streams: {
            assets: [], views: []
          },
          resources: sources.resources
        })
          .then(function(transforms) {
            self.log.debug(transforms.resources, "Registered resources");
            return self.connectStreams(sources, transforms);
          });
      });
  }
};

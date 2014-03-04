var expect = require('chai').expect,
  fs = require('fs'),
  rimraf = require('rimraf'),
  ParticlesAssetManager = require('../');


function checkFiles(fileName, env) {
  expect(fs.readFileSync('test/tmp/'+fileName, {encoding: 'utf8'}), fileName)
    .to.be.equal(fs.readFileSync('test/expected/'+env+"/"+fileName, {encoding: 'utf8'}));
}

describe('assetmanager build',function() {
  var particlesAssetManager;
  before(function(done) {
    particlesAssetManager = new ParticlesAssetManager({
      config: {
        configDir: "${appRoot}/test/config"
      }
    });
    rimraf.sync('test/tmp');
    particlesAssetManager.runTask('build').then(function() {
      //wait the OS to write the stream
      setTimeout(done, 100);
    }).otherwise(done);
  });
  
  it("should copy the assets to dest dir", function() {
    checkFiles('assets/scripts/script.js', 'dev');
  });
  
  it("should compile less into css (without removing old files)", function() {
    checkFiles('assets/testless.less', 'dev');
    checkFiles('assets/testless.css', 'dev');
  });
  
  it("should inject resources into templates", function() {
    checkFiles('views/template.jade', 'dev');
  });
});


describe('assetmanager build (production mode)',function() {
  var particlesAssetManager;
  before(function(done) {
    particlesAssetManager = new ParticlesAssetManager({
      config: {
        configDir: "${appRoot}/test/config",
        isProd: true
      }
    });
    
    rimraf.sync('test/tmp');
    particlesAssetManager.runTask('build').then(function() {
      //wait the OS to write the stream
      setTimeout(done, 100);
    }).otherwise(done);
  });
  
  it("should copy the assets to dest dir", function() {
    checkFiles('assets/scripts/script.js', 'prod');
  });
  
  it("should compile less into css (without removing old files)", function() {
    checkFiles('assets/testless.less', 'prod');
    checkFiles('assets/testless.css', 'prod');
  });
  
  it("should inject resources into templates", function() {
    checkFiles('views/template.jade', 'prod');
  });
  
  it("should concatenate scripts", function() {
    checkFiles('assets/build/default.js', 'prod');
  });

  it("should concatenate styles", function() {
    checkFiles('assets/build/default.css', 'prod');
  });
  
  it("should minify scripts", function() {
    checkFiles('assets/build/default.min.js', 'prod');
  });
  
  it("should minify css", function() {
    checkFiles('assets/build/default.min.css', 'prod');
  });
});


describe.skip('assetmanager clean',function(done) {

  var particlesAssetManager;
  before(function() {
    particlesAssetManager = new ParticlesAssetManager({
      config: {
        configDir: "${appRoot}/test/config"
      }
    });
  });
  
  it("should remove assets and view dirs", function(done) {
    particlesAssetManager.runTask('build').then(function() {
      expect(fs.existsSync('test/tmp/assets'), 'assets').to.be.true;
      expect(fs.existsSync('test/tmp/views'), 'views').to.be.true;
      return particlesAssetManager.runTask('clean').then(function() {
        expect(fs.existsSync('test/tmp/assets')).to.be.false;
        expect(fs.existsSync('test/tmp/views')).to.be.false;
        done()
      });
    }).otherwise(done);
  });
});





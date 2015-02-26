/* global process, require */

(function () {
    
    "use strict";

    var args = process.argv,
        fs = require("fs"),
        mkdirp = require("mkdirp"),
        path = require("path"),
        Handlebars = require("handlebars"),
        SourceMap = require('handlebars/node_modules/source-map'),
        SourceMapConsumer = SourceMap.SourceMapConsumer,
        SourceNode = SourceMap.SourceNode
        ;

    var SOURCE_FILE_MAPPINGS_ARG = 2;
    var TARGET_ARG = 3;
    var OPTIONS_ARG = 4;

    var sourceFileMappings = JSON.parse(args[SOURCE_FILE_MAPPINGS_ARG]);
    var target = args[TARGET_ARG];
    var options = JSON.parse(args[OPTIONS_ARG]);

    var sourcesToProcess = sourceFileMappings.length;
    var results = [];
    var problems = [];

    function parseDone() {
        if (--sourcesToProcess === 0) {
            console.log("\u0010" + JSON.stringify({results: results, problems: problems}));
        }
    }

    function throwIfErr(e) {
        if (e) throw e;
    }    

    var endsep = new RegExp(path.sep + '+$');

    sourceFileMappings.forEach(function (sourceFileMapping) {

      var input = sourceFileMapping[0];
      var name  = sourceFileMapping[1];
      var base  = input.replace(name, '');
      var extension = path.extname(input);
      var extend = new RegExp(extension.replace('.', '\\.') + '$');
      var output = path.join(target, name.replace(extend, '.js'));
      var root = path.join(base, options.root);
      var partial = path.basename(input).match(/^_/);

      mkdirp(path.dirname(output), function (e) {
        throwIfErr(e);

        try {

          var mapFile = path.join(target, name.replace(extend, '.map'));
          var mapName = path.basename(mapFile);

          var data = fs.readFileSync(input, 'utf8');

          if (options.bom && data.indexOf('\uFEFF') === 0) {
            data = data.substring(1);
          }

          var known = {};
          if (options.known && !Array.isArray(options.known)) {
            options.known = [options.known];
          }
          if (options.known) {
            for (var i = 0, len = options.known.length; i < len; i++) {
              known[options.known[i]] = true;
            }
          }

          var o = {
            knownHelpers: known,
            knownHelpersOnly: options.knownOnly
          };

          if (options.map) {
            o.srcName = path.basename(input);
          }

          if (options.data) {
            o.data = true;
          }

          var template = input;

          if (!root) {
            template = path.basename(template);
          } else if (template.indexOf(root) === 0) {
            template = template.substring(root.length);
          }
          template = template.replace(extend, '');

          var source = new SourceNode();
          if (!options.simple) {
            if (options.amd) {
              source.add('define([\'' + options.handlebarPath + 'handlebars.runtime\'], function(Handlebars) {\n  Handlebars = Handlebars["default"];');
            } else if (options.commonjs) {
              source.add('var Handlebars = require("' + options.commonjs + '");');
            } else {
              source.add('(function() {\n');
            }
            source.add('  var template = Handlebars.template, templates = ');
            if (options.namespace) {
              source.add(options.namespace);
              source.add(' = ');
              source.add(options.namespace);
              source.add(' || ');
            }
            source.add('{};\n');
          }

          var precompiled = Handlebars.precompile(data, o);

          if (options.map) {
            var consumer = new SourceMapConsumer(precompiled.map);
            precompiled = SourceNode.fromStringWithSourceMap(precompiled.code, consumer);
          }

          if (options.simple) {
            source.add([precompiled, '\n']);
          } else if (partial) {
            if(options.amd) {
              source.add('return ');
            }
            source.add(['Handlebars.partials[\'', template, '\'] = template(', precompiled, ');\n']);
          } else {
            if(options.amd) {
              source.add('return ');
            }
            source.add(['templates[\'', template, '\'] = template(', precompiled, ');\n']);
          }

          if (!options.simple) {
            if (options.amd) {
              source.add('});');
            } else if (!options.commonjs) {
              source.add('})();');
            }
          }

          if (options.map) {
            source.add('\n//# sourceMappingURL=' + mapName + '\n');
          }

          source = source.toStringWithSourceMap();
          source.map = source.map + '';

          var filesWritten = [];

          if (options.map) {
            fs.writeFileSync(mapFile, source.map, 'utf8');
            filesWritten.push(mapFile);
          }
          source = source.code;

          fs.writeFileSync(output, source, 'utf8');
          filesWritten.push(output);

          results.push({
              source: input,
              result: {
                filesRead: [input],
                filesWritten: filesWritten
              }
          });

          parseDone();

        } catch (err) {

          problems.push({
              message: err.message,
              severity: 'error',
              source: input
          });

          results.push({
              source: input,
              result: null
          });

          parseDone();
        }
      });
    });

})();


/* global process, require */

(function () {
    
    "use strict";

    var args = process.argv,
        fs = require("fs"),
        mkdirp = require("mkdirp"),
        path = require("path"),
        Handlebars = require("handlebars");

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

          var source = [];
          if (!options.simple) {
            if (options.amd) {
              source.push('define([\'' + options.handlebarPath + 'handlebars.runtime\'], function(Handlebars) {\n  Handlebars = Handlebars["default"];');
            } else if (options.commonjs) {
              source.push('var Handlebars = require("' + options.commonjs + '");');
            } else {
              source.push('(function() {\n');
            }
            source.push('  var template = Handlebars.template, templates = ');
            source.push(options.namespace);
            source.push(' = ');
            source.push(options.namespace);
            source.push(' || {};\n');
          }

          if (options.simple) {
            source.push(Handlebars.precompile(data, o) + '\n');
          } else if (partial) {
            if(options.amd) {
              source.push('return ');
            }
            source.push('Handlebars.partials[\'' + template + '\'] = template(' + Handlebars.precompile(data, o) + ');\n');
          } else {
            if(options.amd) {
              source.push('return ');
            }
            source.push('templates[\'' + template + '\'] = template(' + Handlebars.precompile(data, o) + ');\n');
          }

          if (!options.simple) {
            if (options.amd) {
              source.push('});');
            } else if (!options.commonjs) {
              source.push('})();');
            }
          }
          source = source.join('');

          fs.writeFileSync(output, source, 'utf8');

          results.push({
              source: input,
              result: {
                filesRead: [input],
                filesWritten: [output]
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


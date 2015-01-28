/* global process, require */

(function () {
    
    "use strict";

    var args = process.argv,
        fs = require("fs"),
        mkdirp = require("mkdirp"),
        path = require("path"),
        precompiler = require("handlebars/lib/precompiler");

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

    sourceFileMappings.forEach(function (sourceFileMapping) {

      var input = sourceFileMapping[0];
      var extension = path.extname(input);
      var extre = new RegExp('\\' + extension + '$');
      var outputFile = sourceFileMapping[1].replace(extre, ".js");
      var output = path.join(target, outputFile);

      mkdirp(path.dirname(output), function (e) {
        throwIfErr(e);

        var opts = {
          output: output,
          amd: options.amd,
          commonjs: options.commonjs,
          handlebarPath: options.handlebarPath,
          known: options.known,
          o: options.knownOnly,
          min: options.min,
          namespace: options.namespace,
          simple: options.simple,
          root: options.root,
          partial: false,
          data: options.data,
          extension: extension.substr(1),
          bom: options.bom,
          templates: [input]
        };

        try {

          precompiler.cli(opts);

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


'use strict';

const { pipeline, output } = require('./metadata.json');

function _requirePlugin(name) {
  const mod = require(pipeline[name]);
  if (mod && typeof mod.default === 'function') {
    return mod.default;
  }
  return mod;
}

const modelDefineModule = _requirePlugin('modelDefine');

let dataProcessModule;
if (typeof pipeline.dataProcess === 'string') {
  dataProcessModule = _requirePlugin('dataProcess');
}

const dataset = JSON.parse(output.dataset);
const model = modelDefineModule(null, {
  recoverPath: __dirname + '/model',
  dataset
});

function predict(data) {
  const sample = { data, label: null };
  let future = model;

  if (typeof dataProcessModule === 'function') {
    future = future.then((m) => {
      dataProcessModule(sample, {}, JSON.parse(pipeline.dataProcessParams));
      return m
    });
  }
  return future.then((m) => {
    return m.predict(sample);
  });
};

module.exports = predict;

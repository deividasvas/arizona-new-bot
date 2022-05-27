const path = require('path');
const fs = require('fs');
const getAutoModerationConfig = require('./getAutoModerationConfig')

const pathToConfig = path.resolve('./configs/automoderation.json');

// Функция устанавливает параметры в конфиге автомодераций.
const setAutoModerationConfigParam = (param, value) => {
  const config = getAutoModerationConfig()
  if(param.startsWith('add-')){
    const newParamValue = [];
    newParamValue.push(value)
    return fs.writeFileSync(pathToConfig, JSON.stringify({
      ...config,
      [param.split('add-')[1]]: newParamValue,
    }));
  }
  if(param.startsWith('remove-')){
    const key = param.split('remove-')[1];
    const newParamValue = [...config[key]];
    return fs.writeFileSync(pathToConfig, JSON.stringify({
      ...config,
      [key]: newParamValue.filter(val => val !== value),
    }));
  }
  const newParamValue = `${(typeof config[param])[0].toUpperCase() + (typeof config[param]).slice(1)}(${value})`
  fs.writeFileSync(pathToConfig, JSON.stringify({
    ...config,
    [param]: eval(newParamValue),
  }));
}

module.exports = setAutoModerationConfigParam
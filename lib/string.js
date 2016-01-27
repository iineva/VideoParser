var URL = require('url');
var PATH = require('path');

module.exports.htmlDecode = function(str) {
  return str.replace(/&#(x)?([^&]{1,5});?/g, function($, $1, $2) {
    return String.fromCharCode(parseInt($2, $1 ? 16 : 10));
  });
}

/**
  跳转相对路径
*/
module.exports.goURL = function(url, path) {
  var urlObj = URL.parse(url);
  var gourlObj = URL.parse(path);
  var dir = PATH.dirname(urlObj.path);
  if (url.length >= 1 && url.substr(url.length-1, 1) === '/') { dir = urlObj.path; }
  if (path.length >= 1 && path.substr(0,1) === '/') {
    urlObj.pathname = path;
  } else {
    urlObj.pathname = PATH.join(dir, gourlObj.path);
  }
  return URL.format(urlObj);
}

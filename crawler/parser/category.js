// 解析电影天堂分类信息

// var URL = require('url');
var STR = require('../../lib/string.js');

module.exports = function(result, $) {
  // var urlObj = URL.parse(result.uri);
  var categoryItems = [];
  $("#header .contain #menu .contain ul li").each(function(index, element) {
    var a = $(element).find('a');
    var href = a.attr('href');
    if (href === 'index.html' || href === '#') {
      return;
    }
    categoryItems.push({
      title: STR.htmlDecode(a.html()),
      url: STR.goURL(result.uri, href)
    });
  });
  return categoryItems;
}

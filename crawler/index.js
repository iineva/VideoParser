// 同步解析器

var Crawler = require('crawler');

var c = new Crawler({
  maxConnections: 10,
  forceUTF8: true,
  // cache: true,
  userAgent:"Safari/601.5.8",
  // debug: true,
});

/**
  传入解析器，yield方式调用
  @param parser function(result, $)
  @return 返回解析结果
*/
module.exports = function(url, parser) {
  console.log("$...正在获取:", url);
  return function(done) {
    c.queue({
      uri: url,
      callback: function(error, result, $) {
        if (error !== null) {
          done(error, null);
        } else {
          console.log("$...正在解析...");
          done(error, parser(result, $));
        }
        console.log("$...完成解析!");
      }
    });
  };
};

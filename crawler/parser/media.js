// 解析媒体列表
var STR = require('../../lib/string.js');

// 解析页面连接列表的链接
module.exports.list = function(result, $) {
  var items = [];
  $("div.x td select option").each(function(index, element) {
    var value = $(element).attr('value');
    items.push(STR.goURL(result.uri, value));
  });
  return items;
}

// 解析媒体详情的链接
module.exports.medias = function(result, $) {
  var items = [];
  $("b a.ulink").each(function(index, element) {
    var href = $(element).attr('href');
    items.push(STR.goURL(result.uri, href));
  });
  return items;
}

// 解析媒体详情
module.exports.media = function(result, $) {
  var info = {};

  // 解析顶级标题
  $("div.title_all h1 font").each(function(index, element) {
    info.top_title = STR.htmlDecode($(element).html());
  });
  // 解析详情
  $("div.co_content8 ul").each(function(index, element) {

    // 解析发布时间
    var html = STR.htmlDecode($(element).html());
    var c = "";
    var date = "";
    var start = false;
    for (var i=0; i < html.length; i++) {
      c = html.charAt(i);
      if ( !start && c=='：' ) { start = true; continue;}
      if ( !start ) { continue; }
      if ( c=='\n' || c=='\t' || c=='\r' || c==' ' ) { break; }
      date += c;
    }
    if (date.length > 0) { info.date = date; }

    // 解析详情 ◎
    var get = false; // 已开始解析元素
    var text = [];   // 元素容器
    var t = "";      // 当前元素
    var last = [];   // 已解析
    for (var i=0; i < html.length; i++) {
      c = html.charAt(i);
      last.push(c);
      if ( !get && c == '◎') { get = true; continue; }
      if ( !get ) { continue; }
      if (c == '◎' || (last[last.length-4]=='<' && last[last.length-3]=='i' && last[last.length-2]=='m' && last[last.length-1]=='g') ) {
        // 遇到 '◎' 或者 '<imag' 就结束当前元素解析
        text.push(t); t = "";
        // if (c == '◎') { text.push(t); t = ""; }
        continue;
      }
      t += c;
    }
    // 详情信息已经分段，开始处理
    info.info = [];
    for (var i in text) {
      // EX: ◎译　　名  企鹅小守护
      var arr = text[i].replace(/(<br>|br>|<im)/g, "\n").split('\n');
      var obj = null;
      for (var j in arr) {
        var s = arr[j];
        if (s.length == 0) { continue; }
        if (j == 0) {
          // 信息类型
          s = s.replace(/\s{2,}/g, "").replace(/(\s){1}/, "\n").split('\n');
          if (s.length > 0 && s[0].length  > 0) {
            obj = {
              title: s[0],
              info: [],
            };
            info.info.push(obj);
            if (s.length > 1 && s[1].length > 1) { obj.info.push(s[1]); }
          }
        } else {
          // 信息内容
          if (obj) {
            s = s.replace(/\s{2,}/g, "").replace(/\s{1}$/, "");
            if (s.length > 1) { obj.info.push(s); }
          }
        }
      }
    }

    // 解析图片
    info.images = [];
    $(element).find("img").each(function(i, e) {
      info.images.push(e.attribs.src);
    });

    // 解析下载链接
    info.source = [];
    $(element).find("tbody tr td a").each(function(i, e){
      info.source.push(e.attribs.href);
    });

  });
  return info;
}

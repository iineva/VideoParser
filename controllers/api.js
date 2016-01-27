var apiData = require('../api-data');


module.exports.category = function* () {
  var items = [];
  (yield apiData.category).forEach(function(i){
    if (i.list != null && i.list.length > 0) {
      // 过滤空的分类
      items.push({
        _id: i._id,
        title: i.title,
      });
    }
  });
  this.body = items;
}

module.exports.medias = function* (id) {
  var items = [];
  var obj;
  (yield apiData.medias(this.query.type_id, this.query.page, this.query.pageSize)).forEach(function(i){
    obj = {
      _id: i._id,
      title: i.top_title,
      date: i.date,
    };
    // TODO 压缩图片
    if (i.images && i.images.length > 0) { obj.thumb = i.images[0]; }
    items.push(obj)
  });
  this.body = items;
}

module.exports.media = function* (id) {
  var data = yield apiData.media(this.query.id);

  // TODO 压缩缩略图图片
  var thumb = null;
  if (data.images && data.images.length > 0) { thumb = data.images[0]; }

  var obj = {
    _id: data._id,
    title: data.top_title,
    info: data.info,
    thumb: thumb,
    images: data.images,
    date: data.date,
    source: data.source,
    type: data.type,
  };

  this.body = obj;
}

module.exports.search = function* () {
  var data = yield apiData.search(this.query.q, this.query.page, this.query.pageSize);
  this.body = data;
}

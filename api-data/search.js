// 获取指定分类下媒体列表

module.exports = function* (search, page, pageSize) {

  // 参数处理
  var db = App.mongo.media;

  if (!search) { return []; }

  page = page || 1;
  pageSize = pageSize || 100;
  var fliter = new RegExp(search);

  return yield db.find({
      "$or": [
        {top_title: fliter},
        {info: {"$elemMatch": {title: fliter}}},
        {info: {"$elemMatch": {info: fliter}}},
        {source: fliter },
      ]
    })
    .limit(pageSize)
    .skip( (pageSize * (page - 1)) )
    .sort( {date: -1} )
    .get();
};

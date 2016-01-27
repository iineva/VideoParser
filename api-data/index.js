// API数据中心，负责读取和缓存数据

// 获取分类信息数据
module.exports.category = require('./category');

// 获取指定分类下媒体列表
module.exports.medias = require('./medias');

// 获取媒体详情
module.exports.media = require('./media');

// 搜索媒体
module.exports.search = require('./search');

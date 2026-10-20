const { backOrHome } = require('../../utils/navigation');
Page({
  back() { backOrHome(); },
  onShareAppMessage() { return { title: '奶蛙电子科技大学发布校徽', path: '/pages/emblem/index', imageUrl: '/assets/logo.png' }; },
  onShareTimeline() { return { title: '奶蛙电子科技大学发布校徽', imageUrl: '/assets/logo.png' }; }
});

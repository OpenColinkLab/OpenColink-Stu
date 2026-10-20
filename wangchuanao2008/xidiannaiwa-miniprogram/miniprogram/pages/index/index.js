Page({
  data: { banners: [ { src: '/assets/birthday.jpg', title: '奶蛙电子科技大学95岁生日快乐' }, { src: '/assets/welcome.jpg', title: '欢迎蛙友们回家' } ] },
  openEmblem() { wx.navigateTo({ url: '/pages/emblem/index' }); },
  openMuseum() { wx.navigateTo({ url: '/pages/museum/index' }); },
  onShareAppMessage() { return { title: '奶蛙电子科技大学 · 欢迎蛙友们回家', path: '/pages/index/index', imageUrl: '/assets/welcome.jpg' }; },
  onShareTimeline() { return { title: '奶蛙电子科技大学', imageUrl: '/assets/welcome.jpg' }; }
});

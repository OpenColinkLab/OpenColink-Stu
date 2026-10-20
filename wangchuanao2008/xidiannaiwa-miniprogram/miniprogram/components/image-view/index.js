Component({
  properties: {
    src: { type: String, value: '', observer() { this.setData({ failed: false }); } },
    alt: { type: String, value: '' },
    mode: { type: String, value: 'aspectFit' },
    lazy: { type: Boolean, value: true }
  },
  data: { failed: false },
  methods: {
    onError() { this.setData({ failed: true }); this.triggerEvent('imageerror'); },
    retry() { const src = this.properties.src; this.setData({ failed: false, retrying: true }, () => this.setData({ retrying: false })); if (!src) this.setData({ failed: true }); }
  }
});

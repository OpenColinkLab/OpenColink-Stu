// Only reshape the official login page. NetEase still creates its own QR code,
// handles safety verification, and sets its session cookies.
(() => {
    function adapt(doc) {
        if (doc.getElementById('musicdown-login-layout')) return;
        const style = doc.createElement('style');
        style.id = 'musicdown-login-layout';
        style.textContent = `
            html, body { min-width: 0 !important; width: 100% !important; margin: 0 !important; }
            #g_top, #g_nav, .g-ft, .m-back, .m-playbar { display: none !important; }
            #g_iframe { position: static !important; width: 100% !important; height: 100vh !important; }
            #login-wrapper { min-width: 0 !important; width: 100% !important; box-sizing: border-box;
                margin: 0 !important; padding: 20px 12px !important; border: 0 !important; }
            #login-wrapper > h1 { font-size: 18px !important; text-align: center; }
        `;
        doc.head.appendChild(style);
        let viewport = doc.querySelector('meta[name="viewport"]');
        if (!viewport) { viewport = doc.createElement('meta'); viewport.name = 'viewport'; doc.head.appendChild(viewport); }
        viewport.content = 'width=device-width, initial-scale=1';
        const wrapper = doc.getElementById('login-wrapper');
        if (wrapper) {
            const fit = () => {
                for (const card of wrapper.children) {
                    if (card.tagName === 'H1') continue;
                    card.style.zoom = '';
                    const width = Math.max(card.scrollWidth, card.offsetWidth);
                    if (width > wrapper.clientWidth - 24) {
                        card.style.zoom = String((wrapper.clientWidth - 24) / width);
                    }
                }
            };
            new MutationObserver(fit).observe(wrapper, { childList: true, subtree: true });
            doc.defaultView.addEventListener('resize', fit);
            fit();
        }
        const frame = doc.getElementById('g_iframe');
        if (frame) {
            const child = () => {
                try {
                    if (frame.contentDocument?.location.pathname === '/login') adapt(frame.contentDocument);
                } catch (_) { /* Cross-origin safety verification keeps its original layout. */ }
            };
            frame.addEventListener('load', child);
            child();
        }
    }
    adapt(document);
})();

/**
 * Loads shared layout components (header and footer) into each page.
 * Requires a local web server — fetch will fail on file:// URLs.
 */
(function () {
    'use strict';

    const COMPONENTS = {
        header: 'components/site-header.html',
        footer: 'components/site-footer.html',
    };

    function initMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    function showLoadError(targetId, url) {
        const target = document.getElementById(targetId);
        if (!target) return;

        target.innerHTML = `
            <div style="padding:1rem 1.5rem;background:rgba(255,0,0,0.1);border:1px solid rgba(255,255,255,0.3);color:#fff;font-family:sans-serif;font-size:0.875rem;">
                Failed to load <strong>${url}</strong>. Run the site with a local server (see README.md).
            </div>
        `;
    }

    async function injectComponent(url, targetId) {
        const target = document.getElementById(targetId);
        if (!target) return false;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            target.innerHTML = await response.text();
            return true;
        } catch (error) {
            console.error(`Layout error: could not load ${url}`, error);
            showLoadError(targetId, url);
            return false;
        }
    }

    async function loadLayout() {
        await Promise.all([
            injectComponent(COMPONENTS.header, 'site-header'),
            injectComponent(COMPONENTS.footer, 'site-footer'),
        ]);
        initMobileMenu();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadLayout);
    } else {
        loadLayout();
    }
})();

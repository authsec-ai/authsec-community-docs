import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
    // Apply global scroll blur effect on client-side only
    const applyScrollBlur = () => {
        // Get all markdown content elements
        const selectors = [
            '.markdown > h1',
            '.markdown > h2',
            '.markdown > h3',
            '.markdown > h4',
            '.markdown > p',
            '.markdown > ul',
            '.markdown > ol',
            '.markdown > pre',
            '.markdown > table',
            '.markdown > .admonition',
            '.theme-code-block',
            '.card',
            '.linkCard'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));

        elements.forEach((element) => {
            // Skip if already processed
            if (element.dataset.scrollBlur) return;
            element.dataset.scrollBlur = 'true';

            // Create intersection observer for each element
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const ratio = entry.intersectionRatio;
                        const element = entry.target;

                        // Calculate blur based on intersection ratio
                        // Center of viewport = 0 blur, edges = max blur
                        let blur = 0;
                        let opacity = 1;
                        let scale = 1;
                        let y = 0;

                        if (ratio < 0.3) {
                            // Element is at edge of viewport - blur it
                            blur = Math.min((0.3 - ratio) * 25, 10); // Max 10px blur
                            opacity = Math.max(0.4 + (ratio / 0.3) * 0.6, 0.4); // Min 0.4 opacity
                            scale = 0.97 + (ratio / 0.3) * 0.03; // Scale from 0.97 to 1
                            y = (0.3 - ratio) * 30; // Slight vertical offset
                        } else if (ratio >= 0.3) {
                            // Element is in viewport - sharp and clear
                            blur = 0;
                            opacity = 1;
                            scale = 1;
                            y = 0;
                        }

                        // Apply smooth transition with cubic-bezier easing
                        element.style.transition =
                            'filter 0.8s cubic-bezier(0.4, 0, 0.2, 1), ' +
                            'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), ' +
                            'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

                        element.style.filter = `blur(${blur}px)`;
                        element.style.opacity = opacity;
                        element.style.transform = `translateY(${y}px) scale(${scale})`;
                        element.style.willChange = 'filter, opacity, transform';
                    });
                },
                {
                    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                    rootMargin: '-10% 0px -10% 0px' // Trigger blur earlier for smoother effect
                }
            );

            observer.observe(element);
        });
    };

    // Initial application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyScrollBlur);
    } else {
        applyScrollBlur();
    }

    // Re-apply when route changes (for SPA navigation)
    let lastPath = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            setTimeout(applyScrollBlur, 100);
        }
    }, 500);

    // Also apply on any DOM mutations (for dynamic content)
    const mutationObserver = new MutationObserver(() => {
        applyScrollBlur();
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

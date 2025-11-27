// Initialize language switcher when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const langSwitcher = document.getElementById('language-switcher');
    
    if (langSwitcher && typeof SlimSelect !== 'undefined') {
        try {
            const langSelect = new SlimSelect({
                select: '#language-switcher',
                settings: {
                    showSearch: false,
                    closeOnSelect: true,
                },
                events: {
                    afterChange: (newVal) => {
                        if (newVal && newVal.length > 0) {
                            const currentPath = window.location.pathname;
                            const pathParts = currentPath.split('/').filter(p => p);
                            
                            // Remove old language prefix if exists
                            if (pathParts.length > 0 && ['en', 'es', 'se'].includes(pathParts[0])) {
                                pathParts.shift();
                            }
                            
                            // Build new path with selected language
                            const newPath = '/' + newVal[0].value + (pathParts.length > 0 ? '/' + pathParts.join('/') : '');
                            window.location.href = newPath;
                        }
                    }
                }
            });
            console.log('Language switcher initialized successfully');
        } catch (error) {
            console.error('Error initializing SlimSelect:', error);
        }
    } else {
        if (!langSwitcher) {
            console.error('language-switcher element not found');
        }
        if (typeof SlimSelect === 'undefined') {
            console.error('SlimSelect library not loaded');
        }
    }
});

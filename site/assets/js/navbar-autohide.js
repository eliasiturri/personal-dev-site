// Auto-hide navbar on scroll down, show on scroll up (all devices)
(function() {
    let lastScrollTop = 0;
    let isHidden = false;
    const navbar = document.querySelector('.header-wrapper');
    
    if (!navbar) return;

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Scrolling down
        if (scrollTop > lastScrollTop && scrollTop > 80) {
            if (!isHidden) {
                navbar.classList.add('navbar-hidden');
                isHidden = true;
            }
        } 
        // Scrolling up
        else if (scrollTop < lastScrollTop) {
            if (isHidden) {
                navbar.classList.remove('navbar-hidden');
                isHidden = false;
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }

    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(handleScroll);
    });
})();

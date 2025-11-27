// Smooth scroll for blog post table of contents links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (typeof lenis !== 'undefined' && lenis) {
                lenis.scrollTo(target);
            } else {
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
});

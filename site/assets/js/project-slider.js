document.addEventListener('DOMContentLoaded', function() {
    const glider = new Glider(document.querySelector('.glider'), {
        slidesToShow: 1,
        slidesToScroll: 1,
        draggable: true,
        dots: '.glider-dots',
        arrows: {
            prev: '.glider-prev',
            next: '.glider-next'
        },
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            }
        ]
    });

    // Add click handlers to project cards for smooth scrolling
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
            const projectIndex = this.dataset.projectIndex;
            const targetElement = document.getElementById(`project-${projectIndex}`);
            
            if (targetElement && window.lenis) {
                window.lenis.scrollTo(targetElement, {
                    offset: 0,
                    duration: 1.2
                });
            }
        });
    });
});

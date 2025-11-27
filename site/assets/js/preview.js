document.addEventListener('DOMContentLoaded', function() {
    // Create preview overlay
    const overlay = document.createElement('div');
    overlay.className = 'preview-overlay';
    document.body.appendChild(overlay);

    // Add click handlers to preview icons
    document.querySelectorAll('.preview-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            const previewImagesData = this.dataset.previewImages;
            const previewDescriptionsData = this.dataset.previewDescriptions;
            
            if (previewImagesData) {
                try {
                    const imageUrls = JSON.parse(previewImagesData);
                    const descriptions = previewDescriptionsData ? JSON.parse(previewDescriptionsData) : [];
                    showPreview(Array.isArray(imageUrls) ? imageUrls : [imageUrls], descriptions);
                } catch (error) {
                    console.error('Error parsing preview data:', error);
                }
            }
        });
    });

    function showPreview(imageUrls, descriptions = []) {
        // Clear any existing content
        overlay.innerHTML = '';

        // Create preview items for each URL
        imageUrls.forEach((imageUrl, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            previewItem.appendChild(img);
            
            // Add description if available
            if (descriptions[index]) {
                const description = document.createElement('div');
                description.className = 'preview-description';
                description.textContent = descriptions[index];
                previewItem.appendChild(description);
            }
            
            overlay.appendChild(previewItem);
        });

        // Show overlay
        overlay.classList.add('active');
    }

    function hidePreview() {
        overlay.classList.remove('active');
    }

    // Hide on click on overlay
    overlay.addEventListener('click', hidePreview);
});

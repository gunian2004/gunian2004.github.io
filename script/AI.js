document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.ai-section');
    
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        
        header.addEventListener('click', function() {
            const isActive = section.classList.contains('active');
            
            sections.forEach(s => {
                s.classList.remove('active');
            });
            
            if (!isActive) {
                section.classList.add('active');
            }
        });
    });
    
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 800);
    }
});

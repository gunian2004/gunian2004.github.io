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

function toggleCard(card) {
    card.classList.toggle('expanded');
    const toggleText = card.querySelector('.card-toggle');
    if (card.classList.contains('expanded')) {
        toggleText.textContent = '▲ 收起';
    } else {
        toggleText.textContent = '...（点击展开）';
    }
}

function copyRuleContent(event, button) {
    event.stopPropagation();
    
    const card = button.closest('.prompt-card');
    const cardHeader = card.querySelector('.card-header').innerText;
    const cardContent = card.querySelector('.card-content').innerText;
    const fullText = cardHeader + '\n\n' + cardContent;
    
    navigator.clipboard.writeText(fullText).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ 已复制';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败: ', err);
        alert('复制失败，请手动复制');
    });
}

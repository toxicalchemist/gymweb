// Packages JavaScript

let selectedPackage = null;

document.addEventListener('DOMContentLoaded', function() {
    // Package filter buttons
    const filterButtons = document.querySelectorAll('.package-filter');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-red-500', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            // Add active class to clicked button
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('active', 'bg-red-500', 'text-white');
            
            // Filter packages
            const filter = this.getAttribute('data-filter');
            filterPackages(filter);
        });
    });
    
    // Load selected package from localStorage if available
    const savedPackage = getFromLocalStorage('selectedPackage');
    if (savedPackage) {
        selectedPackage = savedPackage;
    }
});

// Filter packages by category
function filterPackages(category) {
    const packageCards = document.querySelectorAll('.package-card');
    
    packageCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            // Add fade-in animation
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s';
                card.style.opacity = '1';
            }, 10);
        } else {
            card.style.display = 'none';
        }
    });
}

// Select package and redirect to payment
function selectPackage(name, price) {
    selectedPackage = {
        name: name,
        price: price,
        selectedDate: new Date().toISOString()
    };
    
    // Save to localStorage
    saveToLocalStorage('selectedPackage', selectedPackage);
    
    // Show notification
    showNotification(`${name} package selected! Redirecting to payment...`, 'success');
    
    // Redirect to payment page
    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 1500);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Local storage helpers
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        return false;
    }
}

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}
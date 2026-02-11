// Instructors JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.instructor-filter');
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
            
            // Filter instructors
            const filter = this.getAttribute('data-filter');
            filterInstructors(filter);
        });
    });
    
    // Setup booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
    
    // Set minimum date to today
    const dateInput = document.getElementById('sessionDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
});

// Filter instructors by specialty
function filterInstructors(specialty) {
    const instructorCards = document.querySelectorAll('.instructor-card');
    
    instructorCards.forEach(card => {
        const cardSpecialty = card.getAttribute('data-specialty');
        
        if (specialty === 'all' || cardSpecialty === specialty) {
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

// Book instructor session
function bookInstructor(instructorName) {
    document.getElementById('instructorName').value = instructorName;
    document.getElementById('bookingModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close booking modal
function closeBookingModal() {
    document.getElementById('bookingModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('bookingForm').reset();
}

// Handle booking submission
function handleBooking(e) {
    e.preventDefault();
    
    const instructor = document.getElementById('instructorName').value;
    const date = document.getElementById('sessionDate').value;
    const time = document.getElementById('sessionTime').value;
    const sessionType = document.getElementById('sessionType').value;
    const notes = document.getElementById('sessionNotes').value;
    
    // Validation
    if (!date || !time || !sessionType) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Create booking object
    const booking = {
        instructor: instructor,
        date: date,
        time: time,
        sessionType: sessionType,
        notes: notes,
        bookingDate: new Date().toISOString()
    };
    
    // Save booking (in real app, this would be an API call)
    let bookings = getFromLocalStorage('fitzone_bookings') || [];
    bookings.push(booking);
    saveToLocalStorage('fitzone_bookings', bookings);
    
    // Show success message
    showNotification('Session booked successfully!', 'success');
    
    // Close modal
    closeBookingModal();
    
    // Optional: Send confirmation email (simulated)
    setTimeout(() => {
        showNotification('Confirmation email sent!', 'success');
    }, 2000);
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

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        closeBookingModal();
    }
});
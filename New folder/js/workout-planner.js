// Workout Planner JavaScript

let weeklySchedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
};

document.addEventListener('DOMContentLoaded', function() {
    // Load saved schedule
    loadSchedule();
    
    // Category filter buttons
    const categoryButtons = document.querySelectorAll('.workout-category');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-red-500', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('active', 'bg-red-500', 'text-white');
            
            const category = this.getAttribute('data-category');
            filterWorkouts(category);
        });
    });
    
    // Drag and drop setup
    setupDragAndDrop();
    
    // Clear schedule button
    document.getElementById('clearSchedule').addEventListener('click', clearSchedule);
    
    // Save schedule button
    document.getElementById('saveSchedule').addEventListener('click', saveSchedule);
});

// Filter workouts by category
function filterWorkouts(category) {
    const workoutCards = document.querySelectorAll('.workout-card');
    
    workoutCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    const workoutCards = document.querySelectorAll('.workout-card');
    const dropZones = document.querySelectorAll('.workout-drop-zone');
    
    // Make workout cards draggable
    workoutCards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    // Setup drop zones
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'copy';
    const workoutName = this.querySelector('h4').textContent;
    const workoutDuration = this.querySelector('p').textContent;
    const workoutColor = window.getComputedStyle(this.querySelector('div')).background;
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
        name: workoutName,
        duration: workoutDuration,
        color: workoutColor
    }));
}

function handleDragEnd(e) {
    // Optional: Add any cleanup
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const day = this.getAttribute('data-day');
    
    addWorkoutToDay(day, data);
    
    // Remove placeholder text if it exists
    const placeholder = this.querySelector('p.text-gray-400');
    if (placeholder) {
        placeholder.remove();
    }
}

function addWorkoutToDay(day, workout) {
    // Add to schedule object
    weeklySchedule[day].push(workout);
    
    // Create workout element
    const dropZone = document.querySelector(`[data-day="${day}"]`);
    const workoutElement = document.createElement('div');
    workoutElement.className = 'scheduled-workout';
    workoutElement.innerHTML = `
        <div class="font-semibold">${workout.name}</div>
        <div class="text-sm opacity-90">${workout.duration}</div>
        <button class="remove-btn" onclick="removeWorkout(this, '${day}')">
            <i class="fas fa-times text-xs"></i>
        </button>
    `;
    
    dropZone.appendChild(workoutElement);
}

function removeWorkout(button, day) {
    const workoutElement = button.closest('.scheduled-workout');
    const workoutName = workoutElement.querySelector('.font-semibold').textContent;
    
    // Remove from schedule object
    weeklySchedule[day] = weeklySchedule[day].filter(w => w.name !== workoutName);
    
    // Remove element
    workoutElement.remove();
    
    // Add placeholder if empty
    const dropZone = document.querySelector(`[data-day="${day}"]`);
    if (dropZone.children.length === 0) {
        dropZone.innerHTML = '<p class="text-gray-400 text-center text-sm">Drag workouts here</p>';
    }
    
    showNotification('Workout removed', 'success');
}

function clearSchedule() {
    if (confirm('Are you sure you want to clear your entire schedule?')) {
        weeklySchedule = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };
        
        // Clear all drop zones
        const dropZones = document.querySelectorAll('.workout-drop-zone');
        dropZones.forEach(zone => {
            zone.innerHTML = '<p class="text-gray-400 text-center text-sm">Drag workouts here</p>';
        });
        
        // Clear from localStorage
        localStorage.removeItem('weeklySchedule');
        
        showNotification('Schedule cleared', 'success');
    }
}

function saveSchedule() {
    try {
        localStorage.setItem('weeklySchedule', JSON.stringify(weeklySchedule));
        showNotification('Schedule saved successfully!', 'success');
    } catch (e) {
        showNotification('Error saving schedule', 'error');
    }
}

function loadSchedule() {
    try {
        const saved = localStorage.getItem('weeklySchedule');
        if (saved) {
            weeklySchedule = JSON.parse(saved);
            
            // Render saved schedule
            Object.keys(weeklySchedule).forEach(day => {
                const workouts = weeklySchedule[day];
                const dropZone = document.querySelector(`[data-day="${day}"]`);
                
                if (workouts.length > 0) {
                    // Remove placeholder
                    dropZone.innerHTML = '';
                    
                    // Add workouts
                    workouts.forEach(workout => {
                        const workoutElement = document.createElement('div');
                        workoutElement.className = 'scheduled-workout';
                        workoutElement.innerHTML = `
                            <div class="font-semibold">${workout.name}</div>
                            <div class="text-sm opacity-90">${workout.duration}</div>
                            <button class="remove-btn" onclick="removeWorkout(this, '${day}')">
                                <i class="fas fa-times text-xs"></i>
                            </button>
                        `;
                        dropZone.appendChild(workoutElement);
                    });
                }
            });
        }
    } catch (e) {
        console.error('Error loading schedule:', e);
    }
}

function loadTemplate(level) {
    clearSchedule();
    
    const templates = {
        beginner: {
            monday: [{ name: 'Chest Day', duration: '45 min • Strength' }],
            wednesday: [{ name: 'Leg Day', duration: '45 min • Strength' }],
            friday: [{ name: 'Back & Shoulders', duration: '45 min • Strength' }],
            sunday: [{ name: 'Rest Day', duration: 'Recovery' }]
        },
        intermediate: {
            monday: [{ name: 'Chest Day', duration: '60 min • Strength' }],
            tuesday: [{ name: 'Running', duration: '30 min • Cardio' }],
            wednesday: [{ name: 'Leg Day', duration: '75 min • Strength' }],
            thursday: [{ name: 'HIIT Training', duration: '30 min • Cardio' }],
            friday: [{ name: 'Back & Shoulders', duration: '60 min • Strength' }],
            sunday: [{ name: 'Rest Day', duration: 'Recovery' }]
        },
        advanced: {
            monday: [{ name: 'Chest Day', duration: '60 min • Strength' }],
            tuesday: [{ name: 'Leg Day', duration: '75 min • Strength' }],
            wednesday: [{ name: 'HIIT Training', duration: '30 min • Cardio' }],
            thursday: [{ name: 'Back & Shoulders', duration: '60 min • Strength' }],
            friday: [{ name: 'Arms & Abs', duration: '45 min • Strength' }],
            saturday: [{ name: 'Running', duration: '30 min • Cardio' }],
            sunday: [{ name: 'Yoga', duration: '60 min • Flexibility' }]
        }
    };
    
    const template = templates[level];
    weeklySchedule = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] };
    
    Object.keys(template).forEach(day => {
        template[day].forEach(workout => {
            addWorkoutToDay(day, workout);
        });
    });
    
    showNotification(`${level.charAt(0).toUpperCase() + level.slice(1)} template loaded!`, 'success');
}

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
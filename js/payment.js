// Payment JavaScript

let selectedPackageData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load selected package
    loadSelectedPackage();
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Expiry date formatting
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', formatExpiryDate);
    }
    
    // CVV input - numbers only
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
        });
    }
    
    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Submit payment
    const submitButton = document.getElementById('submitPayment');
    if (submitButton) {
        submitButton.addEventListener('click', handlePayment);
    }
});

// Load selected package from localStorage
function loadSelectedPackage() {
    const savedPackage = getFromLocalStorage('selectedPackage');
    
    if (savedPackage) {
        selectedPackageData = savedPackage;
        
        // Update UI
        document.getElementById('packageName').textContent = savedPackage.name;
        document.getElementById('packagePrice').textContent = `₱${savedPackage.price.toLocaleString()}`;
        
        // Calculate totals with 12% tax (Philippines VAT)
        const subtotal = savedPackage.price;
        const tax = (subtotal * 0.12).toFixed(2);
        const total = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);
        
        document.getElementById('subtotal').textContent = `₱${parseFloat(subtotal).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('tax').textContent = `₱${parseFloat(tax).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('total').textContent = `₱${parseFloat(total).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    } else {
        // Default package
        document.getElementById('packageName').textContent = 'Standard Plan';
        document.getElementById('packagePrice').textContent = '₱2,499/mo';
        document.getElementById('subtotal').textContent = '₱2,499.00';
        document.getElementById('tax').textContent = '₱299.88';
        document.getElementById('total').textContent = '₱2,798.88';
    }
}

// Format card number with spaces
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

// Format expiry date MM/YY
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    e.target.value = value;
}

// Handle payment method change
function handlePaymentMethodChange(e) {
    const cardDetails = document.getElementById('cardDetails');
    
    if (e.target.value === 'card') {
        cardDetails.style.display = 'block';
    } else {
        cardDetails.style.display = 'none';
    }
}

// Toggle promo code input
function togglePromoCode() {
    const promoCodeInput = document.getElementById('promoCodeInput');
    promoCodeInput.classList.toggle('hidden');
}

// Apply promo code
function applyPromoCode() {
    const promoCode = document.getElementById('promoCode').value.trim().toUpperCase();
    
    const validCodes = {
        'WELCOME10': 0.10,
        'FITNESS20': 0.20,
        'GYM2026': 0.15
    };
    
    if (validCodes[promoCode]) {
        const discount = validCodes[promoCode];
        const currentSubtotal = parseFloat(document.getElementById('subtotal').textContent.replace('₱', '').replace(/,/g, ''));
        const discountAmount = (currentSubtotal * discount).toFixed(2);
        const newSubtotal = (currentSubtotal - discountAmount).toFixed(2);
        const tax = (newSubtotal * 0.12).toFixed(2);
        const total = (parseFloat(newSubtotal) + parseFloat(tax)).toFixed(2);
        
        document.getElementById('subtotal').textContent = `₱${parseFloat(newSubtotal).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('tax').textContent = `₱${parseFloat(tax).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('total').textContent = `₱${parseFloat(total).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        showNotification(`Promo code applied! You saved ₱${parseFloat(discountAmount).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'success');
    } else {
        showNotification('Invalid promo code', 'error');
    }
}

// Handle payment submission
function handlePayment() {
    // Validate contact info
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName || !email || !phone) {
        showNotification('Please fill in all contact information', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardName = document.getElementById('cardName').value.trim();
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!cardNumber || cardNumber.length < 15 || !cardName || !expiryDate || !cvv) {
            showNotification('Please fill in all card details', 'error');
            return;
        }
        
        if (cvv.length < 3) {
            showNotification('Please enter a valid CVV', 'error');
            return;
        }
    }
    
    // Validate billing address
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    
    if (!address || !city || !state || !zipCode) {
        showNotification('Please fill in billing address', 'error');
        return;
    }
    
    // Check terms
    const terms = document.getElementById('terms').checked;
    if (!terms) {
        showNotification('Please agree to the terms and conditions', 'error');
        return;
    }
    
    // Process payment (simulated)
    processPayment(email);
}

// Process payment
function processPayment(email) {
    // Show loading state
    const submitButton = document.getElementById('submitPayment');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    
    // Simulate payment processing
    setTimeout(() => {
        // Create payment record
        const payment = {
            package: selectedPackageData,
            email: email,
            date: new Date().toISOString(),
            status: 'completed',
            total: document.getElementById('total').textContent
        };
        
        // Save to localStorage
        let payments = getFromLocalStorage('primeopus_payments') || [];
        payments.push(payment);
        saveToLocalStorage('primeopus_payments', payment);
        
        // Show success modal
        document.getElementById('confirmEmail').textContent = email;
        document.getElementById('successModal').classList.remove('hidden');
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
        
        // Clear selected package
        localStorage.removeItem('selectedPackage');
    }, 2000);
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
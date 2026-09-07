// ==================== Car Data ==================== 
const cars = [
    {
        id: 1,
        name: 'Économique',
        category: 'economique',
        icon: '🚗',
        features: ['Carburant économique', 'Climatisation', 'Assurance incluse'],
        pricePerDay: 250,
        description: 'Parfait pour les trajets courts'
    },
    {
        id: 2,
        name: 'Citadine',
        category: 'economique',
        icon: '🚙',
        features: ['Facile à garer', 'Climatisation', 'Moderne'],
        pricePerDay: 300,
        description: 'Idéale pour la ville'
    },
    {
        id: 3,
        name: 'Confort',
        category: 'confort',
        icon: '🚕',
        features: ['Espace intérieur', 'Climatisation auto', 'Système audio'],
        pricePerDay: 450,
        description: 'Pour voyages plus longs'
    },
    {
        id: 4,
        name: 'SUV',
        category: 'confort',
        icon: '🚗',
        features: ['Traction renforcée', 'Tout-terrain', 'Sièges confortables'],
        pricePerDay: 550,
        description: 'Aventure et confort'
    },
    {
        id: 5,
        name: 'Premium',
        category: 'premium',
        icon: '🏎️',
        features: ['Cuir premium', 'Sièges chauffants', 'Toit panoramique', 'GPS avancé'],
        pricePerDay: 800,
        description: 'Luxe et performance'
    },
    {
        id: 6,
        name: 'Monospace',
        category: 'premium',
        icon: '🚌',
        features: ['7 places', 'Coffre spacieux', 'Climatisation', 'Vitres teintées'],
        pricePerDay: 700,
        description: 'Pour les familles'
    }
];

// ==================== Initialize Cars Gallery ==================== 
document.addEventListener('DOMContentLoaded', function() {
    loadCars();
    setupFormValidation();
    setupReservationHandler();
});

function loadCars() {
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = '';

    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <div class="car-image">${car.icon}</div>
            <div class="car-info">
                <h3>${car.name}</h3>
                <p><strong>${car.description}</strong></p>
                <ul style="margin: 10px 0; font-size: 12px; color: #666;">
                    ${car.features.map(f => `<li>✓ ${f}</li>`).join('')}
                </ul>
                <div class="car-price">${car.pricePerDay} DH/jour</div>
            </div>
        `;
        carsGrid.appendChild(carCard);
    });
}

// ==================== Form Validation ==================== 
function setupFormValidation() {
    const form = document.getElementById('reservationForm');
    
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                validateField(this);
            });
        });
    }
}

function validateField(field) {
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'Ce champ est obligatoire';
    }

    // Email validation
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Email invalide';
        }
    }

    // Phone validation (Moroccan format)
    if (field.type === 'tel' && field.value) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(field.value.replace(/\D/g, ''))) {
            isValid = false;
            errorMessage = 'Téléphone invalide (10 chiffres)';
        }
    }

    // Date validation
    if (field.type === 'date' && field.id === 'checkOut') {
        const checkIn = document.getElementById('checkIn').value;
        if (checkIn && field.value && new Date(field.value) <= new Date(checkIn)) {
            isValid = false;
            errorMessage = 'La date de retour doit être après la date de départ';
        }
    }

    // Update field styling
    if (!isValid) {
        field.style.borderColor = '#D32F2F';
        field.style.boxShadow = '0 0 0 3px rgba(211, 47, 47, 0.1)';
        
        // Show error message
        let errorDiv = field.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-message')) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
        errorDiv.textContent = errorMessage;
        errorDiv.style.color = '#D32F2F';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
    } else {
        field.style.borderColor = '#EEEEEE';
        field.style.boxShadow = 'none';
        
        // Remove error message
        let errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('error-message')) {
            errorDiv.remove();
        }
    }

    return isValid;
}

// ==================== Form Submission Handler ==================== 
function setupReservationHandler() {
    const form = document.getElementById('reservationForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all fields
            const inputs = form.querySelectorAll('input, select, textarea');
            let allValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    allValid = false;
                }
            });

            if (allValid) {
                submitReservation();
            }
        });
    }
}

function submitReservation() {
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        checkIn: document.getElementById('checkIn').value,
        checkOut: document.getElementById('checkOut').value,
        carType: document.getElementById('carType').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toISOString()
    };

    // Calculate rental days
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const rentalDays = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Find car price
    const car = cars.find(c => c.category === formData.carType);
    const totalPrice = car ? car.pricePerDay * rentalDays : 0;

    // Create success message
    const successHTML = `
        <div style="background: #E8F5E9; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2E7D32; margin-bottom: 10px;">✓ Réservation Confirmée!</h3>
            <p><strong>Récapitulatif:</strong></p>
            <ul style="margin: 10px 0; color: #333;">
                <li><strong>Nom:</strong> ${formData.name}</li>
                <li><strong>Email:</strong> ${formData.email}</li>
                <li><strong>Téléphone:</strong> ${formData.phone}</li>
                <li><strong>Départ:</strong> ${new Date(formData.checkIn).toLocaleDateString('fr-FR')}</li>
                <li><strong>Retour:</strong> ${new Date(formData.checkOut).toLocaleDateString('fr-FR')}</li>
                <li><strong>Durée:</strong> ${rentalDays} jour(s)</li>
                <li><strong>Véhicule:</strong> ${car.name}</li>
                <li><strong>Tarif/jour:</strong> ${car.pricePerDay} DH</li>
                <li><strong style="color: #D32F2F;">Prix Total: ${totalPrice} DH</strong></li>
            </ul>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">
                Un agent vous contactera sous peu pour confirmer votre réservation.
            </p>
        </div>
    `;

    // Insert success message
    const form = document.getElementById('reservationForm');
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = successHTML;
    form.parentNode.insertBefore(messageDiv, form);

    // Log data (in production, would send to backend)
    console.log('Reservation Data:', formData);
    console.log('Total Price:', totalPrice);

    // Reset form
    form.reset();

    // Scroll to success message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Remove success message after 8 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 8000);
}

// ==================== Smooth Navigation ==================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== Add to Cart / Reservation Quick Add ==================== 
function addToReservation(carId) {
    const car = cars.find(c => c.id === carId);
    if (car) {
        document.getElementById('carType').value = car.category;
        document.querySelector('#reservation').scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== Mobile Menu Toggle (if needed) ==================== 
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}

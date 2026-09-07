const cars = [
    { name: 'Renault Clio', price: '250 درهم/يوم', img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80', type: 'اقتصادية' },
    { name: 'Dacia Logan', price: '300 درهم/يوم', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80', type: 'اقتصادية' },
    { name: 'Audi A4', price: '800 درهم/يوم', img: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=600&q=80', type: 'فاخرة' },
    { name: 'Mercedes C-Class', price: '900 درهم/يوم', img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80', type: 'فاخرة' },
    { name: 'Hyundai Tucson', price: '500 درهم/يوم', img: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80', type: 'عائلية' },
    { name: 'Peugeot 3008', price: '550 درهم/يوم', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80', type: 'عائلية' }
];

function renderCars() {
    const grid = document.getElementById('cars-grid');
    grid.innerHTML = cars.map(car => `
        <div class="car-card">
            <div class="car-image">
                <img src="${car.img}" alt="${car.name}" loading="lazy">
            </div>
            <div class="car-info">
                <div class="car-header">
                    <h3>${car.name}</h3>
                    <span class="car-tag">${car.type}</span>
                </div>
                <div class="car-price">${car.price}</div>
                <button onclick="openReserve('${car.name} - ${car.type}')" class="btn-secondary">احجز الآن</button>
            </div>
        </div>
    `).join('');
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function openReserve(carType) {
    document.getElementById('car-type').value = carType;
    document.getElementById('reserve-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('reserve-modal').classList.remove('active');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function handleSubmit(e) {
    e.preventDefault();
    showToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
    e.target.reset();
}

function handleReserve(e) {
    e.preventDefault();
    closeModal();
    showToast('تم تأكيد حجزك بنجاح!');
    e.target.reset();
}

document.getElementById('reserve-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('reserve-modal')) closeModal();
});

document.addEventListener('DOMContentLoaded', renderCars);
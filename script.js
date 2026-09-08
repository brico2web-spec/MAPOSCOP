const menuButton = document.getElementById('menuButton');
const mainNav = document.getElementById('mainNav');
const toast = document.getElementById('toast');

menuButton.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  menuButton.textContent = mainNav.classList.contains('open') ? '×' : '☰';
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuButton.textContent = '☰';
  });
});

document.querySelectorAll('[data-modal]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.modal).classList.add('visible');
  });
});

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) backdrop.classList.remove('visible');
  });
  backdrop.querySelector('.modal-close').addEventListener('click', () => {
    backdrop.classList.remove('visible');
  });
  backdrop.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    backdrop.classList.remove('visible');
    showToast(backdrop.id === 'bookingModal' ? 'تم إرسال طلب الحجز بنجاح' : 'تم استلام طلب الوصول إلى النتائج');
    event.target.reset();
  });
});

document.querySelectorAll('.faq-item button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    document.querySelectorAll('.faq-item').forEach(other => {
      if (other !== item) other.classList.remove('open');
    });
    item.classList.toggle('open');
  });
});

document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  showToast('شكراً لتواصلك معنا — سنجيب عليك قريباً');
  event.target.reset();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.visible').forEach(modal => modal.classList.remove('visible'));
  }
});

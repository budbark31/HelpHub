document.addEventListener('DOMContentLoaded', function() {
  // --- Charity Search & Filter ---
  const searchInput = document.getElementById('charity-search');
  const causeSelect = document.getElementById('filter-cause');
  const locationSelect = document.getElementById('filter-location');
  const charityBoxes = Array.from(document.querySelectorAll('.charity-box'));
  if (searchInput && causeSelect && locationSelect && charityBoxes.length) {
    function normalize(str) {
      return (str || '').toLowerCase();
    }
    function filterCharities() {
      const search = normalize(searchInput.value);
      const cause = normalize(causeSelect.value);
      const location = normalize(locationSelect.value);
      charityBoxes.forEach(box => {
        const name = normalize(box.querySelector('h3')?.textContent);
        const desc = normalize(box.querySelector('p')?.textContent);
        const details = normalize(box.querySelector('.charity-hover-details')?.textContent);
        let matches = true;
        if (search && !(name.includes(search) || desc.includes(search) || details.includes(search))) matches = false;
        if (cause && !details.includes(cause)) matches = false;
        if (location && !details.includes(location)) matches = false;
        box.style.display = matches ? '' : 'none';
      });
    }
    [searchInput, causeSelect, locationSelect].forEach(el => {
      el && el.addEventListener('input', filterCharities);
      el && el.addEventListener('change', filterCharities);
    });
  }

  // --- Ratings & Reviews ---
  let reviewsModal = document.getElementById('reviews-modal');
  let reviewsList = document.getElementById('reviews-list');
  let reviewForm = document.getElementById('review-form');
  let currentCharity = null;

  function getReviews(charity) {
    return JSON.parse(localStorage.getItem('charityReviews_' + charity) || '[]');
  }
  function saveReview(charity, review) {
    const reviews = getReviews(charity);
    reviews.unshift(review);
    localStorage.setItem('charityReviews_' + charity, JSON.stringify(reviews.slice(0, 20)));
  }
  function renderReviews(charity) {
    const reviews = getReviews(charity);
    if (!reviews.length) {
      reviewsList.innerHTML = '<div style="color:#888;">No reviews yet. Be the first!</div>';
      return;
    }
    reviewsList.innerHTML = reviews.map(r =>
      `<div style="border-bottom:1px solid #eee;padding:6px 0;">
        <span aria-label="Rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <span style="font-size:0.95em;color:#444;">${r.text.replace(/</g, '&lt;')}</span>
        <div style="font-size:0.85em;color:#888;">${r.user || 'Anonymous'} &middot; ${new Date(r.date).toLocaleDateString()}</div>
      </div>`
    ).join('');
  }

  if (reviewsModal && reviewsList && reviewForm) {
    document.querySelectorAll('.review-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        currentCharity = btn.dataset.charity;
        reviewsModal.style.display = 'flex';
        renderReviews(currentCharity);
        const charityName = btn.closest('.charity-box')?.querySelector('h3')?.textContent
          || document.querySelector('.charity-details h1')?.textContent
          || "Charity";
        document.getElementById('reviews-modal-title').textContent = charityName + ' Reviews';
        setTimeout(() => reviewForm.querySelector('textarea').focus(), 100);
      });
    });

    document.getElementById('close-reviews-modal').onclick = function() {
      reviewsModal.style.display = 'none';
      reviewForm.reset();
    };

    reviewForm.onsubmit = function(e) {
      e.preventDefault();
      const rating = parseInt(document.getElementById('review-rating').value, 10);
      const text = document.getElementById('review-text').value.trim();
      if (!rating || !text) return;
      let user = 'Anonymous';
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.fullname) user = currentUser.fullname.split(' ')[0];
      } catch {}
      saveReview(currentCharity, { rating, text, user, date: Date.now() });
      renderReviews(currentCharity);
      reviewForm.reset();
    };

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && reviewsModal.style.display === 'flex') {
        reviewsModal.style.display = 'none';
        reviewForm.reset();
      }
    });

    reviewsModal.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        const focusable = reviewsModal.querySelectorAll('button,select,textarea');
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus(); e.preventDefault();
        }
      }
    });
  }
});

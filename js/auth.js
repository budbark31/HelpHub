// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check which form is on the current page
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form values
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Simple validation
      if (!email || !password) {
        showError(loginForm, 'Please fill in all fields');
        return;
      }
      
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Set user as logged in
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect to home page
        alert('Login successful!');
        window.location.href = 'index.html';
      } else {
        showError(loginForm, 'Invalid email or password');
      }
    });
  }
  
  // Handle signup form submission
  if (signupForm) {
    signupForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form values
      const fullname = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Simple validation
      if (!fullname || !email || !password || !confirmPassword) {
        showError(signupForm, 'Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        showError(signupForm, 'Passwords do not match');
        return;
      }
      
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some(user => user.email === email)) {
        showError(signupForm, 'Email already in use');
        return;
      }
      
      // Add new user
      const newUser = { fullname, email, password };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set user as logged in (automatic login)
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // Redirect to home page
      alert('Account created successfully! You are now logged in.');
      window.location.href = 'index.html';
    });
  }
  
  // Function to show error messages
  function showError(form, message) {
    // Remove any existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Create and append error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.querySelector('.form-actions').before(errorDiv);
  }
  
  // Update UI based on authentication state
  updateAuthUI();
  
  // Function to update auth UI elements
  function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authButtonsContainers = document.querySelectorAll('.auth-buttons');
    
    if (currentUser) {
      authButtonsContainers.forEach(container => {
        // Clear existing buttons
        container.innerHTML = '';
        
        // Get first name (split by space and take first part)
        const firstName = currentUser.fullname.split(' ')[0];
        
        // Create welcome text
        const welcomeSpan = document.createElement('span');
        welcomeSpan.textContent = `Hello, ${firstName}`;
        welcomeSpan.style.marginRight = '15px';
        container.appendChild(welcomeSpan);
        
        // Create logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', function() {
          localStorage.removeItem('currentUser');
          window.location.reload();
        });
        container.appendChild(logoutBtn);
      });
    }
  }
});

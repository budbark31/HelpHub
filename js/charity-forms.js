document.addEventListener('DOMContentLoaded', function() {
  // Get all tab buttons
  const tabButtons = document.querySelectorAll('.form-tab');
  const tabContents = document.querySelectorAll('.form-content');
  
  // Add click event listener to each tab button
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Show the corresponding content
      const contentId = button.getAttribute('data-tab');
      document.getElementById(contentId).classList.add('active');
    });
  });
});

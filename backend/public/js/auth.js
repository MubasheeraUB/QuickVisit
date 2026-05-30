// QuickVisit Auth Helper -- shared across all pages

function showAlert(message, type) {
  type = type || 'error';
  var alertEl = document.getElementById('alert');
  if (!alertEl) { console.warn('Alert:', message); return; }
  alertEl.style.display = 'block';
  alertEl.className = type === 'success' ? 'alert alert-success' : 'alert alert-error';
  alertEl.textContent = message;
  setTimeout(function() { alertEl.style.display = 'none'; }, 5000);
}

function logout() {
  api.setToken(null);
  api.setUser(null);
  window.location.href = '/login';
}

function requireAuth(role) {
  var token = api.getToken();
  var user  = api.getUser();
  if (!token || !user) { window.location.href = '/login'; return false; }
  if (role && user.role !== role) {
    alert('Access denied. Required role: ' + role);
    window.location.href = '/';
    return false;
  }
  return true;
}

function updateLoginLink() {
  var link = document.getElementById('loginLink');
  if (!link) return;
  var user = api.getUser();
  if (user) {
    link.textContent = user.name + ' (Logout)';
    link.href = '#';
    link.onclick = function(e) { e.preventDefault(); logout(); };
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateLoginLink();

  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var submitBtn = loginForm.querySelector('button[type="submit"]');
      var origText  = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Logging in...'; }

      var email    = document.getElementById('email').value.trim();
      var password = document.getElementById('password').value;

      try {
        var result = await api.auth.login(email, password);
        api.setToken(result.token);
        api.setUser(result.user);
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(function() {
          window.location.href = result.user.role === 'admin' ? '/admin' : '/tourist';
        }, 800);
      } catch (err) {
        showAlert(err.message || 'Login failed. Please check your credentials.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
      }
    });
  }

  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var submitBtn = registerForm.querySelector('button[type="submit"]');
      var origText  = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; }

      var data = {
        name:     document.getElementById('reg-name').value.trim(),
        email:    document.getElementById('reg-email').value.trim(),
        phone:    document.getElementById('reg-phone').value.trim(),
        password: document.getElementById('reg-password').value
      };

      if (!data.name || !data.email || !data.password) {
        showAlert('Name, email, and password are required.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
        return;
      }

      try {
        var result = await api.auth.register(data);
        api.setToken(result.token);
        api.setUser(result.user);
        showAlert('Account created! Redirecting...', 'success');
        setTimeout(function() { window.location.href = '/tourist'; }, 800);
      } catch (err) {
        showAlert(err.message || 'Registration failed. Please try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
      }
    });
  }
});

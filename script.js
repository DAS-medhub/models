// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkAcHTfPVGzaR-aCJ6SdWIa8Z-I2nZHHA",
  authDomain: "das-medhub.firebaseapp.com",
  projectId: "das-medhub",
  storageBucket: "das-medhub.appspot.com",
  messagingSenderId: "187749903773",
  appId: "1:187749903773:web:aff296fab3e11513019374",
  measurementId: "G-K3HRBYDYK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to local (keeps users logged in across page refreshes)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
    showAuthMessage("We encountered an issue with your session settings. Please refresh the page.", "error");
  });

// UI Elements
const authModal = document.getElementById("auth-modal");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const userDropdown = document.querySelector(".user-dropdown");
const profileIcon = document.getElementById("profile-icon");
const logoutLink = document.getElementById("logout-link");
const accountLink = document.getElementById("account-link");
const closeButtons = document.querySelectorAll(".close-auth");

// Model URLs configuration
const modelUrls = {
  diabetes: 'https://sebukpor.github.io/Diabetes-classification/',
  cancer: 'https://sebukpor.github.io/multi-cancer-classification/',
  tuberculosis: 'https://sebukpor.github.io/tuberculosis_classification/',
  pneumonia: 'https://sebukpor.github.io/pneumonia/',
  heart: 'https://sebukpor.github.io/heart-diseases-prediction/',
  breast: 'https://sebukpor.github.io/breast-cancer-classification/',
  malaria: 'https://sebukpor.github.io/malaria-classification/',
  dialarge: 'https://sebukpor.github.io/Diabetes-large-input/',
  dia18: 'https://sebukpor.github.io/diabetes-18/'
};

// Current model tracking
let currentModel = null;

/**
 * Display authentication messages to users
 * @param {string} message - The message to display
 * @param {string} type - 'error' or 'success'
 */
function showAuthMessage(message, type) {
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.auth-message');
  existingMessages.forEach(msg => msg.remove());
  
  const messageElement = document.createElement('div');
  messageElement.className = `auth-message auth-message-${type}`;
  messageElement.textContent = message;
  
  // Add to both forms for visibility
  loginForm.appendChild(messageElement.cloneNode(true));
  signupForm.appendChild(messageElement);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

/**
 * Load a model in the iframe and update UI state
 * @param {string} model - The model key to load
 */
function loadModel(model) {
  const modelUrl = modelUrls[model];
  if (modelUrl) {
    currentModel = model;
    // Update the URL hash
    window.location.hash = model;
    // Update UI
    document.getElementById('cardsContainer').style.display = 'none';
    document.getElementById('iframeContainer').style.display = 'block';
    document.getElementById('modelFrame').src = modelUrl;
    
    // Store the current model
    localStorage.setItem('currentModel', model);
  }
}

/**
 * Restore model view from storage if available
 */
function restoreModelView() {
  const model = localStorage.getItem('currentModel');
  if (model && modelUrls[model]) {
    loadModel(model);
  }
}

/**
 * Get the first character of email for profile icon
 * @param {string} email - User's email
 * @returns {string} Uppercase first letter
 */
function getInitial(email) {
  return email.charAt(0).toUpperCase();
}

// Event Listeners

// Show Login Modal
loginButton.addEventListener("click", () => {
  authModal.style.display = "flex";
  loginForm.style.display = "block";
  signupForm.style.display = "none";
  document.getElementById("login-email").focus();
});

// Show Signup Modal
signupButton.addEventListener("click", () => {
  authModal.style.display = "flex";
  signupForm.style.display = "block";
  loginForm.style.display = "none";
  document.getElementById("signup-email").focus();
});

// Close Modal
closeButtons.forEach(button => {
  button.addEventListener("click", () => {
    authModal.style.display = "none";
    // Clear any existing messages
    document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
  });
});

// Close Modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === authModal) {
    authModal.style.display = "none";
    // Clear any existing messages
    document.querySelectorAll('.auth-message').forEach(msg => msg.remove());
  }
});

// Switch between forms
document.getElementById("switch-to-signup").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "block";
  document.getElementById("signup-email").focus();
});

document.getElementById("switch-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.style.display = "none";
  loginForm.style.display = "block";
  document.getElementById("login-email").focus();
});

// Model card click handling
document.querySelectorAll('.model-card').forEach(card => {
  card.addEventListener('click', function() {
    const model = this.dataset.model;
    const user = auth.currentUser;
    
    if (user) {
      loadModel(model);
    } else {
      authModal.style.display = "flex";
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      localStorage.setItem('requestedModel', model);
      showAuthMessage("Please sign in to access medical AI models", "error");
    }
  });
});

// Close iframe and return to model cards
document.getElementById('closeIframe').addEventListener('click', function() {
  document.getElementById('iframeContainer').style.display = 'none';
  document.getElementById('cardsContainer').style.display = 'block';
  history.pushState("", document.title, window.location.pathname + window.location.search);
  localStorage.removeItem('currentModel');
  currentModel = null;
});

// Login form submission
document.getElementById("login-submit").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  
  if (!email || !password) {
    showAuthMessage("Please enter both email and password", "error");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    authModal.style.display = "none";
    
    // Clear form fields
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    
    const requestedModel = localStorage.getItem('requestedModel');
    if (requestedModel) {
      showAuthMessage(`Welcome back! Redirecting to model...`, "success");
      setTimeout(() => {
        loadModel(requestedModel);
        localStorage.removeItem('requestedModel');
      }, 1500);
    }
  } catch (error) {
    let errorMessage;
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "Please enter a valid email address";
        break;
      case 'auth/user-disabled':
        errorMessage = "This account has been disabled. Please contact support";
        break;
      case 'auth/user-not-found':
        errorMessage = "No account found with this email";
        break;
      case 'auth/wrong-password':
        errorMessage = "Incorrect password. Please try again";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Account temporarily locked due to many failed attempts. Please try again later";
        break;
      default:
        errorMessage = "Login failed. Please try again";
    }
    showAuthMessage(errorMessage, "error");
  }
});

// Signup form submission
document.getElementById("signup-submit").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!email || !password) {
    showAuthMessage("Please enter both email and password", "error");
    return;
  }
  
  if (password.length < 6) {
    showAuthMessage("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    authModal.style.display = "none";
    
    // Clear form fields
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    
    const requestedModel = localStorage.getItem('requestedModel');
    if (requestedModel) {
      showAuthMessage(`Account created! Redirecting to model...`, "success");
      setTimeout(() => {
        loadModel(requestedModel);
        localStorage.removeItem('requestedModel');
      }, 1500);
    } else {
      showAuthMessage(`Account created successfully!`, "success");
    }
  } catch (error) {
    let errorMessage;
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "This email is already registered. Please login instead";
        break;
      case 'auth/invalid-email':
        errorMessage = "Please enter a valid email address";
        break;
      case 'auth/weak-password':
        errorMessage = "Password should be at least 6 characters";
        break;
      default:
        errorMessage = "Account creation failed. Please try again";
    }
    showAuthMessage(errorMessage, "error");
  }
});

// Logout handler
logoutLink.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    document.getElementById('iframeContainer').style.display = 'none';
    document.getElementById('cardsContainer').style.display = 'block';
    history.pushState("", document.title, window.location.pathname + window.location.search);
    localStorage.removeItem('currentModel');
    currentModel = null;
    showAuthMessage("You have been signed out successfully", "success");
  } catch (error) {
    showAuthMessage("Sign out failed. Please try again", "error");
  }
});

// Account management placeholder
accountLink.addEventListener("click", (e) => {
  e.preventDefault();
  showAuthMessage("Account management features coming soon!", "success");
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    loginButton.style.display = "none";
    signupButton.style.display = "none";
    userDropdown.style.display = "flex";
    profileIcon.style.display = "flex";
    profileIcon.textContent = getInitial(user.email);
    profileIcon.title = `Signed in as ${user.email}`;

    // Handle model loading based on priority:
    // 1. URL hash
    // 2. localStorage currentModel
    const hash = window.location.hash.substring(1);
    if (hash && modelUrls[hash]) {
      loadModel(hash);
    } else {
      restoreModelView();
    }
  } else {
    // User is signed out
    loginButton.style.display = "inline-block";
    signupButton.style.display = "inline-block";
    userDropdown.style.display = "none";
    profileIcon.style.display = "none";
    
    const hash = window.location.hash.substring(1);
    if (hash && modelUrls[hash]) {
      localStorage.setItem('requestedModel', hash);
      authModal.style.display = "flex";
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      showAuthMessage("Please sign in to access this medical model", "error");
    }
  }
});

// Search functionality
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll('.model-card').forEach(card => {
    const title = card.querySelector('.model-title').textContent.toLowerCase();
    const description = card.querySelector('.model-description').textContent.toLowerCase();
    card.style.display = (title.includes(searchTerm) || description.includes(searchTerm)) 
      ? 'block' 
      : 'none';
  });
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Focus search input on page load
  searchInput.focus();
});

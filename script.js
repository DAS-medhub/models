// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
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

// Set persistence to local (this keeps users logged in across page refreshes)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
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
const closeButtons = document.querySelectorAll(".close-auth");

// Define model URLs
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

// Track current model
let currentModel = null;

// Function to load a model in the iframe and update the URL hash
function loadModel(model) {
  const modelUrl = modelUrls[model];
  if (modelUrl) {
    currentModel = model;
    // Update the URL hash
    window.location.hash = model;
    // Hide the cards container and show the iframe container
    document.getElementById('cardsContainer').style.display = 'none';
    document.getElementById('iframeContainer').style.display = 'block';
    document.getElementById('modelFrame').src = modelUrl;
    
    // Store the current model in localStorage (persists across sessions)
    localStorage.setItem('currentModel', model);
  }
}

// Function to restore model view from storage
function restoreModelView() {
  const model = localStorage.getItem('currentModel');
  if (model && modelUrls[model]) {
    loadModel(model);
  }
}

// Show Login Modal
loginButton.addEventListener("click", () => {
  authModal.style.display = "flex";
  loginForm.style.display = "block";
  signupForm.style.display = "none";
});

// Show Signup Modal
signupButton.addEventListener("click", () => {
  authModal.style.display = "flex";
  signupForm.style.display = "block";
  loginForm.style.display = "none";
});

// Close Modal
closeButtons.forEach(button => {
  button.addEventListener("click", () => {
    authModal.style.display = "none";
  });
});

// Close Modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === authModal) {
    authModal.style.display = "none";
  }
});

// Switch between forms
document.getElementById("switch-to-signup").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "block";
});

document.getElementById("switch-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.style.display = "none";
  loginForm.style.display = "block";
});

// Function to get the first character of the email
function getInitial(email) {
  return email.charAt(0).toUpperCase();
}

// Add click event listeners to all model cards with authentication check
document.querySelectorAll('.model-card').forEach(card => {
  card.addEventListener('click', function() {
    const model = this.dataset.model;
    
    // Check if user is authenticated
    const user = auth.currentUser;
    
    if (user) {
      // User is signed in, allow access to the model
      loadModel(model);
    } else {
      // User is not signed in, show login modal
      authModal.style.display = "flex";
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      
      // Store the requested model in localStorage
      localStorage.setItem('requestedModel', model);
      
      // Show a message to the user
      alert("Please log in to access this model");
    }
  });
});

// Close button event listener to return to the model cards view
document.getElementById('closeIframe').addEventListener('click', function() {
  // Hide the iframe container and show the cards container
  document.getElementById('iframeContainer').style.display = 'none';
  document.getElementById('cardsContainer').style.display = 'block';
  // Reset the URL hash
  history.pushState("", document.title, window.location.pathname + window.location.search);
  // Clear current model from localStorage
  localStorage.removeItem('currentModel');
  currentModel = null;
});

// Login form submission
document.getElementById("login-submit").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    authModal.style.display = "none";
    
    // Clear form fields
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    
    // Check if there was a requested model stored
    const requestedModel = localStorage.getItem('requestedModel');
    if (requestedModel) {
      loadModel(requestedModel);
      // Clear the stored requested model
      localStorage.removeItem('requestedModel');
    }
  } catch (error) {
    alert(error.message);
  }
});

// Signup form submission
document.getElementById("signup-submit").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    authModal.style.display = "none";
    
    // Clear form fields
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    
    // Check if there was a requested model stored
    const requestedModel = localStorage.getItem('requestedModel');
    if (requestedModel) {
      loadModel(requestedModel);
      // Clear the stored requested model
      localStorage.removeItem('requestedModel');
    } else {
      alert("Account created successfully!");
    }
  } catch (error) {
    alert(error.message);
  }
});

// Logout
logoutLink.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    // Return to cards view if on a model
    document.getElementById('iframeContainer').style.display = 'none';
    document.getElementById('cardsContainer').style.display = 'block';
    // Reset URL hash
    history.pushState("", document.title, window.location.pathname + window.location.search);
    // Clear current model from storage
    localStorage.removeItem('currentModel');
    currentModel = null;
    alert("Logged out successfully!");
  } catch (error) {
    alert(error.message);
  }
});

// Account Link (placeholder)
document.getElementById("account-link").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Account management features will be available soon!");
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    loginButton.style.display = "none";
    signupButton.style.display = "none";
    userDropdown.style.display = "block";
    profileIcon.style.display = "flex";
    
    // Set the profile icon initial from email
    profileIcon.textContent = getInitial(user.email);
    
    // Set a tooltip with the email
    profileIcon.title = user.email;

    // Check URL hash first (highest priority)
    const hash = window.location.hash.substring(1);
    if (hash && modelUrls[hash]) {
      loadModel(hash);
    } 
    // Then check localStorage for current model
    else {
      restoreModelView();
    }
  } else {
    // User is signed out
    loginButton.style.display = "inline-block";
    signupButton.style.display = "inline-block";
    userDropdown.style.display = "none";
    profileIcon.style.display = "none";
    
    // Check if there's a model in the URL hash
    const hash = window.location.hash.substring(1);
    if (hash && modelUrls[hash]) {
      localStorage.setItem('requestedModel', hash);
      authModal.style.display = "flex";
      loginForm.style.display = "block";
      signupForm.style.display = "none";
      alert("Please log in to access this model");
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
    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // The auth state observer will handle everything
});

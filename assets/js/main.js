// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDh2HeSZRkt3hPiv6V5elHcPStzRoe2OIc",
  authDomain: "jahonsher-rr.firebaseapp.com",
  projectId: "jahonsher-rr",
  storageBucket: "jahonsher-rr.firebasestorage.app",
  messagingSenderId: "454178011151",
  appId: "1:454178011151:web:2c77308c65e47a578fcb7a",
  measurementId: "G-149D230VMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAyth(app);


let loginBtn = document.getElementById("login-btn");


loginBtn.addEventListener("click", () => {
  const email = document.getElementById("gmail").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      // alert(userCredential)
      alert("logged")
      window.location.href = "../../jahonsher.html";
      return user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(error)
      // ..
    });
})



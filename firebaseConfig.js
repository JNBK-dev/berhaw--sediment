const firebaseConfig = {
    apiKey: "AIzaSyB88N0eXvtFWiGhmBd_R4DlB05QwJEPmMU",
    authDomain: "gym-pioneer.firebaseapp.com",
    projectId: "gym-pioneer",
    storageBucket: "gym-pioneer.firebasestorage.app",
    messagingSenderId: "298516528302",
    appId: "1:298516528302:web:85991c58b9571701fcc13f",
    databaseURL: "https://gym-pioneer-default-rtdb.firebaseio.com"
};



// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = firebase.database();
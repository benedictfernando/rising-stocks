
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyBwBdj4nQbsr2Ice42YZHpn-UXRdoOmuqw",
    authDomain: "coen3463-t4m3.firebaseapp.com",
    projectId: "coen3463-t4m3",
    storageBucket: "coen3463-t4m3.appspot.com",
    messagingSenderId: "449349290716",
    appId: "1:449349290716:web:4395d17c0cca557d040219",
    measurementId: "G-0R5KYVQ5H5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();


// Keeps track if a user is logged in or not
firebase.auth().onAuthStateChanged(function(user) {

    // https://firebase.google.com/docs/reference/js/firebase.User
    if (user) {
        navbar(user);
        if (location.pathname == '/index.html') { index(user) } 
        else if (location.pathname == '/quote.html') { quote(user) }
        else if (location.pathname == '/buy.html') { buy(user) }
        else if (location.pathname == '/sell.html') { sell(user) } 
        else if (location.pathname == '/history.html') { history(user) }
        else { location.href = '/index.html' }
    } else if (location.pathname != '/signin.html') {
        location.href = '/signin.html';
    }
});


// Logs in user
if (!!document.getElementById('login')) {

    document.getElementById('login').onclick = function() {

        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider)

        .then(() => {
            console.log('logging in...');
            location.href = '/index.html';
        })

        .catch(error => {
            console.log(error.code, ':' , error.message);
            location.reload();
        });
    };
}


// Logs out user
if (!!document.getElementById('logout')) {

    document.getElementById('logout').onclick = function() {

        firebase.auth().signOut()
        
        .then(() => {
            console.log('logging out...')
            location.href = '/signin.html';
        })
        
        .catch(error => {
            console.log(error.code, ':' ,error.message);
            location.reload();
        });
    };
}


// Delay showing of pages
setTimeout(() => document.querySelector('body').removeAttribute('hidden'), 700);


// Setups web app's database
var db = firebase.firestore();


function navbar(user) {
    var navUsername = document.getElementById('navUsername');
    var navUserimage = document.getElementById('navUserimage');

    if (!!navUsername && !!navUserimage) {
        navUsername.innerHTML = 'User ID: ' + user.uid;
        navUserimage.src = `${user.photoURL}`;
        navUserimage.style.width = '42px';
        navUserimage.style.borderRadius = '10px';
    }
}

function index(user) {

    // Shortcut to necessary elements
    var tableUsername = document.getElementById('tableUsername');

    // Sets user interface for 'index.html'
    document.title += ' Portfolio';

    // Todo 
    tableUsername.innerHTML = user.displayName;
}

function quote(user) {

    // Sets user interface for 'quote.html'
    document.title += ' Quote';

    // Todo   
}

function buy(user) {

    // Sets user interface for 'buy.html'
    document.title += ' Buy';

    // Todo
}

function sell(user) {

    // Sets user interface for 'sell.html'
    document.title += ' Sell';

    // Todo
}

function history(user) {

    // Sets user interface for 'history.html'
    document.title += ' History';

    // Todo
}

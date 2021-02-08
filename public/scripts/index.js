
function index() {

    // Shortcut to necessary elements
    var database = firebase.firestore();
    var user = firebase.auth().currentUser;
    var navUsername = document.getElementById('navUsername');
    var navUserimage = document.getElementById('navUserimage');
    var tableUsername = document.getElementById('tableUsername');
    // End of shortcut

    // Sets user interface for 'index.html'
    document.title += ' Portfolio';
    navUsername.innerHTML = 'User ID: ' + user.uid;
    navUserimage.src = `${user.photoURL}`;
    navUserimage.style.width = '42px';
    navUserimage.style.borderRadius = '10px';
    tableUsername.innerHTML = user.displayName;
}

function quote() {

    // Sets user interface for 'quote.html'
    document.title += ' Quote';

    // Todo   
}

function buy() {

    // Sets user interface for 'buy.html'
    document.title += ' Buy';

    // Todo
}

function sell() {

    // Sets user interface for 'sell.html'
    document.title += ' Sell';

    // Todo
}

function history() {

    // Sets user interface for 'history.html'
    document.title += ' History';

    // Todo
}
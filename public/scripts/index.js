
// Setups web app's database
var db = firebase.firestore();
var docRef = db.collection('users');

function index(user) {

    // Shortcut to necessary elements
    var tableUsername = document.getElementById('tableUsername');
    var tableUsercash = document.getElementById('tableUsercash');
    var uid = user.uid;    

    // Sets user interface for 'index.html'
    document.title += ' Portfolio';
    tableUsername.innerHTML = user.displayName;

    // Gets user's data from Firestore
    var currentUser = docRef.doc(uid);
    
    getRealtimeUpdates = function() {
        currentUser.onSnapshot(function(details) {
            if (details.exists) {
                var current = details.data();
                tableUsercash.innerHTML = formatMoney(current.cash);
            } else {
                currentUser.set({cash: 10000});
                currentUser.collection('portfolio');
            }
        })
    }

    getRealtimeUpdates();
}

function quote(user) {

    // Shortcut to necessary elements
    var token = 'pk_93b7d07763694723a78dffcc81779114';
    var detailsDiv = document.getElementById('detailsDiv');
    var detailsInfo = document.getElementById('detailsInfo');
    var detailsName = document.getElementById('detailsName');
    var detailsSymbol = document.getElementById('detailsSymbol');
    var detailsPrice = document.getElementById('detailsPrice');

    // Sets user interface for 'quote.html'
    document.title += ' Quote';

    document.querySelector('form').onsubmit = function() {
        detailsDiv.style.display = 'none';
        detailsInfo.style.display = 'inline';
        detailsInfo.innerHTML = '<br>Getting stock quotation...';
        var symbol = document.getElementById('symbol').value;

        // https://cors-anywhere.herokuapp.com/corsdemo
        fetch(`https://cors-anywhere.herokuapp.com/https://cloud-sse.iexapis.com/stable/stock/${symbol}/quote?token=${token}`)
        .then(response => {
            if (response.status === 200) {
                response.json().then (result => {
                    detailsInfo.style.display = 'none';
                    detailsDiv.style.display = 'inline';
                    detailsName.innerHTML = result.companyName;
                    detailsSymbol.innerHTML = result.symbol;
                    detailsPrice.innerHTML = formatMoney(result.latestPrice);
                })
            } else {
                detailsInfo.innerHTML = '<br><span style="font-size: 30px"><b>Error:</b> Invalid stock!</span>';
            }
        })
        .catch(error => {
            console.log(error.code, ':' ,error.message);
        });
        return false;
    };
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

function navbar(user) {
    var navUsername = document.getElementById('navUsername');
    var navUserimage = document.getElementById('navUserimage');

    if (!!navUsername && !!navUserimage) {
        navUsername.innerHTML = 'Hi, ' + user.displayName.split(' ').shift() + '!';
        navUserimage.src = `${user.photoURL}`;
        navUserimage.style.width = '42px';
        navUserimage.style.borderRadius = '10px';
    }
}

function formatMoney(number, decPlaces, decSep, thouSep) {
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
    decSep = typeof decSep === "undefined" ? "." : decSep;
    thouSep = typeof thouSep === "undefined" ? "," : thouSep;
    var sign = number < 0 ? "-" : "";
    var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
    var j = (j = i.length) > 3 ? j % 3 : 0;
    
    return sign + '$' +
        (j ? i.substr(0, j) + thouSep : "") +
        i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
        (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
}

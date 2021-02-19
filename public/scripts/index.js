
// Setups web app's database
var db = firebase.firestore();
var docRef = db.collection('users');

function index(user) {

    // Shortcut to necessary elements
    var tableUsername = document.getElementById('tableUsername');
    var tableUsercash = document.getElementById('tableUsercash');
    var tableUsertotal = document.getElementById('tableUsertotal');
    var table = document.querySelector('tbody');
    var uid = user.uid;    

    // Sets user interface for 'index.html'
    document.title += ' Portfolio';
    tableUsername.innerHTML = user.displayName + ' (You)';

    // Gets user's data from Firestore
    var currentUser = docRef.doc(uid);
    
    // Fires whenever Firebase detected change on Firestore
    (function getRealtimeUpdates() {
        currentUser.onSnapshot(function(details) {
            if (details.exists) {  // Gets data if user exists
                var sum = 0;
                var current = details.data();
                var portfolio = current.portfolio;
                portfolio.sort(dynamicSort('symbol'));
                tableUsercash.innerHTML = formatMoney(current.cash);

                // Loops over returned list of owned stocks
                for (let i = 0, len = portfolio.length; i < len; i++) {
                    if (portfolio[i].shares > 0) {

                        // Populates table's body
                        var row = table.insertRow();
                        
                        // For stock's symbol
                        var info = document.createTextNode(portfolio[i].symbol);
                        var symbol = row.insertCell();
                        symbol.appendChild(info);

                        // For stock's company name
                        info = document.createTextNode(portfolio[i].company);
                        var company = row.insertCell();
                        company.appendChild(info);

                        // For user's number of particular stock owned
                        info = document.createTextNode(portfolio[i].shares);
                        var shares = row.insertCell();
                        shares.appendChild(info);

                        // For stock's price when user bought it
                        info = document.createTextNode(formatMoney(portfolio[i].price));
                        var price = row.insertCell();
                        price.appendChild(info);

                        // For number of shares owned * stock's price when user bought it
                        var product = portfolio[i].shares * portfolio[i].price;
                        info = document.createTextNode(formatMoney(product));
                        var total = row.insertCell();
                        total.appendChild(info);

                        // Gathers total sum for each stocks
                        sum += product;
                    }
                }
                // Updates user's net worth
                tableUsertotal.innerHTML = `<b>${formatMoney(sum + current.cash)}</b>`;
            } 
            else {  // Else, setup provision of cash
                currentUser.set({
                    name: user.displayName,
                    cash: 10000,
                    portfolio: []
                })
            }
        })
    })()
}

function quote(user) {

    // Shortcut to necessary elements
    var detailsDiv = document.getElementById('detailsDiv');
    var detailsInfo = document.getElementById('detailsInfo');
    var detailsName = document.getElementById('detailsName');
    var detailsSymbol = document.getElementById('detailsSymbol');
    var detailsPrice = document.getElementById('detailsPrice');

    // Sets user interface for 'quote.html'
    document.title += ' Quote';

    // Returns data to user when form is submitted
    document.querySelector('form').onsubmit = function() {

        // Prepares essential pieces for later manipulation
        detailsDiv.style.display = 'none';
        detailsInfo.style.display = 'inline';
        detailsInfo.innerHTML = '<br>Getting stock quotation...';
        var symbol = document.getElementById('symbol').value.toUpperCase();

        // Fetches data from IEX Cloud Stocks API
        fetch(`https://risingstocks.000webhostapp.com/lookup.php?symbol=${symbol}`)
        .then(response => {response.json()
            .then(result => {  // Informs user about the stocks they're searching
                detailsDiv.style.display = 'inline';
                detailsSymbol.innerHTML = symbol;
                detailsName.innerHTML = result.companyName;
                detailsPrice.innerHTML = formatMoney(result.latestPrice);
            })
            .catch(error => {  // Else, throws error
                notify({
                    message: 'Invalid stock.',
                    color: 'danger'
                });
                console.log(`${error.code}: ${error.message}`);
            });
            detailsInfo.style.display = 'none';
        })
        return false;   // Assures that the current page will not reload
    };
}

function buy(user) {

    // Shortcut to necessary elements
    var detailsInfo = document.getElementById('detailsInfo');

    // Sets user interface for 'buy.html'
    document.title += ' Buy';

    // Buys share(s) of stock
    document.querySelector('form').onsubmit = function() {

        // Displays some text while user is waiting
        detailsInfo.style.display = 'inline';
        detailsInfo.innerHTML = '<br>Processing transaction...';

        // Ensures for valid number of stock(s)
        var shares = document.getElementById('shares').value;
        if (!isPositiveInteger(shares)) {
            detailsInfo.style.display = 'none';
            notify({
                message: 'Nope.',
                color: 'danger'
            });
            return false;
        } else if (shares == 0) {
            detailsInfo.style.display = 'none';
            notify({
                message: "Can't buy no stock.",
                color: 'danger'
            });
            return false;
        }
        
        // Fetches data from IEX Cloud Stocks API
        shares = parseInt(shares);
        var symbol = document.getElementById('symbol').value.toUpperCase();
        fetch(`https://risingstocks.000webhostapp.com/lookup.php?symbol=${symbol}`)
        .then(response => {response.json()
            .then(result => {

                // Prepares essential pieces for later manipulation
                var company = result.companyName;
                var price = result.latestPrice;
                var total = price * shares;

                // Gets user's data from Firestore
                var currentUser = docRef.doc(user.uid);
                currentUser.get().then(details => {
                    var current = details.data();
                    var onhand = current.cash;
                    var portfolio = current.portfolio;
                    
                    // Declines transaction if user doesn't have enough funds
                    if (total > onhand) {
                        detailsInfo.style.display = 'none';
                        notify({
                            message: 'Not enough funds.',
                            color: 'danger'
                        });
                        return false;
                    }

                    // Checks if user already owns the stock
                    var owned = portfolio.findIndex(function(stock, index) {
                        if (stock.symbol === symbol) {
                            return true;
                        }
                    });

                    // Sets up user's portfolio
                    if (owned === -1) {
                        var process = {
                            symbol: symbol,
                            company: company,
                            shares: shares,
                            price: price
                        }
                        portfolio.push(process);
                    } else {
                        portfolio[owned].price = price;
                        portfolio[owned].shares += shares;
                    }

                    // Updates user's portfolio
                    currentUser.set({
                        cash: onhand - total,
                        portfolio: portfolio,
                    }, { merge: true })
                    
                    .then(() => {
                        notify({
                            message: 'Stock bought!',
                            color: 'success'
                        });
                        // Redirects user to index
                        setTimeout(() => location.href = '/index.html', 500);
                    })
                    .catch(error => { // Else, throws error
                        notify({ message: 'Error completing transaction.' });
                        console.log(`${error.code}: ${error.message}`);
                    });
                })
                .catch(error => {  // Else, throws error
                    notify({
                        message: 'Transaction error.',
                        color: 'danger'
                    });
                    console.log(`${error.code}: ${error.message}`);
                })
            })
            .catch(error => {  // Else, throws error
                notify({
                    message: 'Invalid stock.',
                    color: 'danger'
                });
                console.log(`${error.code}: ${error.message}`);
            });
            detailsInfo.style.display = 'none';
        })
        return false;   // Assures that the current page will not reload
    };
}

function sell(user) {

    // Shortcut to necessary elements
    var detailsInfo = document.getElementById('detailsInfo');
    var options = document.querySelector('select');
    var form = document.querySelector('form');

    // Sets user interface for 'sell.html'
    document.title += ' Sell';

    // Gets user's data from Firestore
    var currentUser = docRef.doc(user.uid);
    currentUser.get().then(details => {
        var current = details.data();
        var portfolio = current.portfolio;
        var select = portfolio;
        select.sort(dynamicSort('symbol'));
        
        // Prints options if user already has
        if (!!select.length) {
            for (let i = 0, len = select.length; i < len; i++) {
                if (select[i].shares > 0) {
                    var option = document.createElement('option');
                    option.value = select[i].symbol;
                    option.innerHTML = `${select[i].symbol} (${select[i].shares})`;
                    options.appendChild(option);
                }
            }
        } else {
            var elements = form.elements;
            detailsInfo.style.display = 'inline';
            detailsInfo.innerHTML = "<br>You don't own any stock(s) yet.";
            form.querySelectorAll(":scope > button").forEach(element => {
                element.disabled = true;
            });
            for (let i = 0, len = elements.length; i < len; i++) {
                elements[i].readOnly = true;
            }
        }

        // Sell share(s) of stock
        form.onsubmit = function() {

            // Displays some text while user is waiting
            detailsInfo.style.display = 'inline';
            detailsInfo.innerHTML = '<br>Processing transaction...';

            // Ensures for valid number of stock(s)
            var shares = document.getElementById('shares').value;
            if (!isPositiveInteger(shares)) {
                detailsInfo.style.display = 'none';
                notify({
                    message: 'Nope.',
                    color: 'danger'
                });
                return false;
            } else if (shares == 0) {
                detailsInfo.style.display = 'none';
                notify({
                    message: "Can't sell no stock.",
                    color: 'danger'
                });
                return false;
            }
            
            // Fetches data from IEX Cloud Stocks API
            shares = parseInt(shares);
            var symbol = document.getElementById('symbol').value.toUpperCase();
            fetch(`https://risingstocks.000webhostapp.com/lookup.php?symbol=${symbol}`)
            .then(response => {response.json()
                .then(result => {

                    var owned = portfolio.findIndex(function(stock, index) {
                        if (stock.symbol === symbol) { return true }
                    });

                    // Checks if user already owns the stock
                    if (owned === -1 || portfolio[owned].shares < 1) {
                        detailsInfo.style.display = 'none';
                        notify({
                            message: `You don't have ${symbol} stock(s) yet.`,
                            color: 'danger'
                        });
                        return false;
                    } else if (portfolio[owned].shares < shares) {
                        detailsInfo.style.display = 'none';
                        notify({
                            message: 'Not enough stocks.',
                            color: 'danger'
                        });
                        return false;
                    }

                    // Prepares essential pieces for later manipulation
                    var price = result.latestPrice;
                    var total = price * shares;
                    var onhand = current.cash;
                    portfolio[owned].shares -= shares;
                    portfolio[owned].price = price;

                    // Updates user's portfolio
                    currentUser.set({
                        cash: onhand + total,
                        portfolio: portfolio,
                    }, { merge: true })
                    
                    .then(() => {
                        notify({
                            message: 'Stock sold!',
                            color: 'success'
                        });
                        // Redirects user to index
                        setTimeout(() => location.href = '/index.html', 500);
                    })
                    .catch(error => { // Else, throws error
                        notify({ message: 'Error completing transaction.' });
                        console.log(`${error.code}: ${error.message}`);
                    });
                });
                detailsInfo.style.display = 'none';
            })
            return false;   // Assures that the current page will not reload
        }
    })
    .catch(error => {  // Else, throws error
        notify({
            message: 'Error getting data.',
            color: 'danger'
        });
        console.log(`${error.code}: ${error.message}`);
    })
}

function history(user) {

    // Sets user interface for 'history.html'
    document.title += ' History';

    // Todo
}

function navbar(user) {

    // Shortcut to necessary elements
    var navUsername = document.getElementById('navUsername');
    var navUserimage = document.getElementById('navUserimage');

    // Sets navbar details for each page
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

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function isPositiveInteger(n) {
    return n >>> 0 === parseFloat(n);
}

'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIFY APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function(movements, sort = false) {
    containerMovements.innerHTML = '';
    const movs = sort ? movements.slice().sort((a, b) => a - b) : movements; 

    movs.forEach(function(mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal'
        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${i + 1}${type}</div>
                <div class="movements__value">${mov}€</div>
            </div>
        `;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
}

const calcDisplayBalance = function(acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0)
    labelBalance.textContent = `${acc.balance}€`;
}


const calcDisplaySummary = function(acc) {
    const incomes = acc.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);

    const out = acc.movements  
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => deposit * acc.interestRate/100)
        .filter(int => int >=1)
        .reduce((acc, int) => acc + int, 0);

    labelSumIn.textContent = `${incomes}€`;
    labelSumOut.textContent = `${Math.abs(out)}€`;
    labelSumInterest.textContent = `${interest}€`;
}


const createUsernames = function(accs) {
    accs.forEach(function(acc) {
      acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join('');
    });
} 

createUsernames(accounts);

const updateUI = function(acc) {
    // display movements
    displayMovements(acc.movements);

    // display balance
    calcDisplayBalance(acc);
    
    // display summary 
    calcDisplaySummary(acc);
}

// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function(e) {
    e.preventDefault();
    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

    if(currentAccount?.pin === Number(inputLoginPin.value)) {
        // display UI and welcome message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        containerApp.style.opacity = 1;

        // clear the inputs
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();

        // update UI
        updateUI(currentAccount);
    }
});

let  sorted = false;
btnSort.addEventListener('click', function(e) {
    e.preventDefault();
    displayMovements(currentAccount.movements, !sorted);
    sorted = !sorted;
});

btnTransfer.addEventListener('click', function(e) {
    e.preventDefault();

    const amount = Number(inputTransferAmount.value);
    const recieverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

    // clear the inputs
    inputTransferAmount.value = inputTransferTo.value = '';
    
    if(
        amount > 0 && 
        recieverAcc && 
        currentAccount.balance >= amount && 
        recieverAcc?.username !== currentAccount.username) {
            // transfer
            currentAccount.movements.push(-amount);
            recieverAcc.movements.push(amount);

            // update UI
            updateUI(currentAccount);
    }
});

btnLoan.addEventListener('click', function(e) {
    e.preventDefault();

    const amount = Number(inputLoanAmount.value);

    if(amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        // add movement
        currentAccount.movements.push(amount);

        // update UI
        updateUI(currentAccount);
    }
    inputClosePin.value = '';
});

btnClose.addEventListener('click', function(e) {
    if(inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
        const index = accounts.findIndex(acc  => acc.username === currentAccount.username);
        
        // delete account
        accounts.splice(index, 1);
        
        // hide UI
        containerApp.style.opacity = 0;
    }
    
    // clear inputs
    inputCloseUsername.value = inputClosePin.value = '';
});
'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector(".button-auth");
const modalAuth = document.querySelector(".modal-auth");
const closeAuth = document.querySelector(".close-auth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const passwordInput = document.querySelector("#password");
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const menuWrapper = document.querySelector('.menu-wrapper');
const modalBody = document.querySelector('.modal-body');
const modalPricetag = document.querySelector('.modal-pricetag');
const clearCart = document.querySelector('.clear-cart');


let login = localStorage.getItem('username');

const cart = [];

const getData = async function(url){
  const response = await fetch(url);

  if (!response.ok){
    throw new Error(`Not valid url: ${url}. Error code: ${response.status}`)
  }

  return await response.json();

};

function toggleModalAuth() {
  modalAuth.classList.toggle("is-open");
};

function renderCart() {
  modalBody.textContent = '';

  cart.forEach(function({id, title, price, quantity}){
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${price}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${quantity}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `;

    modalBody.insertAdjacentHTML('afterbegin', itemCart)
  });

  const totalPrice = cart.reduce(function(result, item) { 
    return result + (parseFloat(item.price)) * item.quantity;
   }, 0);

   modalPricetag.textContent = totalPrice + ' ₽';
};

function changeQuantity(event){
  const target = event.target;

  if (target.classList.contains('counter-button')){

    const food = cart.find(function(item){
      return item.id === target.dataset.id; 
    });
    

    if (target.classList.contains('counter-minus')){
      food.quantity --;

      if (food.quantity === 0){
        cart.splice(cart.indexOf(food), 1);
      };
    };
  
    if (target.classList.contains('counter-plus')){
      food.quantity ++;
    }

    renderCart();

  }

  


}

function toggleModal() {
  modal.classList.toggle("is-open");
};

function authorized(){

  function logOut(){
    login = null;
    localStorage.removeItem('username');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
  }

  console.log('authorized');
  userName.textContent = login;
  cartButton.style.display = 'flex';
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
};

function notauthorized(){
  console.log('notauthorized');

  function logIn(event){
    event.preventDefault();
    login = loginInput.value;

    if (login == ''){
      alert('Enter valid username');
    } else{
      localStorage.setItem('username', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
};

function checkAuth(){
  if (login) {
    authorized();
  } else{
    notauthorized();
  }
};

function createCardRestaurant({image, kitchen, name, price, products, stars,
    time_of_delivery : timeOfDelivery }){
    
  const card = `
    <a class="card card-restaurant" data-products="${products}" data-name="${name}", 
    data-stars="${stars}", data-price="${price}", data-kitchen="${kitchen}"
    >
      <img src="${image}" alt="image" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${timeOfDelivery} мин</span>
        </div>
        <div class="card-info">
          <div class="rating">
            ${stars}
          </div>
          <div class="price">От ${price} ₽</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
  `;

  cardsRestaurants.insertAdjacentHTML('beforeend', card);

};

function createCardGood({ description, id, image, name, price }){

  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">${description}
        </div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart" id=${id}>
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
    </div>
  `);

  cardsMenu.insertAdjacentElement('beforeend', card);

};

function openGoods(event){

  const target = event.target;

  const restaurant = target.closest('.card-restaurant');

  if (restaurant){

    if (! login){
      toggleModalAuth();
    }else{

    cardsMenu.textContent = '';

    containerPromo.classList.add('hide');
    restaurants.classList.add('hide');
    menu.classList.remove('hide');

    menuWrapper.textContent = '';

    const header = document.createElement('div');
    header.className = 'section-heading'
    header.insertAdjacentHTML('beforeend', `
      <h2 class="section-title restaurant-title">${restaurant.dataset.name}</h2>
      <div class="card-info">
        <div class="rating">
          ${restaurant.dataset.stars}
        </div>
        <div class="price">От ${restaurant.dataset.price} ₽</div>
        <div class="category">${restaurant.dataset.kitchen}</div>
      </div>
    `);

    menuWrapper.insertAdjacentElement('afterbegin', header)

    getData(`db/${restaurant.dataset.products}`).then(function(data){
      data.forEach(createCardGood);
    });
    }
  }
};

function addToCart(event){

  const target = event.target;

  const buttonAddToCart = target.closest('.button-add-cart');

  if (buttonAddToCart){
    const card = target.closest('.card');
    const title = card.querySelector('.card-title').textContent;
    const price = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;

    const food = cart.find(function(item){
      return item.id === id;
    })

    if (food){
      food.quantity += 1;
    } else {
      cart.push({id, title, price, quantity : 1})
    }


    console.log(cart);
  }
  
}

function init(){

  getData('db/partners.json').then(function(data){
    data.forEach(createCardRestaurant);
  });

  cardsRestaurants.addEventListener('click', openGoods);

  cartButton.addEventListener("click", function(){
    renderCart();
    toggleModal();
  });

  clearCart.addEventListener('click', function(){
    console.log(11);
    cart.length = 0;
    renderCart();
  });

  modalBody.addEventListener('click', changeQuantity);

  cardsMenu.addEventListener('click', addToCart);

  close.addEventListener("click", toggleModal);

  logo.addEventListener('click', function(){
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  })

  checkAuth();
};

init();

const TIMER = 400;
const REPOS_PER_PAGE = 5;
const form = document.querySelector('.search-form');
const input = document.querySelector('.search-form__input');
const autocomplete = form.querySelector('.search-form__autocomplete');
const results = document.querySelector('.results');
const url = new URL('https://api.github.com/search/repositories');
let currentRepositories = {};

const debounce = (fn, debounceTime) => {
  let timer;
  function wrapper() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, debounceTime);
  }
  return wrapper;
};

//создание элементов выпадающего списка
function createItems(list, data) {
  for (let item of list) {
    autocomplete.insertAdjacentHTML(
      'beforeend',
      `<li class="search-form__item">${item.name}</li>`
    );
  }
}

//удаление элементов из выпадающего списка
function removeListItems() {
  const list = document.querySelectorAll('.search-form__item');
  for (let item of list) {
    item.remove();
  }
}

//функция создания окошка при клике на поисковый запрос
function createFrame(target, list) {
  const searchedRepo = list.find((i) => i.name === target.textContent);
  let {
    name,
    owner: { login },
    stargazers_count: stars,
  } = searchedRepo;

  results.insertAdjacentHTML(
    'beforeend',
    `<li class="results__item">
            <p>Name: ${name}</p>
            <p>Owner: ${login}</p>
            <p>Stars: ${stars}</p>
            <button type="button">X</button>
      </li>`
  );
}

async function searchRepos(evt) {
  const data = evt.target.value;
  removeListItems();
  url.searchParams.set('q', data);
  url.searchParams.set('per_page', REPOS_PER_PAGE);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Ошибка при получении данных, попробуйте еще раз.');
    }

    const result = await response.json();
    currentRepositories = result.items;
    createItems(currentRepositories);
  } catch (err) {
    alert(`${err.message}`);
  }

  if (data === '') {
    removeListItems();
  }
}

function createReposCard(evt) {
  const target = evt.target;
  if (target.tagName === 'LI') {
    input.value = '';
    removeListItems();
    createFrame(target, currentRepositories);
  }

  if (target.tagName === 'BUTTON') {
    target.parentElement.remove();
  }
}

form.addEventListener('keyup', debounce(searchRepos, TIMER));
form.addEventListener('submit', function (evt) {
  evt.preventDefault();
});
document.addEventListener('click', createReposCard);

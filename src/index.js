import axios from 'axios';
import * as dotenv from 'dotenv';
import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'simplelightbox/dist/simple-lightbox.min.css';

dotenv.config();
const { API_KEY } = process.env;

const refs = {
  form: document.querySelector('#search-form'),
  list: document.querySelector('.gallery'),
  btnLoad: document.querySelector('.btn-load-more'),
  input: document.querySelector('.search-form_input'),
};

refs.form.addEventListener('submit', creatFunction);
refs.btnLoad.addEventListener('click', onLoad);

let i = 0;
let startPage = 0;
const perPage = 40;
let totalPage = 0; // кількість сторінок
let textSerchPic = '';

function clearConst() {
  i = 0;
  startPage = 0;

  totalPage = 0;
  textSerchPic = '';
  refs.list.innerHTML = '';
}

async function creatFunction(e) {
  e.preventDefault();
  refs.btnLoad.style.opacity = 0; // <--- приховує кнопку при повторному пошуку

  let formData = e.currentTarget.searchQuery.value;
  if (formData !== textSerchPic) {
    textSerchPic = formData;
    clearConst();
  }
  functionTest(formData);
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  // captionType: 'alt',
});

async function functionTest(formData) {
  startPage += 1;

  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: API_KEY,
        q: formData,
        per_page: perPage,
        page: startPage,
      },
    });
    renderItems(response.data);
  } catch (error) {
    console.error(error);
  }
}

const renderItems = ({ hits, totalHits }) => {
  totalPage = Math.ceil(totalHits / perPage);
  const lists = hits.map(e => {
    i += 1;
    const {
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
      id,
    } = e;

    return `
    
    <div class="gallery-container">
    <a class="gallery__link" href="${largeImageURL}">
      <img class="gallery-img" width="360px" height="360px" src="${webformatURL}" alt="${tags}"  />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b>  ${likes}</p>
        <p class="info-item"><b>Views:</b> ${views}</p>
        <p class="info-item"><b>Comments:</b> ${comments}</p>
        <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        <span class="info-span">${i}</span>
      </div>
    </div>
  
`;
  });

  console.log(hits.length, perPage);
  console.log(totalPage, startPage);

  if (hits.length === 0) {
    Notify.warning(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (hits.length < perPage) {
    refs.btnLoad.style.opacity = 0;
  } else {
    refs.btnLoad.style.opacity = 1;
  }

  if (totalPage <= startPage) {
    refs.btnLoad.style.opacity = 0;
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
  if (startPage === 1) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  refs.list.insertAdjacentHTML('beforeend', lists.join(''));
  lightbox.refresh();
};

function onLoad(e) {
  const inputValue = refs.input.value;
  console.log(inputValue);
  functionTest(inputValue);
}



///scroll

// const options = {
//   root: refs.list,
//   rootMargin: '0px',
//   threshold: 1.0
// }

// let x = e => {
//   console.log(e)
//   /* Content excerpted, show below */
// };
// var observer = new IntersectionObserver(x, options);
// observer.observe(refs.btnLoad)

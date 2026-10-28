

let API_KEY = 'dcea1fd7b3e65d34387ad6de7ef9cc5e'
const BASE_URL = "https://api.themoviedb.org/3";


const box = document.querySelector(".append");
const categoryBtns = document.querySelectorAll(".btns");
const searchInput = document.querySelector("#search");
const minInput = document.querySelector("#min");
const maxInput = document.querySelector("#max");
const scoreInput = document.querySelector("#score");
const filterBtn = document.querySelector(".btn");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const pageLabel = document.querySelector(".title");

let category = localStorage.getItem("movie_type") || "top_rated"; 
let page = 1;
let query = "";
let totalPages = 1;


function buildUrl() {
  if (query) {
    return `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  }
  return `${BASE_URL}/movie/${category}?api_key=${API_KEY}&page=${page}`;
}

async function loadMovies() {
  showMessage(box, "Loading...");

  try {
    const data = await getMovies(buildUrl());
    totalPages = data.total_pages || 1;

    const movies = filterMovies(data.results, {
      min: Number(minInput.value),
      max: Number(maxInput.value),
      score: Number(scoreInput.value),
    });

    if (movies.length === 0) {
      showMessage(box, "Bu so'rov bo'yicha ma'lumot topilmadi");
    } else {
      renderMovies(box, movies);
    }
  } catch (err) {
    showMessage(box, "Xatolik yuz berdi: " + err.message);
  }

  updatePagination();
  markActiveButton();
}

function updatePagination() {
  pageLabel.textContent = page;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
}

function markActiveButton() {
  categoryBtns.forEach(function (btn) {
    const active = btn.value === category && !query;
    btn.style.backgroundColor = active ? "#4b50a0" : "";
  });
}

categoryBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    category = btn.value;
    query = "";
    searchInput.value = "";
    page = 1;
    localStorage.setItem("movie_type", category);
    loadMovies();
  });
});


prevBtn.addEventListener("click", function () {
  if (page > 1) {
    page--;
    loadMovies();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

nextBtn.addEventListener("click", function () {
  if (page < totalPages) {
    page++;
    loadMovies();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

let timer;
searchInput.addEventListener("input", function () {
  clearTimeout(timer);
  timer = setTimeout(function () {
    query = searchInput.value.trim();
    page = 1;
    loadMovies();
  }, 500);
});

filterBtn.addEventListener("click", function () {
  page = 1;
  loadMovies();
});

loadMovies();

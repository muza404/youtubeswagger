let API_KEY = 'dcea1fd7b3e65d34387ad6de7ef9cc5e'
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const NO_POSTER =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='169'>" +
  "<rect width='100%' height='100%' fill='%23373b69'/>" +
  "<text x='50%' y='50%' fill='orange' font-size='24' text-anchor='middle'>No image</text>" +
  "</svg>";

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
let page = Number(localStorage.getItem("page")) || 1;
let query = "";
let totalPages = 1;

const SORT_BY = {
  top_rated: "vote_average.desc",
  popular: "popularity.desc",
  upcoming: "popularity.desc",
};

async function getMovies(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Server xatosi: " + res.status);
  }
  return res.json();
}

function create(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderMovies(movies) {
  box.innerHTML = "";

  movies.forEach(function (movie) {
    const card = create("div", "movie");

    const img = create("img");
    const path = movie.backdrop_path || movie.poster_path;
    img.src = path ? IMG_URL + path : NO_POSTER;
    img.alt = movie.title;

    const info = create("div", "movie-info");
    info.append(
      create("h3", "", movie.title),
      create("span", "orange", Math.round(movie.vote_average))
    );

    const date = create("span", "date", movie.release_date || "—");

    card.append(img, info, date);
    box.append(card);
  });
}

function showMessage(text) {
  box.innerHTML = "";
  const p = create("p", "", text);
  p.style.color = "orange";
  p.style.fontSize = "20px";
  p.style.margin = "40px auto";
  box.append(p);
}

function filterMovies(movies, f) {
  return movies.filter(function (movie) {
    const year = Number((movie.release_date || "").slice(0, 4)) || 0;
    if (f.min && year < Number(f.min)) return false;
    if (f.max && year > Number(f.max)) return false;
    if (f.score && movie.vote_average < Number(f.score)) return false;
    return true;
  });
}

function getFilters() {
  return {
    min: minInput.value.trim(),
    max: maxInput.value.trim(),
    score: scoreInput.value.trim(),
  };
}

function validateFilters(f) {
  if (f.min && !/^\d{4}$/.test(f.min)) return "min year 4 xonali bo'lsin (masalan 2015)";
  if (f.max && !/^\d{4}$/.test(f.max)) return "max year 4 xonali bo'lsin (masalan 2023)";
  if (f.min && f.max && Number(f.min) > Number(f.max)) return "min year max year'dan katta bo'lmasin";
  if (f.score && (Number(f.score) < 0 || Number(f.score) > 10)) return "score 0 dan 10 gacha bo'lsin";
  return "";
}

function buildUrl() {
  const f = getFilters();

  if (query) {
    return `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  }

  if (f.min || f.max || f.score) {
    const params = new URLSearchParams({
      api_key: API_KEY,
      page: page,
      sort_by: SORT_BY[category] || "popularity.desc",
      "vote_count.gte": category === "top_rated" ? 300 : 10,
    });
    if (f.min) params.set("primary_release_date.gte", `${f.min}-01-01`);
    if (f.max) params.set("primary_release_date.lte", `${f.max}-12-31`);
    if (f.score) params.set("vote_average.gte", f.score);
    return `${BASE_URL}/discover/movie?${params}`;
  }

  return `${BASE_URL}/movie/${category}?api_key=${API_KEY}&page=${page}`;
}

async function loadMovies() {
  const f = getFilters();
  const error = validateFilters(f);
  if (error) {
    showMessage(error);
    return;
  }

  showMessage("Loading...");

  try {
    const data = await getMovies(buildUrl());
    totalPages = data.total_pages || 1;

    let movies = data.results;

    if (query) {
      movies = filterMovies(movies, f);
    }

    if (movies.length === 0) {
      showMessage("Bu so'rov bo'yicha ma'lumot topilmadi");
    } else {
      renderMovies(movies);
    }
  } catch (err) {
    showMessage("Xatolik yuz berdi: " + err.message);
  }

  updatePagination();
  markActiveButton();
}

function updatePagination() {
  pageLabel.textContent = page;
  localStorage.setItem("page", page);
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

function applyFilters() {
  page = 1;
  loadMovies();
}

filterBtn.addEventListener("click", applyFilters);

[minInput, maxInput, scoreInput].forEach(function (input) {
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") applyFilters();
  });
});

loadMovies();
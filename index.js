// ===== index.js: asosiy mantiq =====

let API_KEY = 'dcea1fd7b3e65d34387ad6de7ef9cc5e'
const BASE_URL = "https://api.themoviedb.org/3";

// --- HTML'dagi elementlarni topamiz ---
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

// --- Holat (o'zgaruvchan ma'lumotlar) ---
let category = localStorage.getItem("movie_type") || "top_rated"; // oxirgi tanlov eslab qolinadi
let page = 1;
let query = "";
let totalPages = 1;

// --- So'rov manzilini yasash ---
function buildUrl() {
  if (query) {
    // qidiruv bo'lsa, search endpoint
    return `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  }
  // aks holda tanlangan kategoriya
  return `${BASE_URL}/movie/${category}?api_key=${API_KEY}&page=${page}`;
}

// --- Asosiy funksiya: yuklash va chizish ---
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

// --- prev/next holatini yangilash ---
function updatePagination() {
  pageLabel.textContent = page;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;
}

// --- Tanlangan kategoriya tugmasini ajratib ko'rsatish ---
function markActiveButton() {
  categoryBtns.forEach(function (btn) {
    const active = btn.value === category && !query;
    btn.style.backgroundColor = active ? "#4b50a0" : "";
  });
}

// ===== EVENTLAR =====

// 1) Kategoriya tugmalari: top_rated / popular / upcoming
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

// 2) prev / next
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

// 3) Qidiruv: foydalanuvchi yozishni to'xtatgach 0.5 soniyada so'rov ketadi
let timer;
searchInput.addEventListener("input", function () {
  clearTimeout(timer);
  timer = setTimeout(function () {
    query = searchInput.value.trim();
    page = 1;
    loadMovies();
  }, 500);
});

// 4) Filtr tugmasi (min, max, score)
filterBtn.addEventListener("click", function () {
  page = 1;
  loadMovies();
});

// ===== Sahifa ochilganda =====
loadMovies();

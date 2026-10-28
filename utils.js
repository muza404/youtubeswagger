

const IMG_URL = "https://image.tmdb.org/t/p/w500";

const NO_POSTER =
  "data:image/svg+xml;utf8," +
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'>" +
  "<rect width='100%' height='100%' fill='%23373b69'/>" +
  "<text x='50%' y='50%' fill='orange' font-size='24' text-anchor='middle'>No poster</text>" +
  "</svg>";

async function getMovies(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Server xatosi: " + res.status);
  }
  return res.json();
}

function filterMovies(movies, { min, max, score }) {
  return movies.filter(function (movie) {
    const year = Number((movie.release_date || "").slice(0, 4)) || 0;

    if (min && year < min) return false;
    if (max && year > max) return false;
    if (score && movie.vote_average < score) return false;

    return true;
  });
}

function create(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderMovies(box, movies) {
  box.innerHTML = "";

  movies.forEach(function (movie) {
    const card = create("div", "movie");

    const img = create("img");
    img.src = movie.poster_path ? IMG_URL + movie.poster_path : NO_POSTER;
    img.alt = movie.title;

    const info = create("div", "movie-info");
    info.append(
      create("h3", "", movie.title),
      create("span", "orange", movie.vote_average.toFixed(1))
    );

    const date = create("span", "date", movie.release_date || "—");

    card.append(img, info, date);
    box.append(card);
  });
}

function showMessage(box, text) {
  box.innerHTML = "";
  const p = create("p", "", text);
  p.style.color = "orange";
  p.style.fontSize = "20px";
  p.style.margin = "40px auto";
  box.append(p);
}

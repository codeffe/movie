
let query, queryYear, searchType, pageNumber = 1;

const MOVIE_SERIES_URL = 'https://www.omdbapi.com/';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VID_URL = 'https://www.youtube.com/watch?v='

function getDataFromMovieApi(searchTerm, searchType, pageNumber, callback) {

  let settings = {
    url: MOVIE_SERIES_URL,
    data: {
      apikey: 'c778f3f2',
      s: `${searchTerm}`,
      type: `${searchType}`,
      page: `${pageNumber}`,
    },
    dataType: 'json',
    type: 'GET',
    success: callback,
    error: function(req, err) {console.log('Failed to retrieve movie info' + err)}
  };

  $.ajax(settings);
  settings = null;
};

function getDataAboutMovieTitle(movieId, callback) {

  const searchQuery = {
    url: MOVIE_SERIES_URL,
    data: {
      apikey: 'c778f3f2',
      i: `${movieId}`,
    },
    dataType: 'json',
    type: 'GET',
    success: callback,
    error: function(req, err) {console.log('Failed to retrieve info about specific movie title' + err)}
  };

  $.ajax(searchQuery);
};

function getDataFromYoutubeApi(youtubeSearchQuery, callback) {
  const youtubeQuery = {
    url: YOUTUBE_SEARCH_URL,
    data: {
      part: 'snippet',
      key: 'AIzaSyCamYkpClOpIZJ1jteWP1Oa_jAeLrPTpB8',
      maxResults: 1,
      q: `${youtubeSearchQuery}`,
    },
    dataType: 'json',
    type: 'GET',
    success: callback
  };

  $.ajax(youtubeQuery);
}

function renderResult(results, index) {
  if (results.Response === "False") {
    return `
      <article class="error-container">
        <img id="no-movie-result" src="images/no-such-movie.jpg"/>
      </article>
    `;
  } else if (results.Poster === "N/A") {
    return `
    <article class="poster-thumbnail" tabindex="0">
      <div class="card" name="${results.Title} ${results.Year}" value="${results.imdbID}" aria-hidden="true">
        <img class="movie-poster" src="images/no-poster-available.png" alt="${results.Title}-has-no-poster"/>
      </div>
      <h3 class="movie-title-when-no-poster">${results.Title} ${results.Year}</h3>
    </article>
  `;

  } else {
    showPaginationButtons();

    return `
      <article class="poster-thumbnail" tabindex="0">
        <div class="card" name="${results.Title} ${results.Year}" value="${results.imdbID}" aria-hidden="true">
          <img class="movie-poster" src="${results.Poster}" alt="${results.Title} Movie Poster"/>
        </div>
      </article>
    `;
    }
};

function renderModal(movie) {

  const movieElem = $('.modal-content');
  const mpaaRating = $('.mpaa-rating');
  const runTime = $('.run-time');
  const genre = $('.movie-genre');

  if (movie.Poster === "N/A") {

    movieElem.find('#movie-title').html(`${movie.Title} <span id="movie-year">(${movie.Year})</span>`)
    genre.html(movie.Genre);
    mpaaRating.html(movie.Rated);
    runTime.html(movie.Runtime)
    movieElem.find('#movie-plot').html(movie.Plot)
    movieElem.find('.modal-poster-image').attr("src", 'images/no-poster-available.png')

  } else {
    movieElem.find('#movie-title').html(`${movie.Title} <span id="movie-year">(${movie.Year})</span>`)
    movieElem.find('#movie-plot').html(movie.Plot)
    genre.html(movie.Genre);
    mpaaRating.html(movie.Rated);
    runTime.html(movie.Runtime)
    movieElem.find('.modal-poster-image').attr("src", movie.Poster)
  }
};

function renderRatingsToModal(movie) {
  const ratings = $('.rating-by-reviewer');
  const dvd = $('.dvd');

  if (movie.Ratings.length === 3) {

    dvd.find('p').html(`DVD: ${movie.DVD}`);
    ratings.html(`
    <p class="movie-review-by-rating">${movie.Ratings[0].Source}: <span>${movie.Ratings[0].Value}</span></p>
    <p class="movie-review-by-rating">${movie.Ratings[1].Source}: <span>${movie.Ratings[1].Value}</span></p>
    <p class="movie-review-by-rating">${movie.Ratings[2].Source}: <span>${movie.Ratings[2].Value}</span></p>
    <p class="movie-review-by-rating">IMDb: <span>${movie.imdbRating}</span></p>`);

  } else if (movie.Ratings.length === 2) {

    dvd.find('p').html(`DVD: ${movie.DVD}`);
    ratings.html(`
    <p class="movie-review-by-rating">${movie.Ratings[0].Source}: <span>${movie.Ratings[0].Value}</span></p>
    <p class="movie-review-by-rating">${movie.Ratings[1].Source}: <span>${movie.Ratings[1].Value}</span></p>
    <p class="movie-review-by-rating">IMDb: <span>${movie.imdbRating}</span></p>`);

  } else if (movie.Ratings == false) {
    return `
      <p>There are no ratings available for this selection.</p>
    `;
  } else {

    dvd.find('p').html(`DVD: ${movie.DVD}`);
    ratings.html(`
    <p class="movie-review-by-rating">${movie.Ratings[0].Source}: <span>${movie.Ratings[0].Value}</span></p>
    <p class="movie-review-by-rating">IMDb: <span>${movie.imdbRating}</span></p>`);
  }

}

function renderYoutubeResultToModal(movie) {
  if (movie.Poster == "N/A") {
    return `
      <section class="youtube-thumbnail">
        <img src="images/no-trailer.jpg"/>
      </section>
    `;
  } else {
    return `
      <p class="trailer">Trailer</p>
      <iframe id="movie-thumbnail" width="420" height="315"
        src="https://www.youtube.com/embed/${movie.id.videoId}">
      </iframe>
    `;
  }
}

function displayMovieResults(data) {
  if (data.Search === undefined || data.Response === 'False') {
    alert('There are no movies to be displayed. Please use another search.')

    const error = renderResult(data);
    $('.js-search-results').html(error);

  } else {

    $('#number-related-items').text(`${data.totalResults}`)

    const results = data.Search.map((movie, index) => renderResult(movie, index));

    $('.js-search-results').html(results);
  }
}

function displayModalDetails(movie) {
  const plot = renderModal(movie);
  const ratings = renderRatingsToModal(movie)

  $('#myModal').show();
}

function displayYoutubeSearchResults(result) {

  const trailers = result.items.map((item, index) => renderYoutubeResultToModal(item));
  $('.js-youtube-results').html(trailers);

}

function clickToOpenModal() {

  $('.js-search-results').on('click', '.card', event => {

    let movieId = $(event.currentTarget).attr('value');
    let movieTitle = $(event.currentTarget).attr('name');

    let youtubeSearchQuery = `${movieTitle} movie full trailer`

    getDataAboutMovieTitle(movieId, displayModalDetails);
    getDataFromYoutubeApi(youtubeSearchQuery, displayYoutubeSearchResults);

    $('.modal-content').attr('aria-hidden', 'false');
  })

  $('.js-search-results').on('keypress', '.poster-thumbnail', event => {

    if (event.keyCode === 13 || event.keyCode === 32) {
      let movieId = $(event.currentTarget).find('.card').attr('value');
      let movieTitle = $(event.currentTarget).find('.card').attr('name');

      let youtubeSearchQuery = `${movieTitle} movie full trailer`

      getDataAboutMovieTitle(movieId, displayModalDetails);
      getDataFromYoutubeApi(youtubeSearchQuery, displayYoutubeSearchResults);

      $('.modal-content').attr('aria-hidden', 'false');
    }
  })
}

function watchSubmit() {

  $('.js-search-form').submit(event => {
    event.preventDefault();

    $('#landing-page').hide();

    const queryTarget = $(event.currentTarget).find('.js-query');
    const queryTargetYear = $(event.currentTarget).find('.js-query-year');

    query = queryTarget.val();
    searchType = $('.search-type').val();

    pageNumber = 1;

    // clear out the input
    queryTarget.val("");
    queryTargetYear.val("");

    getDataFromMovieApi(query, searchType, pageNumber, displayMovieResults);
  });
}

function pagination() {

  $('#next-page-button').on('click', event => {
    console.log('we clicked on the next button')
    let numberOfMovies = parseInt($('#number-related-items').text());
    let maxNumberOfPages = Math.ceil(numberOfMovies/10)

    if (pageNumber < maxNumberOfPages) {
      console.log(`page number is ${pageNumber}`)
      pageNumber++;
    } else {
      $('#next-page-button').hide();
      return;
    };

    getDataFromMovieApi(query, searchType, pageNumber, displayMovieResults);

    if($('.card').length === 0) {
      $('#next-page-button').hide();
      return;
    }
  });

  $('#back-page-button').on('click', event => {
    if(pageNumber > 1) {
      pageNumber--
      $('#next-page-button').show();

    getDataFromMovieApi(query, searchType, pageNumber, displayMovieResults);
    }
  })
};

function showPaginationButtons() {
  $('button.paginate-button').removeAttr('hidden');
}

function activateModal() {

  // When the user clicks on <span> (x), close the modal
  $('.close').on('click', event => {
    $('#myModal').hide();
  })

  $(window).click(event => {
    if (event.target.id === "myModal") {
      $('#myModal').hide();
    }
  })
}

function tabFocus() {
  $('.js-search-results').on('focus', '.poster-thumbnail', event => {
    $(event.currentTarget).find('.card').attr('aria-hidden', 'false');
  });
}

function handleUserSearch() {
  watchSubmit();
  clickToOpenModal();
  activateModal();
  pagination();
  tabFocus();
}

$(handleUserSearch);

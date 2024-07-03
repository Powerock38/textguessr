function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[random(0, array.length - 1)];
}

async function wikipedia() {
  return await fetch("https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&generator=random&grnnamespace=0&exintro&explaintext&origin=*")
    .then(res => res.json())
    .then(json => {
      const page = Object.values(json.query.pages)[0];
      return page.title + '\n\n' + page.extract;
    });
}

async function tmdb_film() {
  return await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=47b7e6a681c8c6761e7c1943ffd4cafc&language=fr&page=${random(1, 500)}`)
    .then(res => res.json())
    .then(json => json.results.filter(tv => tv.overview))
    .then(results => {
      const movie = randomChoice(results);
      return movie.title + '\n\n' + movie.overview;
    });
}

async function tmdb_tv() {
  return await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=47b7e6a681c8c6761e7c1943ffd4cafc&language=fr&page=${random(1, 500)}`)
    .then(res => res.json())
    .then(json => json.results.filter(tv => tv.overview))
    .then(results => {
      const tv = randomChoice(results);
      return tv.name + '\n\n' + tv.overview;
    });
}

async function musixmatch() {
  const [trackId, title, artist] = await fetch(
    'https://corsproxy.io/?'
    + encodeURIComponent(
      `https://api.musixmatch.com/ws/1.1/chart.tracks.get?apikey=2c2d825eae36d569b96d768531590236&chart_name=top&f_has_lyrics=1&page=${random(1, 100)}&page_size=1&country=fr`
    )
  )
    .then(res => res.json())
    .then(json => {
      const track = json.message.body.track_list[0].track
      return [track.track_id, track.track_name, track.artist_name];
    });

  return await fetch('https://corsproxy.io/?' + encodeURIComponent(`https://api.musixmatch.com/ws/1.1/track.lyrics.get?apikey=2c2d825eae36d569b96d768531590236&track_id=${trackId}`))
    .then(res => res.json())
    .then(json => {
      const lyrics = json.message.body.lyrics.lyrics_body.split('*******')[0].trim();

      return title + '\n' + artist + '\n\n' + lyrics;
    });
}


export default {
  wikipedia,
  tmdb_film,
  tmdb_tv,
  musixmatch,
}

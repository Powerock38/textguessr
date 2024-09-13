# TextGuessr

Play at [https://powerock38.github.io/textguessr/](https://powerock38.github.io/textguessr/)

Every day, everyone gets to guess the same title of...

- a Wikipedia article, based on its first paragraph
- a movie, based on its plot summary
- a show, based on its plot summary
- a song, based on a part of its lyrics

# Impl details

This game runs without any server : the texts are fetched from the respective APIs (Wikipedia, TMDb, MusixMatch) using the client's browser.

For each API, a random text is selected every day, seeded by the current date, so that everyone gets the same text to guess.

Current progress is saved in the browser's local storage.

<sub><sup>yes I know it's bad to leave the API keys in the client code / on GitHub</sup></sub>

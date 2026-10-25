# Wordly Dictionary

A single-page dictionary app. Search an English word to see its definitions, examples and synonyms, hear it pronounced, and save favourite words.

## Features

- Definitions and examples grouped by part of speech from the Wiktionary API
- Up to 5 synonyms per word from the Datamuse API
- Pronunciation using the browser's built-in speech synthesis
- Favourites saved in localStorage, so they survive a page refresh
- Input validation and clear error messages (empty input, invalid characters, word not found, network failure)
- Link to the word's full Wiktionary page

## Project Structure

wordly-dictionary/
├── index.html          # Page markup
├── index.js            # App logic
├── indexTest.js        # Jest tests
├── style.css           # Custom styles
├── package.json        # Dependencies and test script
├── package-lock.json   # Exact dependency versions (auto-generated)
├── README.md           # Project overview
└── API.md              # API documentation


## Getting Started

No build step is needed.

1. Clone or download the project.
2. Open `index.html` in a modern browser 
3. Type a word and press Search.

An internet connection is required for Tailwind, Wiktionary and Datamuse.

## Running the Tests

Tests use Jest with mocked `fetch` calls, so they need no network.

```bash
npm install --save-dev jest
npx jest indexTest.js
```

The tests cover `cleanText`, `getDefinitions` (success, not found, no English section, network failure) and `fetchSynonyms` (success and failure fallback).

## How It Works

1. The search form validates the input (letters, spaces, hyphens and apostrophes only).
2. `getDefinitions` and `fetchSynonyms` fetch the data.
3. `displayWord` renders the result and updates the favourites list.
4. Errors appear in the red message box under the search bar.

## Data Sources

- Wiktionary REST API: https://en.wiktionary.org/api/rest_v1/
- Datamuse API: https://www.datamuse.com/api/

See API.md for details.
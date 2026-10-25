# API Documentation

Wordly Dictionary has no backend. It calls two public APIs from the browser and exports three helper functions from `index.js` for testing.

## External APIs

### Wiktionary (definitions)

```
GET https://en.wiktionary.org/api/rest_v1/page/definition/{word}
```

Returns an object keyed by language code. The app reads only the `en` key.

```json
{
  "en": [
    {
      "partOfSpeech": "Noun",
      "definitions": [
        { "definition": "A greeting.", "examples": ["Hello, how are you?"] }
      ]
    }
  ]
}
```

Definitions and examples may contain HTML, so the app strips tags with `cleanText`.

Responses:
- 200: word found
- 404: word not found

### Datamuse (synonyms)

```
GET https://api.datamuse.com/words?rel_syn={word}&max=5
```

```json
[{ "word": "hi", "score": 1234 }, { "word": "greeting", "score": 987 }]
```

Only the `word` field is used.

## Exported Functions

```js
const { getDefinitions, fetchSynonyms, cleanText } = require("./index.js");
```

### cleanText(html)

Removes HTML tags from a string.

```js
cleanText('A <a href="/x">greeting</a>.'); // "A greeting."
```

### getDefinitions(word) 

Fetches English definitions from Wiktionary.

- Parameters: `word` (string), the word to look up
- Returns: a Promise resolving to an array of English entries, each with `partOfSpeech` and `definitions`
- Throws:
  - `Error` with `No definition found for "{word}"!` when the response is not OK
  - `Error` with `No English definition found for "{word}"!` when there is no `en` section
  - `TypeError` on network failure (passed through so the UI can handle it)

```js
const entries = await getDefinitions("hello");
// [{ partOfSpeech: "Noun", definitions: [{ definition: "A greeting." }] }]
```

### fetchSynonyms(word) (async)

Fetches up to 5 synonyms from Datamuse.

- Parameters: `word` (string), the word to look up
- Returns: a Promise resolving to an array of strings, or `[]` if the request fails
- Throws: nothing. Errors are caught and an empty array is returned

```js
await fetchSynonyms("hello"); // ["hi", "greeting", ...]
```

## Internal UI Functions

These run in the browser only and are not exported.

- `fetchWord(word)`: loads definitions and synonyms, then renders them or shows an error
- `displayWord(word, entries, synonyms)`: renders the word, meanings, examples, synonyms and Wiktionary link
- `updateFavourites()`: refreshes the save button and the favourites list
- `toggleFavourite()`: adds or removes the current word and saves to `localStorage`
- `showError(message)` / `hideError()`: shows or clears the error message

## Input Rules

Searches are trimmed and lowercased, then must match `/^[a-z' -]+$/` (letters, apostrophes, spaces, hyphens).

Error messages:
- Empty input: "Please enter a word to search."
- Numbers or symbols: "Please use letters only. Numbers and symbols are not accepted : )"
- Unknown word: "No definition found for "{word}"!"
- Offline: "Network failure! Please check your connection"

## Storage

- Key: `favourites`
- Type: JSON array of strings
- Description: saved words, stored in `localStorage`
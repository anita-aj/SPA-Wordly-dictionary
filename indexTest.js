global.document = {getElementById:()=>({})};
const {getDefinitions, fetchSynonyms, cleanText}= require("./index.js");

test("Does cleanText remove HTML tags?",()=>{
    expect(cleanText('A <a href="/test/link/x">greeting</a>.')).toBe("A greeting.");
});

test("Are English entries returned by getDefinitions?", async()=>{
    const entries = [{partOfSpeech:"Noun", definitions:[{definition:"A greeting."}]}];

global.fetch = jest.fn().mockResolvedValue({ok:true,json:async()=>({en: entries})});
expect(await getDefinitions("hello")).toEqual(entries);
});

test("Does getDefinitions throw an error when the word is not found?", async()=>{
    global.fetch = jest.fn().mockResolvedValue({ok:false});
    await expect(getDefinitions("bdgfur")).rejects.toThrow(/no definition found/i);
});

test("Does getDefinitions throw an error when there is no English section?", async()=>{
    global.fetch = jest.fn().mockResolvedValue({ok:true, json: async()=>({fr:[]})});
    await expect(getDefinitions("chat")).rejects.toThrow(/no English definition/i);
});

test("Does getDefinitions let a network failure through as a TypeError?", async()=>{
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(getDefinitions("hello")).rejects.toThrow(TypeError);
});

test("Does fetchSynonyms return a list of words?", async()=>{
    global.fetch = jest.fn().mockResolvedValue({json: async()=>[{word:"hi"},{word:"greeting"}]});
    expect(await fetchSynonyms("hello")).toEqual(["hi", "greeting"]);
});

test("Does fetchSynonyms return an empty list when it fails?", async()=>{
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await fetchSynonyms("hello")).toEqual([]);
});
# Wordle Clone aka Clondle

A clone of the popular online game Wordle! Clondle has no limits, play as many times as you want!

<section align="center">
  <img src="https://user-images.githubusercontent.com/101219940/169627344-5a7a0d2a-ceb2-42dc-a15b-eb0e760c9490.gif" alt="game demo">
</section>

Link to project: [https://clondle.netlify.app/](https://clondle.netlify.app/)

# How It's Made
Technologies used: HTML5, CSS3, Javascript

I used a [Random Word Generator API](http://random-word-api.herokuapp.com/home) to get a random five letter word that player will try to guess in 6 tries.
After the 6 tries, I also used a [Dictionary API](https://dictionaryapi.dev/) to display the definition of the word. The game logic is implemented in a constructor function. Using the DOM, I would add a class to one of the element containing the letters to display whether that letter is right, wrong or in the word through different colours (green, gray, yellow).

# Lessons Learned
I learned how to use the browser's localStorage so that I can store the player's game statistics.

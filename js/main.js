function CreateWordle() {
     this.word = "";
     this.wordLetterCount = {};
     this.playerInput = '';
     this.tries = JSON.parse(localStorage.getItem('wordle-clone-tries')) || {
        numOfTries: 0,
        listOfTries: ["", "", "", "", "", ""],
        correctness: ["", "", "", "", "", ""],
     };
     this.definitions = JSON.parse(localStorage.getItem('wordle-clone-def')) || {
         word: "",
         listOfDefinitions: [],
     };
     this.stat = JSON.parse(localStorage.getItem('wordle-clone-stats')) || {
         winStreak: true,
         gamesPlayed: 0,
         gamesWon: 0,
         winRate: 0,
         currStreak: 0,
         maxStreak: 0,
         guessDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
        }
     }
     this.newGame = JSON.parse(localStorage.getItem('wordle-clone-new-game')) === false ? false : true;

     this.getWord =  async function() {
        if (localStorage.getItem('wordle-clone-word')) {
            this.word = localStorage.getItem('wordle-clone-word'); 
        } else {
            let request = await fetch('https://random-word-api.herokuapp.com/word?number=1&length=5');
            let response = await request.json();
            this.word = response[0];

            let word = await this.isAWord(this.word);
            while (!word) {
                request = await fetch('https://random-word-api.herokuapp.com/word?number=1&length=5');
                response = await request.json();

                this.word = response[0];

                word = await this.isAWord(this.word);
            }

            localStorage.setItem('wordle-clone-word', this.word); 
        }


    }.bind(this);

    this.setUp = async function() {
        if (this.tries.numOfTries > 0) {
            displayHistory();
        }

        if (!this.newGame) {
            document.querySelector('.word-def').classList.remove('hidden');
            document.querySelector('.play-btn').classList.remove('hidden');  
            this.showDefinitions();  
            return;
        }    
        
        await this.getWord();
        document.addEventListener('keydown', keyboardInput);
        createKeyboard();



        console.log(this.word);


    }.bind(this);

    const isLetters = function(val) {
        if (val.length > 1) {
            return false;
        }
        return val.split("").every(elem => {
            let code = elem.charCodeAt(0);
            if (code > 96 && code < 123) {
                return true;
            } else {
                return false;
            }            
        });
    }

    this.isAWord = async function(inputVal) {
        try {
            const request = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${inputVal}`);
            if (request.status === 200) {
                return true;
            }
        } catch (e) {
            console.log(e);
            return false;
        }


        return false;
    }.bind(this);

    this.getDefinitions = async function() {
        const request = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.word}`);
        const response = await request.json();

        this.definitions.word = this.word;
        this.definitions.listOfDefinitions.push(...response.map(elem => elem.meanings[0]));

    }

    this.enterPlayerInput = async function() {
        this.tries = typeof this.tries === 'string' ? JSON.parse(this.tries) : this.tries;

        if (!this.playerInput || this.playerInput.length !== 5) {
            console.log('Invalid input');
            return;
        }

        if (await this.isAWord(this.playerInput) ) {
            this.tries.listOfTries[this.tries.numOfTries] = this.playerInput;
            localStorage.setItem('wordle-clone-tries', JSON.stringify(this.tries));

            this.displayHints();
            if (this.isCorrect()) {
                this.win();
                return;
            }
            this.playerInput = '';
        } else {
            console.log('not a word');
            this.popup('Not in word list');
        }

        if (this.tries.numOfTries === 6)  {
            console.log('game over');
            this.lose();
        }

    }.bind(this);

    this.popup = function(val) {
        document.querySelector('.popup').innerText = val;
        document.querySelector('.popup').classList.remove("hidden");
        setTimeout(() => document.querySelector('.popup').classList.add("hidden"), 1000);
}

    this.fillWordLetterCount = function() {
        for (let i=0; i<this.word.length; i++) {
            if (this.wordLetterCount[this.word[i]]) {
                this.wordLetterCount[this.word[i]]++;
            } else {
                this.wordLetterCount[this.word[i]] = 1;
            }
        }

    }.bind(this);

    this.displayHints = function() {        
        this.wordLetterCount = {};
        this.fillWordLetterCount();

        console.log(this.playerInput);

        for (let i=0; i<5; i++) {
            if (this.playerInput[i]===this.word[i]) {
                document.querySelector(`#tryIndex-${this.tries.numOfTries}-${i}`).classList.add('green');
                document.querySelector(`#${this.playerInput[i]}-kb`).classList.add('green');
                this.wordLetterCount[this.word[i]]--;
                this.tries.correctness[this.tries.numOfTries] += '2'; // correct place and letter
            }
        }

        for (let i=0; i<5; i++) {
            if (this.playerInput[i]===this.word[i]) {
                continue;
            } else if (this.playerInput[i] in this.wordLetterCount && this.wordLetterCount[this.playerInput[i]]>0) {
                document.querySelector(`#tryIndex-${this.tries.numOfTries}-${i}`).classList.add('yellow');
                document.querySelector(`#${this.playerInput[i]}-kb`).classList.add('yellow');
                this.tries.correctness[this.tries.numOfTries] += '1'; // correct letter
            } else {
                document.querySelector(`#tryIndex-${this.tries.numOfTries}-${i}`).classList.add('gray');
                document.querySelector(`#${this.playerInput[i]}-kb`).classList.add('gray');
                this.tries.correctness[this.tries.numOfTries] += '0'; // letter not in word

            }
        }

        this.tries.numOfTries++;
        localStorage.setItem('wordle-clone-tries', JSON.stringify(this.tries));
    }.bind(this);

    this.displayLetter = function() {
        this.tries = typeof this.tries === 'string' ? JSON.parse(this.tries) : this.tries;

        document.querySelector(`#tryIndex-${this.tries.numOfTries}-${this.playerInput.length-1}`).innerText += this.playerInput[this.playerInput.length-1];
    }
    
    this.removeLetter = function() {
       document.querySelector(`#tryIndex-${this.tries.numOfTries}-${this.playerInput.length}`).innerText = '';
    }

    this.clearRow = function() {
        for (let i=0; i<5; i++) {
            document.querySelector(`#tryIndex-${this.tries.numOfTries}-${i}`).innerText = '';
        }
    }

    this.isCorrect = function() {
        if (this.playerInput.toLowerCase() === this.word.toLowerCase()) {
            return true;
        }
        return false;
    }

    this.win = async function() {
        console.log('Win');

        this.stat.winStreak = true;
        this.stat.gamesWon++;
        this.stat.currStreak++;
        if (this.stat.currStreak > this.stat.maxStreak) {
            this.stat.maxStreak = this.stat.currStreak;
        }
        this.stat['guessDistribution'][this.tries.numOfTries]++;

        await this.gameOver();

    }

    this.lose = function() {
        console.log('Lose');

        this.popup(this.word);

        this.stat.winStreak = false;
        if (this.stat.currStreak > this.stat.maxStreak) {
            this.stat.maxStreak = this.stat.currStreak;
            
        }
        this.stat.currStreak = 0;

        setTimeout(async () => { await this.gameOver() }, 1000);
        
    }

    this.gameOver = async function() {
        this.newGame = false;
        localStorage.setItem('wordle-clone-new-game', JSON.stringify(this.newGame));
        this.stat["gamesPlayed"]++;
        this.stat.winRate = (this.stat.gamesWon / this.stat.gamesPlayed) * 100;

        localStorage.setItem('wordle-clone-stats', JSON.stringify(this.stat));
        localStorage.setItem('wordle-clone-tries', JSON.stringify(this.tries));
        localStorage.setItem('wordle-clone-new-game', JSON.stringify(this.newGame));
        
        await this.getDefinitions();
        this.showDefinitions();
        this.displayLeaderboard();

        document.querySelector('.play-btn').classList.remove('hidden');
        document.querySelector('.word-def').classList.remove('hidden');

        showLeaderboard();

        this.word = "";
        localStorage.setItem('wordle-clone-word', this.word);

    }

    this.displayLeaderboard = function() {
        document.querySelector('#numsPlayed').innerText = this.stat.gamesPlayed;
        document.querySelector('#winRate').innerText = this.stat.winRate.toFixed(0);
        document.querySelector('#currStreak').innerText = this.stat.currStreak;
        document.querySelector('#maxStreak').innerText = this.stat.maxStreak;

        for (let i=0; i<6; i++) {
            document.querySelector(`.bar-${i}`).innerText = this.stat.guessDistribution[i+1];
            document.querySelector(`.bar-${i}`).style.width = `${(this.stat.guessDistribution[i+1] / this.stat.gamesWon) * 100}%`;
        }
    }

    this.showDefinitions = function() {

        localStorage.setItem('wordle-clone-def', JSON.stringify(this.definitions));

        document.querySelector('#word').innerText = this.definitions.word;
        document.querySelector('#type').innerText = this.definitions.listOfDefinitions[0].partOfSpeech;
        document.querySelector('#def').innerText = this.definitions.listOfDefinitions[0].definitions[0].definition;
    }

    this.reset = function() {
        this.wordLetterCount = {};
        this.tries = {
            numOfTries: 0,
            listOfTries: ["", "", "", "", "", ""],
            correctness: ["", "", "", "", "", ""],
        };
        this.playerInput = '';
        this.definitions = {
            word: "",
            listOfDefinitions: [],
        };;

        localStorage.setItem('wordle-clone-word', this.word);
        localStorage.setItem('wordle-clone-tries', JSON.stringify(this.tries));

        for (let i =0; i<6; i++) {
            for (let j=0; j<5; j++) {
                document.querySelector(`#tryIndex-${i}-${j}`).innerText = "";
                document.querySelector(`#tryIndex-${i}-${j}`).classList.remove('green');
                document.querySelector(`#tryIndex-${i}-${j}`).classList.remove('yellow');
                document.querySelector(`#tryIndex-${i}-${j}`).classList.remove('gray');

            }
        }

        const kb = document.querySelectorAll('.screen-kb');
        Array.from(kb).forEach(element => {
            element.classList.remove('yellow');
            element.classList.remove('green');
            element.classList.remove('gray');
        })

        document.querySelector('#word').innerText = "";
        document.querySelector('#type').innerText = "";
        document.querySelector('#def').innerText = "";


        document.querySelector('.word-def').classList.add('hidden');
        document.querySelector('.play-btn').classList.add('hidden');

    }

    const createKeyboard = function() {
        const kb = document.querySelectorAll('.screen-kb');
        Array.from(kb).forEach(element => element.addEventListener('click', keyboardInput))
    }

    const keyboardInput = function(e) {
        let value = e.key || e.target.innerText;
        value = value.toLowerCase();
        if (value === 'enter') {
            this.enterPlayerInput(this.playerInput);
        } else if ( (value === 'backspace' || value==='delete' ) && this.playerInput.length > 0) {
            this.playerInput = this.playerInput.slice(0,-1);
            this.removeLetter();
        } else if (isLetters(value) && this.playerInput.length < 5) {
            this.playerInput += value;
            this.displayLetter();
        }

    }.bind(this);

    const displayHistory = function() {
        for (let i=0; i<this.tries.numOfTries; i++) {
            for (let j=0; j<5; j++) {
                document.querySelector(`#tryIndex-${i}-${j}`).innerText += this.tries.listOfTries[i][j];

                if (this.tries.correctness[i][j] === '2') {
                    document.querySelector(`#tryIndex-${i}-${j}`).classList.add('green');
                    document.querySelector(`#${this.tries.listOfTries[i][j]}-kb`).classList.add('green');
                } else if (this.tries.correctness[i][j] === '1') {
                    document.querySelector(`#tryIndex-${i}-${j}`).classList.add('yellow');
                    document.querySelector(`#${this.tries.listOfTries[i][j]}-kb`).classList.add('yellow');
                } else if (this.tries.correctness[i][j] === '0') {
                    document.querySelector(`#tryIndex-${i}-${j}`).classList.add('gray');
                    document.querySelector(`#${this.tries.listOfTries[i][j]}-kb`).classList.add('gray');
                }
            }
        }
    }.bind(this);

}


let wordle = new CreateWordle();
wordle.setUp();
wordle.displayLeaderboard();

document.querySelector('img').addEventListener('click', showLeaderboard);
document.querySelector('.close-button').addEventListener('click', closeLeaderboard);
document.querySelector('.play-btn').addEventListener('click', playAgain);

function showLeaderboard() {
    document.querySelector('.game-stats').classList.remove('hidden');
    document.querySelector('.overlay').classList.remove('hidden');
}

function closeLeaderboard() {
    document.querySelector('.game-stats').classList.add('hidden');
    document.querySelector('.overlay').classList.add('hidden');

}

function playAgain() {
    wordle.reset();
    wordle.newGame = true;
    wordle.setUp();
    localStorage.setItem('wordle-clone-new-game', wordle.newGame);
    closeLeaderboard();
}

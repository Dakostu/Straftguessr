<script>
	import {draggable} from "@neodrag/svelte"
	import {fly, fade} from 'svelte/transition'
	import {Lightbox} from 'svelte-lightbox'
	import Svelecte from 'svelecte'

	let floatingTexts = $state([]);
	let currentImg = $state("");
	let revealSolution = $state(false);
	let loading = $state(true);
	let loadingStringDots = $state("");
	const incrLoadingStringDots = () => (
		(loadingStringDots.length === 4) ? loadingStringDots = "" : loadingStringDots += '.'
	);
	let dots;
	$derived: {
		clearInterval(dots);
		setInterval(incrLoadingStringDots, 150);
	}
	const MAX_ROUNDS = 15;
	const MEDIUM_START_ROUND = 7;
	const HARD_LIMIT_ROUND = 12;
	const EASY_STRING = "Easy";
	const MEDIUM_STRING = "Medium";
	const HARD_STRING = "Hard";
	const INCORRECT_STRING = "incorrect";
	const ALMOST_CORRECT_STRING = "almost_correct";
	const CORRECT_STRING = "correct";
	const MAP_LIST = [
		"Adobe_00",
		"Adobe_00_Alt",
		"Adobe_01",
		"Adobe_01_Alt",
		"Adobe_02",
		"Adobe_02_Alt",
		"Adread_00",
		"Appartment_00",
		"Aquatic_00",
		"Aquatic_01",
		"Arena_00",
		"Arena_00_Alt",
		"Arena_01",
		"Arena_01_Alt",
		"Arena_02",
		"Arena_02_Alt",
		"Arena_03",
		"Arena_03_Alt",
		"Arena_04",
		"Arena_04_Alt",
		"Arena_05",
		"Arena_05_Alt",
		"Arena_06",
		"Arena_06_Alt",
		"Arena_07",
		"Arena_07_Alt",
		"Arena_08",
		"Arena_09",
		"Arena_09_Alt",
		"Arena_10",
		"Arena_10_Alt",
		"Arena_11",
		"Arena_11_Alt",
		"Arena_12",
		"Arena_12_Alt",
		"Arena_13",
		"Arena_13_Alt",
		"Arena_14",
		"Arena_14_Alt",
		"Arena_16",
		"Arena_16_Alt",
		"Arena_20",
		"Arena_21",
		"Arena_22",
		"Arena_23",
		"Arena_24",
		"Arena_25",
		"Arena_25_Alt",
		"Arena_26",
		"Arena_27",
		"Arena_27_Alt",
		"Arena_28",
		"Arena_29",
		"Arena_30",
		"Arena_Shadow_00",
		"Arena_Shadow_01",
		"Arena_Shadow_02",
		"Arena_Shadow_03",
		"Arena_Shadow_04",
		"Arena_Shadow_04_Alt",
		"Arena_Shadow_05",
		"Arena_Shadow_05_Alt",
		"Arena_Shadow_06",
		"Arena_Shadow_07",
		"Arena_Shadow_08",
		"Autobahn_00",
		"Backrooms_00",
		"Backrooms_01",
		"Backrooms_02",
		"Barren_00",
		"Barren_00_Alt",
		"Barren_01",
		"Barren_01_Alt",
		"Barren_02",
		"Barren_02_Alt",
		"Basket_00",
		"Basket_00_Alt",
		"Basket_01",
		"Basket_01_Alt",
		"Basket_02",
		"Basket_02_Alt",
		"Bazaar_00",
		"Bazaar_01",
		"Bazaar_01_Alt",
		"Cage_Fight_00_Day",
		"Cage_Fight_00_Night",
		"Cage_Fight_00_Sunset",
		"Canliferous_fluorspar",
		"Canliferous_fluorspar_Alt",
		"Canliferous_map",
		"Chateaux_01",
		"Chateaux_02",
		"Chateaux_03",
		"Chateaux_04",
		"Chateaux_05",
		"Chateaux_06_Alt",
		"Chateaux_06_NoGrass",
		"Chateaux_07_NoGrass_01",
		"Chateaux_09",
		"Chateaux_10",
		"Chateaux_11",
		"Chateaux_12",
		"Chateaux_13",
		"Chateaux_13_Alt",
		"Chateaux_13_Alt_Alt",
		"Corridor_00",
		"Corridor_00_alt",
		"Corridor_01",
		"Corridor_02",
		"Corridor_02_alt",
		"Corridor_03",
		"Corridor_03_Alt",
		"Corridor_04",
		"Corridor_04_Alt",
		"Corridor_05",
		"Corridor_07",
		"Corridor_07_alt",
		"Corridor_08",
		"Corridor_08_Alt",
		"Corridor_10",
		"Corridor_11",
		"Corridor_12",
		"Dragonfly_ADifferentPlace_01",
		"Dragonfly_ADifferentPlace_01_Alt",
		"Dragonfly_ADifferentPlace_02",
		"Dragonfly_ADifferentPlace_02_Alt",
		"Dragonfly_Abduction",
		"Dragonfly_Abduction_Alt",
		"Dragonfly_BarrelBattle",
		"Dragonfly_BarrelBattle_Alt",
		"Dragonfly_Basalt",
		"Dragonfly_Basalt_Alt",
		"Dragonfly_Bowl",
		"Dragonfly_Bowl_Alt",
		"Dragonfly_Cliffs",
		"Dragonfly_Cliffs_Alt",
		"Dragonfly_Crusher",
		"Dragonfly_Crusher_Alt",
		"Dragonfly_Crusher_Underwater_Alt",
		"Dragonfly_Depths",
		"Dragonfly_Depths_Alt",
		"Dragonfly_Earthscraper",
		"Dragonfly_Earthscraper_Alt",
		"Dragonfly_Fracture",
		"Dragonfly_Fracture_Alt",
		"Dragonfly_IceSlide_01",
		"Dragonfly_IceSlide_02",
		"Dragonfly_Lancer",
		"Dragonfly_Lancer_Alt",
		"Dragonfly_Neighbourhood",
		"Dragonfly_Neighbourhood_Alt",
		"Dragonfly_Pillars",
		"Dragonfly_Pillars_Alt",
		"Dragonfly_Pit",
		"Dragonfly_Pit_Alt",
		"Dragonfly_Sewer",
		"Dragonfly_Sewer_Alt",
		"Dragonfly_Shrine",
		"Dragonfly_Shrine_Alt",
		"Dragonfly_Space",
		"Dragonfly_Space_Alt",
		"Dragonfly_Stairway",
		"Dragonfly_Stairway_Alt",
		"Dragonfly_Streets",
		"Dragonfly_Streets_Alt",
		"Dragonfly_Tunnel",
		"Dragonfly_Tunnel_Alt",
		"Dragonfly_Vestige",
		"Dragonfly_Vestige_Alt",
		"Dragonfly_Vestige_Underwater_Alt",
		"Dragonfly_Waterway",
		"Dragonfly_Waterway_Alt",
		"Drain_00",
		"Drain_01",
		"EndGame",
		"Factory_00",
		"Factory_01",
		"Fortinayt_02",
		"Fortinayt_02_Alt",
		"Garden_00",
		"Garden_01",
		"Garden_01_Alt",
		"Garden_02",
		"Garden_03",
		"Garden_04",
		"Garden_04_Alt",
		"Gobi_00",
		"Gutenberg_00",
		"Gutenberg_01",
		"Gutenberg_01_Alt",
		"HK_02",
		"HK_02_Alt",
		"HK_03",
		"HK_03_Alt",
		"HK_04",
		"HighWall_00",
		"Hinterland_00",
		"Hinterland_00_Alt",
		"Hinterland_01",
		"Hinterland_01_Alt",
		"ICE_01",
		"ICE_01_Alt",
		"ICE_02",
		"ICE_03",
		"ICE_04",
		"ICE_05",
		"ICE_06",
		"Impasse01",
		"LostCity_00",
		"LostCity_00_Alt",
		"LostCity_01",
		"Neo_Arena_00",
		"Neo_Arena_00_Alt",
		"Neo_Arena_01",
		"Neo_Arena_02",
		"Neo_Arena_03",
		"Neo_Arena_04_0",
		"Neo_Arena_04_1",
		"Neo_Arena_05_0",
		"Neo_Arena_05_1",
		"Neo_Arena_05_1_Alt",
		"Neo_Arena_06",
		"Neo_Arena_07",
		"Neo_Arena_07_Alt",
		"Neo_Arena_08",
		"Neo_Arena_09",
		"Neo_Arena_10",
		"Neo_Arena_10_Alt",
		"Neo_Arena_11",
		"Neo_Arena_11_Alt",
		"Neo_Arena_12",
		"Neo_Arena_12_Alt",
		"Neo_Arena_14",
		"Neo_Arena_14_Alt",
		"Parking",
		"Parking_1_alt",
		"Parking_alt",
		"Patio_00",
		"PigFarm_00",
		"PlageTymoes_00",
		"Prison_00",
		"ReeperBahn_00",
		"ReeperBahn_01",
		"Republic_00",
		"Republic_00_Alt",
		"Republic_01",
		"Republic_02",
		"Republic_03",
		"Republic_04",
		"Republic_05",
		"Republic_07",
		"Republic_07_Alt",
		"Republic_08",
		"Scaffoldingue_00",
		"Sonova_Chimney",
		"Sonova_RoadSide",
		"Sonova_Sewage",
		"StLucia_00",
		"StLucia_00_Alt",
		"StLucia_01",
		"StLucia_02",
		"StLucia_02_Alt",
		"StLucia_03",
		"StLucia_03_Alt",
		"StLucia_04",
		"StLucia_04_Alt",
		"Stadium_00",
		"Stadium_00_Alt",
		"Stadium_01",
		"Stadium_01_Alt",
		"Stadium_02",
		"Stadium_02_Alt",
		"Stroke_01",
		"Stroke_03",
		"TerminalPalace_00",
		"TerminalPalace_02",
		"TheSamePlace_00",
		"TheSamePlace_01",
		"TheSamePlace_02",
		"TheSamePlace_03",
		"TheSamePlace_04",
		"TheSamePlace_04_Alt",
		"TheSamePlace_05",
		"TheSamePlace_06",
		"TheSamePlace_07",
		"TheSamePlace_08",
		"TheSamePlace_09",
		"TheSamePlace_10",
		"TheSamePlace_11",
		"TheSamePlace_12",
		"TheSamePlace_13",
		"TheSamePlace_14",
		"Toilets_00",
		"Toilets_00_Alt",
		"WestVillage_04",
		"WestVillage_04_Alt",
		"valhalla_00",
		"valhalla_01",
		"valhalla_02",
		"valhalla_03",
		"valhalla_04",
		"valhalla_05",
	]
	
	let gameInfo = $state({});

	const responses = {
		[INCORRECT_STRING] : [
			"No", 
			"Nope",
			"Nuh-uh",
			"Nahhh", 
			"Hell no", 
			"What?!", 
			"Ain't no way",
			"Come on...",
			"Oof",
			"Euuuuuugh",
			"What da helly?",
			"You're better than this",
			"You're kidding, right?",
			"Yikes",
			"learn",
			"Yeah... no.",
		],
		[ALMOST_CORRECT_STRING] : [
			"Almost!", 
			"So close...", 
			"Getting warmer...", 
			"Not quite...",
		],
		[CORRECT_STRING] : [
			"Wow!", 
			"Good job!", 
			"Good boy!", 
			"You did it!", 
			"The GOAT!", 
			"Splendid!",
			"Nice!!!",
			"Correct!",
			"You're right!",
			"That's the one!",
			"HOLYYYYYYYY",
		]
	}

	function startNewGame() {
		gameInfo = {
			currentRound : 1,
			currentTry : 0,
			successfulRounds : 0,
			failedRounds : 0,
			currentDifficulty : EASY_STRING,
			currentScore : 0,
			roundOver : false,
			gameOver : false,
			guesses : (["", "", ""]),
			completedQuestions : {},
			currentQuestion: {}
		};

		loadPic();
	}

	async function loadPic() {
		loading = true;
		switch (gameInfo.currentDifficulty) {
			/*case EASY_STRING: rounds = import.meta.glob("$lib/images/screens/Easy/*.json"); break;
			case MEDIUM_STRING: rounds = import.meta.glob("$lib/images/screens/Medium/*.json"); break;
			case HARD_STRING: rounds = import.meta.glob("$lib/images/screens/Hard/*.json"); break;*/		
		}

		const urlsObj = await fetch('/fetch/pics');
		if (!urlsObj.ok) {
			console.error(urlsObj.statusText);
			return;
		}

		const rounds = await urlsObj.json();
		let fileURI = "";
		
		do {
			fileURI = rounds.urls[Math.floor(Math.random() * Object.keys(rounds.urls).length)];
		} while (fileURI in gameInfo.completedQuestions);
		currentImg = fileURI.substring(0, fileURI.lastIndexOf(".")) + ".jpg";
		let json = await fetch('/fetch/json?url=' + fileURI);
		gameInfo.currentQuestion = await json.json();
		gameInfo.currentQuestion.fileURI = fileURI;
		loading = false;
	}
	
	function createFloatingText(guessCategory, event) {		
		const buttonRect = event.target.getBoundingClientRect();
		const containerRect = event.target.closest('.guess-box').getBoundingClientRect();
		const top = buttonRect.top - containerRect.top;
		
		const id = Math.random();
		const possibleTexts = responses[guessCategory];

		const floatingText = possibleTexts[Math.floor(Math.random() * possibleTexts.length)];
		floatingTexts.push({id, top, text: floatingText});		

		setTimeout(() => {
			floatingTexts = floatingTexts.filter(t => t.id !== id);
			let failText = document.getElementById("failText");
			if (!failText) {
				return;
			}
			if (guessCategory === INCORRECT_STRING) {
				failText.style.color = "var(--incorrect)";
			} else if (guessCategory === ALMOST_CORRECT_STRING) {
				failText.style.color = "var(--almost-correct)";
			} else if (guessCategory === CORRECT_STRING) {
				failText.style.color = "var(--correct)";
			}
		}, 10);
	}

	function submitGuessKeyDown(event) {
		if (!gameInfo.guesses[gameInfo.currentTry]) {
			return;
		}
		submitGuess(event);
		// WTF???
		// TODO: Move on to next guessbox upon pressing Enter
		// let guessboxes = document.getElementById("guess" + gameInfo.currentTry);
		// guessboxes.focus();
	}

	function submitGuess(event) {
		let guess = gameInfo.guesses[gameInfo.currentTry];
		if (!guess) {
			return;
		}
		
		let guessboxes = document.getElementsByClassName("svelecte");		
		if (gameInfo.currentQuestion.correct.includes(guess)) {
			createFloatingText(CORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: var(--correct);";
			gameInfo.currentScore += 3 - gameInfo.currentTry;
			gameInfo.roundOver = true;
			setTimeout(() => {revealSolution = true}, 500);
			gameInfo.completedQuestions[gameInfo.currentQuestion.fileURI] = null;
			++gameInfo.successfulRounds;
			return;
		} else if (gameInfo.currentQuestion.correct.some((correctMap) => correctMap.indexOf(guess.substring(0, guess.indexOf('_'))) == 0)) {
			createFloatingText(ALMOST_CORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: var(--almost-correct);";
		} else {
			createFloatingText(INCORRECT_STRING, event);
			guessboxes[gameInfo.currentTry].style = "--sv-disabled-bg: var(--incorrect);";
		}
		if (gameInfo.currentTry < 2) {
			++gameInfo.currentTry;
			return;
		}
		gameInfo.roundOver = true;
		setTimeout(() => {revealSolution = true}, 500);
		gameInfo.completedQuestions[gameInfo.currentQuestion.fileURI] = null;
		++gameInfo.failedRounds;
	}

	function startNextRound() {
		revealSolution = false;
		if (gameInfo.currentRound + 1 > MAX_ROUNDS) {
			setTimeout(() => {
				gameInfo.gameOver = true;
			}, 200);
			return;
		}
		gameInfo.roundOver = false;
		++gameInfo.currentRound;
		gameInfo.currentTry = 0;		
		if (gameInfo.currentRound >= HARD_LIMIT_ROUND) {
			gameInfo.currentDifficulty = HARD_STRING;
		} else if (gameInfo.currentRound >= MEDIUM_START_ROUND) {
			gameInfo.currentDifficulty = MEDIUM_STRING;
		}
		resetGuessBoxes();
		loadPic();
	}

	function resetGuessBoxes() {
		gameInfo.guesses= ["", "", ""];
		let guessboxes = document.getElementsByClassName("svelecte");
		for (let box of guessboxes) {
			box.style = "";
		}
	}

	startNewGame();
</script>

<svelte:head>
	<title>STRAFTGUESSR ROUND {gameInfo.currentRound}/{MAX_ROUNDS}</title>
	<meta name="description" content="A STRAFTGUESSR game" />
</svelte:head>

<div class="game-box">
	<h1>WHAT STRAFTAT MAP IS THIS?</h1>
	<hr>
	{#if loading}
		<h2>Loading screenshot{loadingStringDots}</h2>
	{:else if !loading}
		<Lightbox enableClickToClose={true} showCloseButton={false}>
			<img src={currentImg} alt="Game screenshot" />
		</Lightbox>
	{/if}
	<hr>
	<h2>Round {gameInfo.currentRound}/{MAX_ROUNDS}<br>Difficulty: {gameInfo.currentDifficulty}</h2>

	<div class="guess-box">
		<Svelecte inputId="guess0" options={MAP_LIST} bind:value={gameInfo.guesses[0]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=0 || gameInfo.roundOver || gameInfo.gameOver} placeholder="1st Guess" />
		<Svelecte inputId="guess1" options={MAP_LIST} bind:value={gameInfo.guesses[1]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=1 || gameInfo.roundOver || gameInfo.gameOver} placeholder="2nd Guess" />
		<Svelecte inputId="guess2" options={MAP_LIST} bind:value={gameInfo.guesses[2]} onEnterKey={submitGuessKeyDown} disabled={gameInfo.currentTry!=2 || gameInfo.roundOver || gameInfo.gameOver} placeholder="3rd Guess" />
		{#each floatingTexts as t(t.id)}
			<div id="failFly" out:fly={{y: -100, duration: 2500}}>
				<div id="failText" out:fade={{duration: 7000}}>
				{t.text}
				</div>
			</div>
		{/each}
		<button id="guessButton" onclick={submitGuess} disabled={!gameInfo.guesses[gameInfo.currentTry] || gameInfo.roundOver || gameInfo.gameOver}>
			LOCK IN
		</button>
	</div>
	{#if revealSolution}
	<div class="game-box" use:draggable id="answer-box" in:fade out:fade>
		<h1>Answer:<br>{gameInfo.currentQuestion.correct}</h1>
		<hr>
		<h2>{gameInfo.currentQuestion.desc}</h2>
		<hr>
		<button id="nextRoundButton" onclick={startNextRound} disabled={gameInfo.revealEnding}>
			NEXT ROUND
		</button>
	</div>
	{/if}
	{#if gameInfo.gameOver}
	<div class="game-box" use:draggable id="answer-box" in:fade out:fade>
		<h1>Finished!</h1>
		<hr>
		<h2>You got {gameInfo.successfulRounds} out of {MAX_ROUNDS} questions right!<br>Your score: {gameInfo.currentScore}</h2>
		<hr>
		<button id="nextRoundButton" onclick={startNewGame}>
			NEW GAME
		</button>
	</div>
	{/if}
</div>

<style>	

:global(.svelecte) {
	--sv-bg: var(--black);
	--sv-disabled-bg: gray;
	--sv-control-bg: var(--black);
	--sv-border: 1px solid var(--straftat-green);
	--sv-dropdown-selected-bg: var(--black);
	--sv-dropdown-border: var(--straftat-green);
	--sv-dropdown-active-bg: var(--straftat-green);
	--sv-dropdown-active-border: var(--straftat-green);
	--sv-icon-color: var(--straftat-green);
	color-scheme: dark;
}

:global(.svelte-lightbox-main) {
	cursor: zoom-out;
}

h1 {
	margin: 1% 5%;
	font-size: 3rem;
}

@media (max-width: 720px) {
	h1 {
		font-size: 2rem;
	}
}

.game-box {
	display: flex;
	max-width: 90%;
	flex: 0.6;
	flex-direction: column;
	justify-content: center;
	margin: 0 auto;
	border-radius: 3%;
	border-color: var(--straftat-green);
	border-style: solid;
	border-width: thin;
}

.guess-box {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: 1% 30%;
}

#failFly {
	position: absolute;
	transform: translateX(-50%);
	left: 50%;
	margin-top: 80px;
	font-size: xx-large;
	-webkit-text-stroke: 0.06em black;
}

#answer-box {
	position: fixed;
	transform: translateX(-50%);
	left: 50%;
	width: 40%;
	border-radius: 8%;
	background-color: black;
	cursor: move;
	user-select: none;
}

</style>

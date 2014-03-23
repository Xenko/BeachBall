//Declare and Initialize Variables
var BeachBall = {};
BeachBall.incoming_ONG = 0;
BeachBall.Time_to_ONG = 1800000;
BeachBall.lootBoxes = ['boosts', 'badges', 'hpt', 'ninj', 'chron', 'cyb', 'bean', 'ceil', 'drac', 'stuff', 'land', 'prize', 'discov', 'monums', 'monumg', 'tagged', 'badgesav'];
BeachBall.resetCaged = 0;

//Version Information
BeachBall.version = '5.2.0';
BeachBall.SCBversion = '3.33333'; //Last SandCastle Builder version tested

//BB Audio Alerts Variables
BeachBall.audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	BeachBall.audio_Bell.volume = 1;
BeachBall.audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	BeachBall.audio_Chime.volume = 1;
BeachBall.RKAlertFrequency = 8;
if (Molpy.Got('Kitnip') == 1){BeachBall.RKAlertFrequency = 10;}
BeachBall.RKPlayAudio = 1;

//RK Variables
BeachBall.RKLevel = '-1';
BeachBall.RKLocation = '123';
BeachBall.RKNew = 1;
BeachBall.RKNewAudio = 1;
BeachBall.RKTimer = Molpy.Redacted.toggle - Molpy.Redacted.countup;

//Caged Logicat Variables
BeachBall.cagedTimeout = false;
BeachBall.cagedTimeoutLength = 5000;
BeachBall.Puzzle = {};

BeachBall.PuzzleConstructor = function(name) {
	this.name = name;
	BeachBall.Puzzle[name] = {}; // Creates empty object to ensure no conflicts with other versions
	BeachBall.Puzzle[name] = this;
	this.size = Molpy.PuzzleGens[name].guess.length;
	this.puzzleString = Molpy.PuzzleGens[name].StringifyStatements();
	this.statement = [];
	this.guess = [];
	this.error = false;
	this.answers = [];
	this.known = [];
	this.answered = [];
	this.unanswered = [];
	for (var i = 0; i < this.size; i++) {
		this.unanswered.push(i);
	}
	
	//Parses a single claim to extract name and value
	this.ParseClaim = function (claimText) {
		var claim = {};
		claim.name = claimText.substring(0,1);
		var i = claimText.indexOf("true");
		var j = claimText.indexOf("false");
		var k = claimText.indexOf("not");
		if ((i > 0 && k < 0) || j * k > 0)
			claim.value = true;
		else
			claim.value = false;
		claim.result = "unknown";
		return claim;
	}
	
	//Returns the index of a given statement name
	this.FindStatement = function (searchTerm) {
		for (var i = 0; i < this.statement.length; i++) {
			if (this.statement[i].name == searchTerm)
			{
				return i;
			}
		}
	}
	
	this.PopulateStatements = function() {
		var i = 0;
		var j = this.puzzleString.indexOf(">") + 1;
		var k = 0;
		var l = 0;
		var m = 0;
		var n = 0;
		do {
			// Creates a newStatement, and assigns it to the array
			var newStatement = {};
			this.statement[i] = newStatement;
			
			// Extracts the statement name from the text,
			newStatement.name = this.puzzleString.substring(j, j + 1);
			
			// Finds end index of claim(s), and saves that substring
			k = this.puzzleString.indexOf("<br>", j);
			newStatement.statementText = this.puzzleString.substring(j + 3, k);
			
			// Creates claims array
			newStatement.claim = [];
			
			// Parses statement text to extract all claims to claims array
			var text = newStatement.statementText;
			// Sets claim counter to 0 before entering loop
			var p = 0;
			
			// Does loop at least once, and repeats until AND or OR not present.
			do {
				var claimText = text;
				// Determines if more than one statement if AND or OR present
				l = text.indexOf("and");
				m = text.indexOf("or");
				
				// Sets statement condition (AND/OR) and index of claim end (n)
				if (l != -1) {
					claimText = text.substring(0, l);
					n = l + 4;
					newStatement.condition = "and";
				}
				else if (m != -1) {
					claimText = text.substring(0, m);
					n = m + 3;
					newStatement.condition = "or";
				}
				
				// Parses and assigns values to claims array
				newStatement.claim[p] = this.ParseClaim(claimText);

				// Updates variables and claim text for next loop
				text = text.substring(n, text.length);
				p++;
			} while (l > 0 || m > 0);
			
			// Sets statement value to default of Unknown
			newStatement.value = "unknown";
			
			// Updates j to the start of the next statement
			j = this.puzzleString.indexOf("</div>", k) + 10;
			i++;
		} while (i < this.size);
	}
	
	this.EvaluateStatementDependence = function() {
		// Cycles through every statement to evaluate dependence
		for (i in this.statement) {
			// Sets dependent default to false
			var dependent = false;
			
			// Goes through all claims in all statements except itself
			for (j in this.statement) {
				if (this.statement[i].name != this.statement[j].name) {
					for (k in this.statement[j].claim) {
					
						// If the claim name matches the examined statement's name, then it is a dependent statement.
						if (this.statement[i].name == this.statement[j].claim[k].name) {
							dependent = true;
							break;
						}
					}
				}
			}
			//Assigns dependency
			this.statement[i].dependent = dependent;
			if (dependent) this.EvaluateStatementRelevance(i);
		}
	}
	
	this.EvaluateStatementRelevance = function(index) {
		this.statement[index].relevance = false;
		for (i in this.statement[index].claim) {
			if (this.statement[index].claim[i].name != this.statement[index].name) {
				this.statement[index].relevance = true;
				break;
			}
		}
	}
	
	this.EvaluateKnownStatements = function() {
		for (i in this.statement) {
			var me = this.statement[i];
			
			// A: A is false OR claim 2; A must be true.
			if (me.condition == "or") {
				for (j in me.claim) {
					if (me.claim[j].name == me.name && me.claim[j].value == false) {
						this.CheckAssignment(i, true);
						this.known.push(parseInt(i));
						break;
					}
				}
			}
			
			// A: A is true AND A is false; A must be false.
			else if (me.condition == "and" && me.claim[0].name == me.name && me.claim[1].name == me.name && me.claim[0].value != me.claim[1].value) {
				this.CheckAssignment(i, false);
				this.known.push(parseInt(i));
			}
			
			// A: A is true OR A is false; A must be true.
			else if (me.condition == "and" && me.claim[0].name == me.name && me.claim[1].name == me.name && me.claim[0].value != me.claim[1].value) {
				this.CheckAssignment(i, true);
				this.known.push(parseInt(i));
			}
		}
	}
	
	this.CheckAssignment = function(index, bool) {
		index = parseInt(index);
		if (this.statement[index].value == "unknown") {
			this.statement[index].value = bool;
			var remove = this.unanswered.indexOf(index);
			this.unanswered.splice(remove,1);
			this.answered.push(index);
		}
		if (this.statement[index].value != bool) {
			this.error = true;
		}
	}
	
	this.EvaluateClaims = function() {
		// Change tracks if something has changed and is a return value
		// If a change is made, this function should be re-run to check for more evaluations.
		var change = false;
		// Go through each answered statement
		for (i in this.answered) {
			var index = this.answered[i];
			
			// Go through unanswered statements
			for (j in this.unanswered) {
				var index2 = this.unanswered[j];
				var me = this.statement[index2];
				for (k in me.claim) {
					//If a claim name matches answered statement
					if (me.claim[k].name == this.statement[index].name) {
						if (typeof me.condition == "undefined"){
							if (me.claim[k].value == this.statement[index].value) {
								this.CheckAssignment(index2, true);
							}
							else {
								this.CheckAssignment(index2, false);
							}
							if (!this.error) {
								change = true;
							}
						}
						else if (me.claim[k].result == "unknown") {
							//Set claim evaluation result
							if (me.claim[k].value == this.statement[index].value) {
								me.claim[k].result = true;
							}
							else {
								me.claim[k].result = false;
							}
							
							// Figure out which claim is k
							var m = 0;
							if (k == 0) {
								m = 1;
							}
							
							// If one claim is unknown and the other is self-referential, then evaluate if possible
							if (typeof me.claim[k].result == "boolean" && me.claim[m].name == me.name) {
								if (me.condition == "or" && me.claim[k].result == true) {
										this.CheckAssignment(index2, true);
									}
								else if (me.condition == "and" && me.claim[k].result == false) {
										this.CheckAssignment(index2, false);
									}
								if (!this.error) {
									change = true;
								}
							}
							// Otherwise evaluate AND statements if both results are known
							else if (me.claim[m].result != "unknown" && me.condition == "and") {
								if (me.claim[0].result && me.claim[1].result) {
									this.CheckAssignment(index2, true);
								}
								else {
									this.CheckAssignment(index2, false);
								}
								if (!this.error) {
									change = true;
								}
							}
							// Evaluate OR statements if both results are known
							else if (me.claim[m].result != "unknown") {
								if (me.claim[0].result || me.claim[1].result) {
									this.CheckAssignment(index2, true);
								}
								else {
									this.CheckAssignment(index2, false);
								}
								if (!this.error) {
									change = true;
								}
							}
						}
					}
				}
			}
		}
		return change;
	}
	
	this.GuessClaim = function(number) {
		var found = false;
		var index;
		for (i in this.unanswered) {
			index = parseInt(this.unanswered[i]);
			var me = this.statement[index];
			if (me.dependent && typeof me.condition == "undefined") {
				this.guess[number] = index;
				found = true;
				break;
			}
		}
		
		if (!found) {
			for (i in this.unanswered) {
				index = parseInt(this.unanswered[i]);
				var me = this.statement[index];
				if (me.dependent && me.condition == "and") {
					this.guess[number] = index;
					found = true;
					break;
				}
			}
		}
		
		if (!found) {
			for (i in this.unanswered) {
				index = parseInt(this.unanswered[i]);
				var me = this.statement[index];
				if (me.dependent && me.value == "unknown") {
					this.guess[number] = index;
					found = true;
					break;
				}
			}
		}
		
		//Set guess value
		if (found) {
			this.CheckAssignment(this.guess[number], true);
			this.AssignClaim(this.guess[number]);
		}
	}
	
	this.CheckAnswers = function() {
		var error = false;
		// Set all claim results
		for (var i = 0; i < this.statement.length; i++) {
			for (j in this.statement[i].claim) {
				var me = this.statement[i].claim[j]
				if (typeof me != "undefined") {
					var index = this.FindStatement(me.name);
					if (me.value == this.statement[index].value) {
						me.result = true;
					}
					else {
						me.result = false;
					}
				}
				else {
					console.log("Error with " + this.statement[i].name + " i: " + i + " and j: " + j);
				}
			}
		}
		
		// Evaluate all claims in statement (with condition) and checks answer against statement value
		for (k in this.statement) {
			var me = this.statement[k]
			var bool;
			if (typeof me.condition == "undefined" && me.claim[0].result != me.value) {
					error = true;
			}
			else if (me.condition == "or") {
				bool = me.claim[0].result || me.claim[1].result;
				if (bool != me.value) {
					error = true;
				}
			}
			else if (me.condition == "and") {
				bool = me.claim[0].result && me.claim[1].result;
				if (bool != me.value) {
					error = true;
				}
			}
		}
		if (error) {
			this.error = true;
		}
	}
	
	//Takes in the guess array index of the guess to be changed
	this.ChangeGuess = function() {
		var bool;
		var previousGuesses = [];
		for (i in this.guess) {
			var num = parseInt(i);
			bool = this.statement[this.guess[i]].value;
			previousGuesses[i] = bool;
		}
		
		// Resets all claim results and statement values to defaults
		// Repopulates unanswered array
		this.unanswered = [];
		for (i in this.statement) {
			var me = this.statement[i];
			// Reset all claim results to unknown
			for (j in me.claim) {
				me.claim[j].result = "unknown";
			}
			//Reset all statement values to unknown
			me.value = "unknown";
			this.unanswered.push(parseInt(i));
		}
		this.answered = [];
		this.error = false;
		number = this.guess.length - 1;
		
		//Re-evaluates known statements
		this.EvaluateKnownStatements();
		
		// Checks if it guess needs to roll back 1
		while  (previousGuesses[number] == false) {
			number--;
			this.guess.pop();
			previousGuesses.pop();
			// If number is now less than 0, no solution will be found by the program.
			if (number < 0) {
				this.error = true;
			}
		} 
		
		// Goes through the remaining Guess Array
		for (k = 0; k < this.guess.length; k++) {
			var me = this.guess[k];
			// If this is the guess to change, change it to false
			if (k == number) {
				bool = false;
			}
			// Otherwise set the earlier guesses back to true
			else {
				var bool = previousGuesses[parseInt(k)];
			}
			this.CheckAssignment(me, bool);
			this.AssignClaim(this.guess[parseInt(k)]);
		}
	}
	
	// Assigns statement values for claims of guessed statements
	this.AssignClaim = function(index) {
		var me = this.statement[index];
		var i;
		var k = 0;
		var bool;
		
		// If simple claim
		if (typeof me.condition == "undefined") {
			// Find statement named in claim
			i = this.FindStatement(me.claim[k].name);
			// Determine value of statement
			bool = me.claim[k].value
			if (!me.value) {
				bool = !bool;
			}
			//Assign statement
			this.CheckAssignment(i, bool);
		}
	}
	
	this.PrintAnswers = function() {
		for (i in this.statement) {
			console.log(this.statement[i].name + " is " + this.statement[i].value);
		}
	}
	
	this.LoadAnswers = function(puzzleType) {
		if (!this.error) {
			for (i = 0; i < this.size; i++) {
				var choice = 0;
				var text = "";
				if (this.statement[i].value == true) {
					choice = 1;
					text = "True";
				}
				else if (this.statement[i].value == false) {
					choice = 2;
					text = "False";
				}
				$('#selectGuess' + i).prop('selectedIndex', choice);
				Molpy.PuzzleGens[puzzleType].guess[i] = text;
			}
			if (BeachBall.Settings['CagedAutoClick'].status == 1 & puzzleType == "caged") {
				Molpy.PuzzleGens[puzzleType].Submit();
			}
			else {
				Molpy.PuzzleGens[puzzleType].Submit();
			}
		}
		else {
			Molpy.Notify('Program Error, No Solution Found', 0);
		}
	}
	
}

//Game Functions
BeachBall.SolveLogic = function(name) {
	// Checks if puzzle is active
	if (Molpy.PuzzleGens[name].active) {
		// Parses the Puzzle
		BeachBall.PuzzleConstructor(name);
		var me = BeachBall.Puzzle[name];
		me.PopulateStatements();
		me.EvaluateStatementDependence();
		
		//Searches for Statements that MUST have a given value (no guessing needed)
		me.EvaluateKnownStatements();
		
		//Guess a value for an unanswered dependent statement.
		me.GuessClaim(0);
		
		var i = 0;
		do {
			change = me.EvaluateClaims();
			i++;
			if (!change) {
				if (me.error) {
					me.ChangeGuess();
					change = true;
					if (me.error) {
						change = false;
					}
				}
				else if (me.answered.length == me.size) {
					me.CheckAnswers();
					if (me.error) {
						me.ChangeGuess();
						change = true;
						if (me.error) {
							change = false;
						}
					}
				}
				else if (me.unanswered.length > 0) {
					me.GuessClaim(me.guess.length);
					change = true;
				}
			}
		} while (i < 50 && change);

		me.CheckAnswers();
		me.LoadAnswers(name);
	}
}

BeachBall.CagedAutoClick = function() {
	//Purchases Caged Logicat
	//If Caged AutoClick is Enabled, and Caged Logicat isn't Sleeping and Caged Logicat isn't already purchased, and timeout not active
	var me = BeachBall.Settings['CagedAutoClick'];
	var meLC = BeachBall.Settings['LCSolver'];
	if (me.status > 0 && Molpy.Got("LogiPuzzle") > 1 && !Molpy.PuzzleGens["caged"].active && !BeachBall.cagedTimeout) {
		//Determines Logicat Cost, and if sufficient blocks available, caged logicat is purchased.
		var tens = Math.floor((Molpy.Boosts["LogiPuzzle"].Level - 1) / 10) * 10;
		var costSingle = 100 + Molpy.LogiMult(25);
		var costMulti = costSingle * tens;
		// Buy Single Puzzles
		if (me.status == 1 && Molpy.Has('GlassBlocks', costSingle)) {
			Molpy.MakeCagedPuzzle(costSingle);
		}
		// Buy Maximum Puzzles, or Singles if Max is less than 10
		else if (me.status == 2) {
			if (Molpy.PokeBar() >= 11 && Molpy.Level('LogiPuzzle') >= Molpy.PokeBar() && tens && Molpy.Has('GlassBlocks', costMulti)) {
				Molpy.MakeCagedPuzzle(costMulti, tens);
			}
			else if (Molpy.PokeBar() < 11) {
				Molpy.MakeCagedPuzzle(costSingle);
			}
		}
		// Trade Logicats for Bonemeal
		else if (me.status == 3 && Molpy.Got('ShadwDrgn') && Molpy.Level('LogiPuzzle') >= 100) {
			Molpy.ShadowStrike(1);
		}
	}

	//Caged Logicat Solver is always called, as this ensures both manually purchased and autoclick purchased will be solved
	//If a Caged Logicat Problem is Available, and the Logicat Solver is Enabled, and it hasn't been solved, Solve the Logicat
	if (Molpy.PuzzleGens["caged"].active && (me.status == 1 || me.status == 2 || meLC.status == 1) && Molpy.PuzzleGens["caged"].guess[0] == "No Guess") {
		BeachBall.SolveLogic("caged");
		// If there are more puzzles remaining, set the timeout to 5 seconds (prevents Notify spam/lag).
		if (Molpy.Got("LogiPuzzle") > 1) {
			BeachBall.cagedTimeout = true;
			BeachBall.cagedTimer = setTimeout(function(){BeachBall.cagedTimeout = false;}, BeachBall.cagedTimeoutLength);
		}
	}
}

BeachBall.FindRK = function() {
/*  RV of 1 is Sand Tools
	RV of 2 is Castle Tools
	RV of 3 is Shop
	RV of 4 is Boosts Menus, Hill People Tech, etc.
	RV of 5 is Badges Earned, Discovery, Monuments and Glass Monuments
	RV of 6 is Badges Available */
   
	//Determines RK location
	BeachBall.RKLocation = '123';
	if (Molpy.Redacted.location == 6) {
			BeachBall.RKLocation = 'badgesav';
	}
	else if (Molpy.Redacted.location > 3) {
			BeachBall.RKLocation = Molpy.redactedGr;
	}

	//Opens RK location
	BeachBall.ToggleMenus(BeachBall.RKLocation);
}

BeachBall.MontyHaul = function() {
	//If MHP Auto Click is Enabled
	if (BeachBall.Settings['MHAutoClick'].status != 0) {
		//If Monty Haul Problem is Unlocked
		if (Molpy.Boosts['MHP'].unlocked) {
			//If unpurchased and can afford, then buy and open Door A
			if (!Molpy.Got('MHP')) {
				var sp = Math.floor(Molpy.priceFactor * 100 * Math.pow(2, Math.max(1, Molpy.Boosts['MHP'].power - 9)), 1);
				var gp = 0;
				if (Molpy.IsEnabled('HoM')) {
					gp = Math.floor(Molpy.priceFactor * 100 * Math.pow(2, Math.max(1, Molpy.Boosts['MHP'].power - 15)), 1);
				}
				if (Molpy.Has('GlassBlocks', gp) && Molpy.Has('Sand', sp)) {
					Molpy.BoostsById[31].buy();
					Molpy.Monty('A');
				}
			}
			//Else If MHP already purchased
			else {
				//If User Wants a Goat
				if (BeachBall.Settings['MHAutoClick'].status == 2) {
					//If User Has Beret Guy, then Get Goat
					if (Molpy.Got('Beret Guy')) {
						Molpy.Monty(Molpy.Boosts['MHP'].goat);
					}
					//Otherwise open Door A
					else {
						Molpy.Monty('A');
					}
				}
				//Otherwise switch doors to try for a prize.
				else {
					//If the Goat is behind C, choose B
					if (Molpy.Boosts['MHP'].goat == 'C') {
						Molpy.Monty('B');
					}
					//Otherwise choose C
					else if (Molpy.Boosts['MHP'].goat == 'B') {
						Molpy.Monty('C');
					}
					else {
						Molpy.Monty('A');
					}
				}
			}
		}
	}
}

BeachBall.ClickBeach = function(number) {
	if (Molpy.Got('Temporal Rift') == 0 && Molpy.ninjad != 0 && BeachBall.Time_to_ONG >= 5){
		Molpy.ClickBeach();
	}
}

BeachBall.RiftAutoClick = function () {
	if (BeachBall.Settings['RiftAutoClick'].status == 0)
		return;
		
	switch (parseInt(BeachBall.Settings['RiftAutoClick'].status)) {
	
		case 1 : // farm crystals
			// check TL
			if (!(Molpy.Boosts['Time Lord'] && Molpy.Boosts['Time Lord'].bought && Molpy.Boosts['Time Lord'].power))
				return;
			var buttons =  $$('#logItems input[onclick="Molpy.RiftJump()"]'); // buttons to jump in the log
			if (buttons.length && !Molpy.Got('Temporal Rift'))
				Molpy.RiftJump();
			break;
			
		case 2 : // rift to ONG
			if (!(Molpy.Boosts['Time Lord'] && Molpy.Boosts['Time Lord'].bought && Molpy.Boosts['Time Lord'].power))
				return;
			if (Molpy.Got('Temporal Rift') && Molpy.Boosts['Sand'].Has(1) && (BeachBall.GetBeachState() == 'beachsafe')) // ninja click has passed, rift occuring, sand in stock
				Molpy.RiftJump();
			break;
	}
}

BeachBall.GetBeachState = function () {
	var stateClass = 'beachsafe';
	if(!Molpy.ninjad) {
		if(Molpy.npbONG)
			stateClass = 'beachstreakextend';
		else
			stateClass = 'beachninjawarning';
	}
	return stateClass;
}

BeachBall.Ninja = function() {
    //Molpy.ninjad is 0 when you can't click, and stays 0 until you extend streak, when it turns to 1
	//Molpy.npbONG is 0 when you can't click, and 1 when you can click

	if (Molpy.ninjad == 0) {
		if ((BeachBall.Settings['BeachAutoClick'].status == 3) && (Molpy.Got('Temporal Rift') == 0)) {
			Molpy.ClickBeach();
			Molpy.Notify('Ninja Ritual Auto Click', 1);
		}
        if (Molpy.npbONG != 0) {
            BeachBall.incoming_ONG = 0;
            if (BeachBall.Settings['BeachAutoClick'].status > 0 && Molpy.Got('Temporal Rift') == 0) {
				Molpy.ClickBeach();
				Molpy.Notify('Ninja Auto Click', 1);
				if (BeachBall.resetCaged == 1) {
					BeachBall.Settings['CagedAutoClick'].status = 1;
					BeachBall.resetCaged = 0;
				}
			}
			/*If the Caged Logicats are essentially infinite in number (thus Temporal Rift is always active)
			 *the autoclicker needs to be paused to allow temporal rift to end to process the click, then resumed*/
			else if (BeachBall.Settings['BeachAutoClick'].status > 0 && Molpy.Got('Temporal Rift') == 1 && BeachBall.Settings['CagedAutoClick'].status == 1) {
				//Turn Off Caged AutoClicker, and set variable to reset it after click.
				BeachBall.Settings['CagedAutoClick'].status = 0;
				BeachBall.resetCaged = 1;
			}
        }
	}
    else if (BeachBall.Time_to_ONG <= 15) {
        if (BeachBall.incoming_ONG == 0 && BeachBall.Settings['AudioAlerts'].status > 2) {
			BeachBall.audio_Chime.play();
			BeachBall.incoming_ONG = 1;
        }  
    }
}

BeachBall.PlayRKAlert = function() {
	//If proper mNP and hasn't yet played this mNP (can happen if refresh Rate < mNP length)
	if (Math.floor(BeachBall.RKTimer % BeachBall.RKAlertFrequency) == 0 && BeachBall.RKPlayAudio == 1) {
		BeachBall.audio_Bell.play();
		BeachBall.RKPlayAudio = 0;
	}
	//Otherwise reset played this mNP
	else {
		BeachBall.RKPlayAudio = 1;
	}
}

BeachBall.RedundaKitty = function() {
	var meRK = BeachBall.Settings['RKAutoClick'];
	var meLC = BeachBall.Settings['LCSolver'];
    BeachBall.RKTimer = Molpy.Redacted.toggle - Molpy.Redacted.countup;
	//If there is an active RK
	if (Molpy.Redacted.location > 0) {
		//Update the title, and determine the RK level
		document.title = "! kitten !";
		BeachBall.RKLevel = Molpy.Redacted.location - 1;
		
		//If RKAutoClick is Selected
		if (meRK.status == 2) {
			//If it is a Logicat, Solve and Submit
			if (Molpy.PuzzleGens["redacted"].active) {
				BeachBall.SolveLogic("redacted");
			}
			//Otherwise, click the Redundakitty 
			else {
				Molpy.Redacted.onClick(BeachBall.RKLevel);
			}
		}
		//Otherwise if Find RK is selected, find the RK
		else if (meRK.status == 1) {
			BeachBall.FindRK();
		}
		
		else if (meLC.status == 1) {
			BeachBall.SolveLogic("redacted");
		}
		
		//If the RK is visible, then highlight it
		if ($('#redacteditem').length) {
			$('#redacteditem').css("border","2px solid red");
		}
		
		//If RK Audio Alert Enabled, Play Alert
		if (BeachBall.Settings['AudioAlerts'].status == 1 || BeachBall.Settings['AudioAlerts'].status == 4){
			BeachBall.PlayRKAlert();
		}
		// If LC Audio Alert Enabled and LC is available, Play Alert
		else if (BeachBall.Settings['AudioAlerts'].status == 2 && Molpy.Redacted.DrawType[Molpy.Redacted.DrawType.length-1] == 'hide2') {
			BeachBall.PlayRKAlert();
		}
	}
	
	//If no RK active, update title Timer. Reset audio alert variable.
	else {
		document.title = BeachBall.RKTimer;
		BeachBall.RKPlayAudio = 0;
	}
}

BeachBall.ToggleMenus = function(wantOpen) {
	//for (var i in BeachBall.lootBoxes) {
	//var me = BeachBall.lootBoxes[i];
	for (i=0, len = BeachBall.lootBoxes.length; i < len; i++) {
		//If the current Box should be open
		if (BeachBall.lootBoxes[i] == wantOpen) {
			//If it isn't opened, open it.
			if (!Molpy.activeLayout.lootVis[BeachBall.lootBoxes[i]]) {
				Molpy.ShowhideToggle(BeachBall.lootBoxes[i]);
			}
		}
		//If the current Box should be closed
		else {
			//If it is open, then close it
			if (Molpy.activeLayout.lootVis[BeachBall.lootBoxes[i]]) {
				Molpy.ShowhideToggle(BeachBall.lootBoxes[i]);
			}
		}
	}
}

BeachBall.FavsAutoclick = {};

BeachBall.ChooseAutoclick = function () {
	var selectedFave = Molpy.selectedFave;
	if (selectedFave == 'None') 
		return;
	if (Molpy.activeLayout.faves[selectedFave].boost == 0) {
		Molpy.Notify('You need to set a favorite first.', 0);
		return;
	}
	var buttons = $$ ? $$("#sectionFave"+selectedFave+" input[type=Button]") : [];
	
	if (buttons.length == 0) {
		Molpy.Notify('This favorite has no button to click !', 0);
		return;
	}
	
	
	// cps and click per second handling
	var speed = prompt('How shouw it be clicked ?\nType "X cps" or "Xcps" for X click per second.\nType "X s" or "Xs" for 1 click every X second.');
	if (speed === null) { // unasign the fav
		if (BeachBall.FavsAutoclick[selectedFave] && BeachBall.FavsAutoclick[selectedFave].timer)
			BeachBall.ToggleAutoclickFav(selectedFave,false); // we turn it off first
		BeachBall.FavsAutoclick[selectedFave] = null;
		Molpy.Notify('Favorite asignation for '+Molpy.activeLayout.faves[selectedFave].boost.name+' has been removed', 1);
		BeachBall.SaveAutoclickFav();
		return;
	}
	var speed_el = speed.replace(/\s/,"").replace(/,/,".").match(/^(\d+)(\w+)$/i);
	
	// kicking out the bad inputs
	if ((!speed_el) || (speed_el.length != 3)) {
		Molpy.Notify('No assignation done : time format was not valid', 0);
		return;
	}
	speed_el[1] = parseFloat(speed_el[1]);
	if (isNaN(speed_el[1]) || speed_el[1] == 0){
		Molpy.Notify('No assignation done : time value was not valid', 0);
		return;
	}
	
	var period = speed_el[2] == "s" ?
		speed_el[1]*1000
		: 1000/speed_el[1];
	
	
	if (buttons.length > 1) {
		// preparing the prompt to choose for the right favorite button
		var promptText = "There is multiple buttons on this favorite :\n";
		
		for (var index = 0; index < buttons.length; index++) {
			promptText += (index+1) + " : " + buttons[index].value + "\n";
		}
		promptText += "Input the number that is in front of the button you want clicked."
		var choice = prompt(promptText);
		// kicking out bad inputs
		switch (choice) {
			case "0" :
			case null : 
				Molpy.Notify('No assignation done : no choice was made', 0);
				return;
			default : choice = parseInt(choice);
		}
		if (isNaN(choice) || choice == 0) {
			Molpy.Notify('No assignation done : choice was not valid', 0);
			return;
		}
			
		choice --;
	} else {
		var choice = 0; // only 1 choice
	}
	
	if (BeachBall.FavsAutoclick[selectedFave] && BeachBall.FavsAutoclick[selectedFave].timer)
		window.clearInterval(BeachBall.FavsAutoclick[selectedFave].timer);
		
	BeachBall.FavsAutoclick[selectedFave] = {
		fave : selectedFave,
		choice : choice,
		period : period,
		speed : speed,
		timer : 0
	}
	
	BeachBall.ToggleAutoclickFav(selectedFave,false);
	Molpy.Notify('AutoclickFav created for '+Molpy.activeLayout.faves[selectedFave].boost.name+' at '+speed, 1);
	Molpy.Notify('Click on its timer in the Favorite to disable.', 1);
	BeachBall.SaveAutoclickFav();
}

BeachBall.ToggleAutoclickFav = function(fav,shown) {
	var me = BeachBall.FavsAutoclick[fav];
	if (me.timer) {
		window.clearInterval(me.timer);
		me.timer = 0;
	} else {
		me.timer = window.setInterval(BeachBall.getAutoClickFav(fav),me.period)
	}
	BeachBall.SaveAutoclickFav();
	if (shown)
		Molpy.Notify('Autoclick Favorite '+Molpy.activeLayout.faves[fav].boost.name+' toggled : '+(me.timer ? 'activated, '+me.speed : 'disabled'), 1);
}

BeachBall.getAutoClickFav = function (fav_to_auto) {
	return (function (_fav) {
		return function(){
			var me = BeachBall.FavsAutoclick[_fav];
			if (me.timer) {
				var buttons = $$ ? $$("#sectionFave"+me.fave+" input[type=Button]") : [];
				if (buttons && buttons[me.choice] && (typeof(buttons[me.choice].click) == 'function'))
					buttons[me.choice].click();
			}
		}
	})(fav_to_auto);
}

BeachBall.ImplantAutoclickFavButtons = function () {
	for (fav in BeachBall.FavsAutoclick) {
		var me = BeachBall.FavsAutoclick[fav];
		if (me && me.period && ($$ ? $$("#faveHeader"+fav+" h1") : false)) 
			if ($$("#faveHeader"+fav+" h1 .BB_autoclick").length == 0){
				$$("#faveHeader"+fav+" h1")[0].innerHTML= $$("#faveHeader"+fav+" h1")[0].innerHTML +"<a class='BB_autoclick' onclick='BeachBall.ToggleAutoclickFav(\""+fav+"\",true)' "+(me.timer ? "" : "style='text-decoration:line-through' ")+">[ "+me.speed+" ]</a>";
			} else {
				$($$("#faveHeader"+fav+" h1 .BB_autoclick")[0]).first().css('text-decoration',me.timer ? '' : 'line-through');
			}
	}
}

BeachBall.LoadAutoclickFav = function() {
	BeachBall.FavsAutoclick = localStorage['BB.FavsAutoclick'] ? JSON.parse(localStorage['BB.FavsAutoclick']) : {};
	for (fav in BeachBall.FavsAutoclick) {
		var me = BeachBall.FavsAutoclick[fav];
		if (me && me.timer) {// if there was an active timer when the save occured
			me.timer = 0;
			BeachBall.ToggleAutoclickFav(fav,false);
		}
	}
}

BeachBall.SaveAutoclickFav = function() {
	localStorage['BB.FavsAutoclick'] = JSON.stringify(BeachBall.FavsAutoclick);
}

//Menus and Settings
BeachBall.CheckToolFactory = function() {
	if (Molpy.Boosts['TF'].bought) {
		BeachBall.DisplayDescription('ToolFactory');
		Molpy.Notify('Tool Factory Option Now Available!', 1);
	}
	else {
		Molpy.Notify('Tool Factory is still unavailable... keep playing!', 1);
	}
}

BeachBall.LoadToolFactory = function() {
	if (Molpy.Boosts['TF'].bought == 1) 
		Molpy.LoadToolFactory(BeachBall.Settings['ToolFactory'].setting);
}

BeachBall.CreateMenu = function() {

	if ((window.location.pathname == "/classic.html") && (g('sectionOptions') != null)) { // patch for option height in classic
		g('sectionOptions').style['height'] = '236px';
		g('sectionOptions').style['overflow-y'] = 'scroll';
		
	}
	for (var i = Molpy.OptionsById.length-1; i >= 0; i--)
		if (EvalMaybeFunction(Molpy.OptionsById[i].visability) > 0) {
			Molpy.OptionsById[i].breakafter = true;
			break;
		}
	
	new Molpy.Option({
		name: 'BB.title',
		title: '<h3 style="font-size:150%; color:red">BeachBall Settings</h3> ',		
		breakafter : true,
		text: function() { return '<h4 style"font-size:75%">v ' + BeachBall.version + '</div>' },
	});
	
	//Replace with Loop!
	for (var i = 0; i < BeachBall.AllOptions.length; i++) {
		var option = BeachBall.AllOptions[i];
		var me = BeachBall.Settings[option];
		new Molpy.Option({
			name: 'BB.'+option,
			title: me.title,
			range: me.maxStatus+1,
			onchange: (function(_option) {return function() { BeachBall.SwitchStatus(_option);}})(option),
			text: (function(_option) {return function() { return BeachBall.DisplayDescription(_option,'desc') }})(option)
		});
	}
	
	Molpy.RefreshOptions();
	
	//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRK()"> <h4>Spawn RK</h4> </a></div>');
	//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRift()"> <h4>Spawn Rift</h4> </a></div>');
	//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.Temp()"> <h4>Extend RK</h4> </a></div>');
	
	//Developer Functions
	BeachBall.SpawnRK = function() {
		Molpy.redactedCountup = Molpy.redactedToggle;
	}

	BeachBall.SpawnRift = function() {
		Molpy.GiveTempBoost('Temporal Rift', 1, 5);;
	}

	BeachBall.Temp = function() {
		Molpy.redactedToggle = 600;
	}
	
	$('#faveControls').append('<div id="autoclickFave" class="minifloatbox"><a onclick="BeachBall.ChooseAutoclick()">AutoClick</a></div>');
}

BeachBall.DisplayDescription = function(option,type) {
// console.log(option);
	var me = BeachBall.Settings[option];
	// var me = option;
	description = me.desc[me.status];
	
	if (option == 'BeachAutoClick') {
		clearInterval(BeachBall.BeachAutoClickTimer);
		if (me.status >= 2) {
			BeachBall.BeachAutoClickTimer = setInterval(BeachBall.ClickBeach, 1000/me.setting);
		}
	}
	var title = me.title;
	if (option == 'ToolFactory') {
		if (Molpy.Boosts['TF'].bought == 1) {
			title = '<a onclick="BeachBall.LoadToolFactory()">Tool Factory</a>';
			description = 'Amount to load : <a onclick="BeachBall.SwitchSetting(\'ToolFactory\')" title="Click to change me !">' + me.setting + ' chips</a><br/>Click option title to load.';
		}
		else {
			title = '<h4>Tool Factory Locked</h4><div id="ToolFactoryDesc"></div>';
			description = 'Factory locked... <a onclick="BeachBall.CheckToolFactory()">Check Again!!</a>';
		}
	}
	if (!type && g('BBToolFactory')) {
		g('BBToolFactory').innerHTML = title;
		g(option + 'Desc').innerHTML = '<br>' + description;
	}
	if (type == 'desc')
		return description;
	if (type == 'title')
		return title;
}

BeachBall.LoadDefaultSetting = function (option, key) {
	if (option == 'AudioAlerts') {
		if (key == 'title')		{return 'Audio Alerts';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 4;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'RK Only', 'LC Only', 'ONG Only', 'All Alerts'];}
	}
	else if (option == 'BeachAutoClick') {
		if (key == 'title')		{return 'Beach AutoClick';}
		if (key == 'status') 	{return 1;}
		if (key == 'maxStatus') {return 3;}
		if (key == 'setting')	{return 1;}
		if (key == 'minSetting'){return 1;}
		if (key == 'maxSetting'){return 20;}
		if (key == 'msg')		{return 'Please enter your desired clicking rate per second (1 - 20):';}
		if (key == 'desc')		{return ['Off', 'Keep Ninja', 'On: <a onclick="BeachBall.SwitchSetting(\'BeachAutoClick\')">' + BeachBall.Settings[option].setting + ' cps</a>','On: <a onclick="BeachBall.SwitchSetting(\'BeachAutoClick\')">' + BeachBall.Settings[option].setting + ' cps</a><br/>(with ninja ritual)'];}
	}
	else if (option == 'CagedAutoClick') {
		if (key == 'title')		{return 'Caged Logicat AutoClick';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 3;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'Solve Single', 'Solve Max', 'Get Bonemeal'];}
	}
	else if (option == 'LCSolver') {
		if (key == 'title')		{return 'Logicat Solver';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 1;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'On'];}
	}
	
	else if (option == 'MHAutoClick') {
		if (key == 'title')		{return 'Monty Haul AutoClick';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 2;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'On - Prize', 'On - Goat'];}
	}
	else if (option == 'RefreshRate') {
		if (key == 'title')		{return 'Refresh Rate';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 0;}
		if (key == 'setting')	{return 1000;}
		if (key == 'minSetting'){return 500;}
		if (key == 'maxSetting'){return Molpy.NPlength;}
		if (key == 'msg')		{return 'Please enter your desired refresh rate in milliseconds (500 - 3600):';}
		if (key == 'desc')		{return [BeachBall.Settings[option].setting];}
	}
	else if (option == 'RKAutoClick') {
		if (key == 'title')		{return 'Redundakitty AutoClick';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 2;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'Find RK', 'On'];}
	}
	else if (option == 'ToolFactory') {
		if (key == 'title')		{return 'Tool Factory';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 1;}
		if (key == 'setting')	{return 1000;}
		if (key == 'minSetting'){return 1;}
		if (key == 'maxSetting'){return Infinity;}
		if (key == 'msg')		{return 'Tool Factory Loading:';}
		if (key == 'desc')		{return ['Off', BeachBall.Settings[option].setting];}
	}
	else if (option == 'RiftAutoClick') {
		if (key == 'title')		{return 'Rift Autoclick';}
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 2;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'On - Flux Cristal', 'On - ONG'];}
	}
	else {
		Molpy.Notify(BeachBall.Settings[option] + ' setting not found. Please contact developer.', 1);
		return -1;
	}
}

BeachBall.LoadSettings = function() {
	BeachBall.AllOptions = [ 'AudioAlerts', 'BeachAutoClick', 'CagedAutoClick', 'LCSolver', 'MHAutoClick', 'RefreshRate', 'RKAutoClick', 'ToolFactory','RiftAutoClick'];
	BeachBall.AllOptionsKeys = ['title', 'status', 'maxStatus', 'setting', 'minSetting', 'maxSetting', 'msg', 'desc'];
	BeachBall.SavedOptionsKeys = ['status', 'setting'];
	BeachBall.Settings = {};
	
	if(typeof(Storage) !== 'undefined') {
		// Yes! localStorage and sessionStorage support!
		BeachBall.storage = 1;
		
		/*Remove deprecated storage keys if found
		if (typeof localStorage['BB.LCSolver.status'] == 'string') {
			localStorage.removeItem('BB.LCSolver.status');
		}*/
	}

	for (i = 0; i < BeachBall.AllOptions.length; i++) {
		var option = BeachBall.AllOptions[i];
		BeachBall.Settings[option] = {};
		for (j=0; j < BeachBall.AllOptionsKeys.length; j++){
			var key = BeachBall.AllOptionsKeys[j];
			//Molpy.Notify('Option: ' + option + ' Key: ' + key, 1);
			if (BeachBall.storage == 1 && localStorage['BB.'+ option + '.' + key]) {
				BeachBall.Settings[option][key] = localStorage['BB.'+ option + '.' + key];
			}
			else {
				BeachBall.Settings[option][key] = BeachBall.LoadDefaultSetting(option, key);
			}
		}
	}	
}

BeachBall.SwitchSetting = function(option) {
	var me = BeachBall.Settings[option];
	var newRate = parseInt(prompt(me.msg, me.setting));
	if (newRate < me.minSetting || newRate > me.maxSetting || isNaN(newRate)) {
		Molpy.Notify('Invalid Entry.');
	}
	else {
		me.setting = newRate;
		if (BeachBall.storage == 1) {
			localStorage['BB.'+ option + '.setting'] = me.setting;
		}
		me.desc = BeachBall.LoadDefaultSetting(option, 'desc');
		BeachBall.DisplayDescription(option);
	}
}

BeachBall.SwitchStatus = function(option) {
	var me = BeachBall.Settings[option];
		me.status++;
		if (me.status > me.maxStatus) {
			me.status = 0;
		}
		if (option == 'ToolFactory')
			BeachBall.LoadToolFactory();
		
	/*if ((option == 'RKAutoClick' && me.status == 2) || (option == 'CagedAutoClick' && me.status == 1)) {
		BeachBall.Settings['LCSolver'].status = 1;
		if (BeachBall.storage == 1) {
			localStorage['BB.LCSolver.status'] = 1;
		}
		BeachBall.DisplayDescription('LCSolver', 1);
	}
	
	else if (option == 'LCSolver' && me.status == 0 && BeachBall.Settings['CagedAutoClick'].status == 1) {
		me.status = 1;
		Molpy.Notify('Logicat solver must stay on while Logicat AutoClicker enabled', 0);
	} Deprecated */
	
	if (BeachBall.storage == 1) {
		localStorage['BB.'+ option + '.status'] = me.status;
	}
	BeachBall.DisplayDescription(option, me.status);
}

BeachBall.AddImplants = function () {
	BeachBall.ImplantAutoclickFavButtons();
}

BeachBall.SpyRefresh = function () {
	Molpy.UpdateFaves = (function (_update){
		return function (force) {
			_update(force);
			BeachBall.AddImplants();
		}
	})(Molpy.UpdateFaves);
}

//Main Program and Loop
function BeachBallMainProgram() {
	//Molpy.Notify('Tick', 0);
	BeachBall.Time_to_ONG = Molpy.NPlength - Molpy.ONGelapsed/1000;
	BeachBall.RedundaKitty();
	BeachBall.CagedAutoClick();
	BeachBall.Ninja();
	BeachBall.MontyHaul();
	BeachBall.RiftAutoClick();
	BeachBall.StartLoop();
}

BeachBall.StartLoop = function () {
	BeachBall.Timeout = setTimeout(typeof($$) == 'undefined' ? BeachBall.StartLoop : BeachBallMainProgram, BeachBall.Settings['RefreshRate'].setting);
}

BeachBall.StartProgram = function() {
	//Program Startup
	BeachBall.LoadSettings();
	BeachBall.LoadAutoclickFav();
	BeachBall.CreateMenu();
	BeachBall.SpyRefresh();
	Molpy.Notify('BeachBall version ' + BeachBall.version + ' loaded for SandCastle Builder version ' + BeachBall.SCBversion, 1);
	if (BeachBall.storage == 0) {
		Molpy.Notify('No Local Storage Available. BeachBall settings will NOT be saved.',1);
	}
	BeachBall.StartLoop();
}

BeachBall.StartProgram();

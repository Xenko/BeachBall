//Declare and Initialize Variables
var BeachBall = {};
BeachBall.incoming_ONG = 0;
BeachBall.Time_to_ONG = 1800000;
BeachBall.lootBoxes = ['boosts', 'stuff', 'ninj', 'cyb', 'hpt', 'bean', 'chron', 'ceil', 'drac', 'badges', 'discov', 'badgesav', 'monums', 'monumg', 'tagged'];

//Version Information
BeachBall.version = '4.0';
BeachBall.SCBversion = '3.251'; //Last SandCastle Builder version tested

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
BeachBall.RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;

//Game Functions
BeachBall.CagedLogicat = function() {
	var i = 65;
	var LCSolution = 'A';
	do 
		{LCSolution = String.fromCharCode(i);
		i++;}
	while (Molpy.cagedPuzzleTarget != Molpy.cagedSGen.StatementValue(LCSolution));
	Molpy.ClickCagedPuzzle(LCSolution);
}

BeachBall.ClickBeach = function(number) {
	//Check Ninja Streak check for a failed streak
	if (Molpy.Got('Temporal Rift') == 0 && Molpy.ninjad != 0 && BeachBall.Time_to_ONG >= 5){
		Molpy.ClickBeach();
	}
}

BeachBall.CagedAutoClick = function() {
	//Purchases Caged Logicat
	//If Caged AutoClick is Enabled, and Caged Logicat isn't Sleeping and Caged Logicat isn't already purchased
	if (BeachBall.Settings['CagedAutoClick'].status == 1 && Molpy.Got('Caged Logicat') > 1 && Molpy.Boosts['Caged Logicat'].power == 0) {
		//Determines Logicat Cost, and if sufficient blocks available, caged logicat is purchased.
		cost = 100 + Molpy.LogiMult(25);
		if (Molpy.Has('GlassBlocks', cost)) {
			Molpy.MakeCagedPuzzle(cost);
			BeachBall.CagedLogicat();
		}
	}

	//Caged Logicat Solver is always called, as this ensures both manually purchased and autoclick purchased will be solved
	//Can now define solving conditions other than availability (to maximize Temporal Duplication for instance).
	//If a Caged Logicat Problem is Available, and the Logicat Solver is Enabled, Solve the Logicat
	if (Molpy.cagedPuzzleTarget != "" && BeachBall.Settings['LCSolver'].status == 1) {
		BeachBall.CagedLogicat();
	}
}

BeachBall.FindRK = function() {
/*	RV of 1 is Sand Tools
	RV of 2 is Castle Tools
	RV of 3 is Shop
	RV of 4 is Boosts Menus, Hill People Tech, etc.
	RV of 5 is Badges Earned, Discovery, Monuments and Glass Monuments
	RV of 6 is Badges Available */
	
	//Determines RK location
	BeachBall.RKLocation = '123';
	if (Molpy.redactedVisible == 6) {
		BeachBall.RKLocation = 'badgesav';
	}
	else if (Molpy.redactedVisible > 3) {
		BeachBall.RKLocation = Molpy.redactedGr;
	}

	//Opens RK location
	BeachBall.ToggleMenus(BeachBall.RKLocation);
}

BeachBall.MontyHaul = function() {
	//Check if can afford to prevent possible issues.
	if (BeachBall.Settings['MHAutoClick'].status == 1) {
		//If Monty Haul Problem is Unlocked
		if (Molpy.Boosts['MHP'].unlocked) {
			//If unpurchased and can afford, then buy
			if (!Molpy.Got('MHP')) {
				var sp = Math.floor(Molpy.priceFactor * EvalMaybeFunction(Molpy.Boosts['MHP'].sandPrice, Molpy.Boosts['MHP'], 1));
				var gp = Math.floor(Molpy.priceFactor * EvalMaybeFunction(Molpy.Boosts['MHP'].glassPrice, Molpy.Boosts['MHP'], 1));
				if (Molpy.Has('GlassBlocks', gp) && Molpy.Has('Sand', sp)) {
					Molpy.BoostsById[31].buy();
				}
			}
			
			//If purchased, open Door A
			else {
			Molpy.Monty('A');
			}
		}
	}
}

BeachBall.Ninja = function() {
    //Molpy.ninjad is 0 when you can't click, and stays 0 until you extend streak, when it turns to 1
	//Molpy.npbONG is 0 when you can't click, and 1 when you can click

	if (Molpy.ninjad == 0) {
        if (Molpy.npbONG != 0) {
            BeachBall.incoming_ONG = 0;
            if (BeachBall.Settings['BeachAutoClick'].status > 0 && Molpy.Got('Temporal Rift') == 0) {
				Molpy.ClickBeach();
				Molpy.Notify('Ninja Auto Click', 1);
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
		Molpy.Notify('Alert Played', 0);
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
	BeachBall.RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;
	//If there is an active RK
	if (Molpy.redactedVisible > 0) {
		//Update the title, and determine the RK level
		document.title = "! kitten !";
		BeachBall.RKLevel = Molpy.redactedDrawType.length - 1;
		
		//If RKAutoClick is Selected or the Logicat Solver is turned on
		if (meRK.status == 2 || meLC == 1) {
			//If it is a Logicat, then solve it.
			if (Molpy.redactedDrawType[Molpy.redactedDrawType.length-1] == 'hide2') {
				BeachBall.SolveLogicat();
			}
			//Otherwise, if the RK AutoClick is on, click the Redundakitty 
			else if (meRK.status == 2) {
				Molpy.ClickRedacted(BeachBall.RKLevel);
			}
		}
		//Otherwise if Find RK is selected, find the RK
		else if (meRK.status == 1) {
			BeachBall.FindRK();
		}
		
		//If the RK is visible, then highlight it
		if ($('#redacteditem').length) {
			$('#redacteditem').css("border","2px solid red");
		}
		
		//If RK Audio Alert Enabled, Play Alert
		if (BeachBall.Settings['AudioAlerts'].status == 1 || BeachBall.Settings['AudioAlerts'].status == 4){
			Molpy.Notify('Play RK Alert Called', 1);
			BeachBall.PlayRKAlert();
		}
	}
	
	//If no RK active, update title Timer. Reset audio alert variable.
	else {
		document.title = BeachBall.RKTimer;
		BeachBall.RKPlayAudio = 0;
	}
}

BeachBall.SolveLogicat = function() {
	var i = 65;
	var LCSolution = 'A';
	do 
		{LCSolution = String.fromCharCode(i);
		i++;}
	while (Molpy.redactedPuzzleTarget != Molpy.redactedSGen.StatementValue(LCSolution));
	Molpy.ClickRedactedPuzzle(LCSolution);
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


//Menus and Settings
BeachBall.CheckToolFactory = function() {
	if (Molpy.Got('Tool Factory')) {
		BeachBall.DisplayDescription('ToolFactory');
		Molpy.Notify('Tool Factory Option Now Available!', 1);
	}
	else {
		Molpy.Notify('Tool Factory is still unavailable... keep playing!', 1);
	}
}

BeachBall.CreateMenu = function() {
	//Create Menu
	$('#optionsItems').append('<div id="BeachBall"></div>');
	$('#BeachBall').append('<div class="minifloatbox"> <h3 style="font-size:150%; color:red">BeachBall Settings</h3> <h4 style"font-size:75%">v ' + BeachBall.version + '</div> <br>');
	$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchStatus(\'RKAutoClick\')"> <h4>Redundakitty AutoClick</h4> </a> <div id="RKAutoClickDesc"></div></div>');
	$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchStatus(\'CagedAutoClick\')"> <h4>Caged Logicat AutoClick</h4> </a> <div id="CagedAutoClickDesc"></div></div>');
	$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchStatus(\'LCSolver\')"> <h4>Logicat Solver</h4> </a> <div id="LCSolverDesc"></div></div>');
	$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchStatus(\'BeachAutoClick\')"> <h4>Beach AutoClick</h4> </a> <div id="BeachAutoClickDesc"></div></div>');
	$('#BeachBall').append('<div class="minifloatbox" id="BBMontyHaul"> <a onclick="BeachBall.SwitchStatus(\'MHAutoClick\')"> <h4>Monty Haul AutoClick</h4> </a> <div id="MHAutoClickDesc"></div></div>');
	$('#BeachBall').append('<div class="minifloatbox" id="BBToolFactory"> <a onclick="Molpy.LoadToolFactory(' + BeachBall.toolFactory + ')"> <h4>Load Tool Factory</h4> </a> <div id="ToolFactoryDesc"></div></div>');
	$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchStatus(\'AudioAlerts\')"> <h4>Audio Alerts</h4> </a> <div id="AudioAlertsDesc"></div></div>');
	$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchSetting(\'RefreshRate\')"> <h4>Refresh Rate</h4> </a> <div id="RefreshRateDesc"></div></div>');
	//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRK()"> <h4>Spawn RK</h4> </a></div>');
	//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRift()"> <h4>Spawn Rift</h4> </a></div>');
	//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.ToggleMenus(\'ninj\')"> <h4>Open Ninja Tab</h4> </a></div>');
	
	//Replace with Loop!
	for (var i = 0; i < BeachBall.AllOptions.length; i++) {
		var option = BeachBall.AllOptions[i];
		BeachBall.DisplayDescription(option);
	}

	//Developer Functions
	BeachBall.SpawnRK = function() {
		Molpy.redactedCountup = Molpy.redactedToggle;
	}

	BeachBall.SpawnRift = function() {
		Molpy.GiveTempBoost('Temporal Rift', 1, 5);;
	}

	BeachBall.Temp = function() {
		Molpy.redactedCountup = 0;
	}
}

BeachBall.DisplayDescription = function(option) {
	var me = BeachBall.Settings[option];
	description = me.desc[me.status];
	
	if (option == 'BeachAutoClick') {
		clearInterval(BeachBall.BeachAutoClickTimer);
		if (me.status == 2) {
			BeachBall.BeachAutoClickTimer = setInterval(BeachBall.ClickBeach, 1000/me.setting);
		}
	}
	
	if (option == 'ToolFactory') {
		if (Molpy.Got('Tool Factory') == 1) {
			g('BBToolFactory').innerHTML = '<a onclick="Molpy.LoadToolFactory(' + me.setting + ')"> <h4>Load Tool Factory</h4> </a> <div id="ToolFactoryDesc"></div>';
			description = 'Load: <a onclick="BeachBall.SwitchSetting(\'ToolFactory\')">' + me.setting + ' chips</a>';
		}
		else {
			g('BBToolFactory').innerHTML = '<h4>Tool Factory Locked</h4><div id="ToolFactoryDesc"></div>';
			description = '<a onclick="BeachBall.CheckToolFactory()">Check Again!!</a>';
		}
	}
	
	g(option + 'Desc').innerHTML = '<br>' + description;
}

BeachBall.LoadDefaultSetting = function (option, key) {	
	if (option == 'AudioAlerts') {
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 4;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'RK Only', 'LC Only', 'ONG Only', 'All Alerts'];}
	}
	else if (option == 'BeachAutoClick') {
		if (key == 'status') 	{return 1;}
		if (key == 'maxStatus') {return 2;}
		if (key == 'setting')	{return 1;}
		if (key == 'minSetting'){return 1;}
		if (key == 'maxSetting'){return 20;}
		if (key == 'msg')		{return 'Please enter your desired clicking rate per second (1 - 20):';}
		if (key == 'desc')		{return ['Off', 'Keep Ninja', 'On: <a onclick="BeachBall.SwitchSetting(\'BeachAutoClick\')">' + BeachBall.Settings[option].setting + ' cps</a>'];}
	}
	else if (option == 'CagedAutoClick') {
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 1;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'On'];}
	}
	else if (option == 'LCSolver') {
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 1;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'On'];}
	}
	else if (option == 'MHAutoClick') {
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 1;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'On'];}
	}
	else if (option == 'RefreshRate') {
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 0;}
		if (key == 'setting')	{return 1000;}
		if (key == 'minSetting'){return 500;}
		if (key == 'maxSetting'){return Molpy.NPlength;}
		if (key == 'msg')		{return 'Please enter your desired refresh rate in milliseconds (500 - 3600):';}
		if (key == 'desc')		{return [BeachBall.Settings[option].setting];}
	}
	else if (option == 'RKAutoClick') {
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 2;}
		if (key == 'setting')	{return 0;}
		if (key == 'desc')		{return ['Off', 'Find RK', 'On'];}
	}
	else if (option == 'ToolFactory') {
		if (key == 'status') 	{return 0;}
		if (key == 'maxStatus') {return 1;}
		if (key == 'setting')	{return 1000;}
		if (key == 'minSetting'){return 1;}
		if (key == 'maxSetting'){return Infinity;}
		if (key == 'msg')		{return 'Tool Factory Loading:';}
		if (key == 'desc')		{return ['Off', BeachBall.Settings[option].setting];}
	}
	else {
		Molpy.Notify(BeachBall.Settings[option] + ' setting not found. Please contact developer.', 1);
		return -1;
	}
}

BeachBall.LoadSettings = function() {
	BeachBall.AllOptions = [ 'AudioAlerts', 'BeachAutoClick', 'CagedAutoClick', 'LCSolver', 'MHAutoClick', 'RefreshRate', 'RKAutoClick', 'ToolFactory'];
	BeachBall.AllOptionsKeys = ['status', 'maxStatus', 'setting', 'minSetting', 'maxSetting', 'msg', 'desc'];
	BeachBall.SavedOptionsKeys = ['status', 'setting'];
	BeachBall.Settings = {};
	
	if(typeof(Storage) !== 'undefined') {
		// Yes! localStorage and sessionStorage support!
		BeachBall.storage = 1;
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
		
	if ((option == 'RKAutoClick' && me.status == 2) || (option == 'CagedAutoClick' && me.status == 1)) {
		BeachBall.Settings['LCSolver'].status = 1;
		if (BeachBall.storage == 1) {
			localStorage['BB.LCSolver.status'] = 1;
		}
		BeachBall.DisplayDescription('LCSolver', 1);
	}
	
	else if (option == 'LCSolver' && me.status == 0 && BeachBall.Settings['CagedAutoClick'].status == 1) {
		me.status = 1;
		Molpy.Notify('Logicat solver must stay on while Logicat AutoClicker enabled', 0);
	}
	if (BeachBall.storage == 1) {
		localStorage['BB.'+ option + '.status'] = me.status;
	}
	BeachBall.DisplayDescription(option, me.status);
}


//Main Program and Loop
function BeachBallMainProgram() {
	//Molpy.Notify('Tick', 0);
	BeachBall.Time_to_ONG = Molpy.NPlength - Molpy.ONGelapsed/1000;
	BeachBall.RedundaKitty();
	BeachBall.CagedAutoClick();
	BeachBall.Ninja();
	BeachBall.MontyHaul();
	BeachBallLoop();
}

function BeachBallLoop() {
	BeachBall.Timeout = setTimeout(BeachBallMainProgram, BeachBall.Settings['RefreshRate'].setting);
}

//Program Startup
BeachBall.LoadSettings();
BeachBall.CreateMenu();
Molpy.Notify('BeachBall version ' + BeachBall.version + ' loaded for SandCastle Builder version ' + BeachBall.SCBversion, 1);
if (BeachBall.storage == 0) {
	Molpy.Notify('No Local Storage Available. BeachBall settings will NOT be saved.',1);
}
BeachBallLoop();
//Declare and Initialize Variables
var BeachBall = {};
BeachBall.incoming_ONG = 0;
BeachBall.Time_to_ONG = 1800000;
BeachBall.lootBoxes = ['boosts', 'ninj', 'cyb', 'hpt', 'bean', 'chron', 'ceil', 'drac', 'badges', 'discov', 'badgesav', 'monums', 'monumg', 'tagged'];

//Version Information
BeachBall.version = '4.0 Beta';
BeachBall.SCBversion = '3.242'; //Last SandCastle Builder version tested

//BB Options Variables
BeachBall.AudioAlertsStatus = 0;
BeachBall.audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	BeachBall.audio_Bell.volume = 1;
BeachBall.audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	BeachBall.audio_Chime.volume = 1;
BeachBall.BeachAutoClickCPS = 1;
BeachBall.BeachAutoClickStatus = 1;
BeachBall.CagedAutoClickStatus = 0;
BeachBall.description = "Error";
BeachBall.LCSolverStatus = 0;
BeachBall.MHAutoClickStatus = 0;
BeachBall.toolFactory = 1000;
BeachBall.refreshRate = 1000;
BeachBall.RKAlertFrequency = 8;
BeachBall.RKAutoClickStatus = 0;
BeachBall.RKPlayAudio = 1;

//RK Variables
BeachBall.start = -1;
BeachBall.content = "empty";
BeachBall.len = 0;
BeachBall.RKLevel = '-1';
BeachBall.RKLocation = '123';
BeachBall.RKNew = 1;
BeachBall.RKNewAudio = 1;
BeachBall.RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;

//Testing New Settings Method
BeachBall.AllOptions = ['BeachAutoClick', 'LCSolver', 'MHAutoClick', 'RKAutoClick', 'AudioAlerts'];
BeachBall.AllOptionsKeys = ['status','setting'];
BeachBall.Settings = {};

//Test Setting Options
/*for (i = 0; i < BeachBall.AllOptions.length; i++) {
	var option = BeachBall.AllOptions[i];
	BeachBall.Settings[option] = {};
	for (j=0; j < BeachBall.AllOptionsKeys.length; j++){
		var key = BeachBall.AllOptionsKeys[j];
		BeachBall.Settings[option][key] = i + '' + j;
		localStorage['BB.'+ option + '.' + key] = i + '' + j;
	}
}*/


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
	if (Molpy.Got('Temporal Rift') == 0 && Molpy.ninjad != 0 && BeachBall.Time_to_ONG >= 5){
		Molpy.ClickBeach();
	}
}

BeachBall.CagedAutoClick = function() {
//Purchases Caged Logicat
	//If Caged AutoClick is Enabled, and Caged Logicat isn't Sleeping and Caged Logicat isn't already purchased
	if (BeachBall.CagedAutoClickStatus == 1 && Molpy.Got('Caged Logicat') > 1 && Molpy.Boosts['Caged Logicat'].power == 0) {
		//Determines Logicat Cost, and if sufficient blocks available, caged logicat is purchased.
		cost = 100 + Molpy.LogiMult(25);
		if (Molpy.HasGlassBlocks(cost)) {
			Molpy.MakeCagedPuzzle(cost);
			BeachBall.CagedLogicat();
		}
	}
	
//Caged Logicat Solver is always called, as this ensures both manually purchased and autoclick purchased will be solved
//Can now define solving conditions other than availability (to maximize Temporal Duplication for instance).
	//If a Caged Logicat Problem is Available, and the Logicat Solver is Enabled, Solve the Logicat
	if (Molpy.Boosts['Caged Logicat'].power == 1 && BeachBall.LCSolverStatus == 1) {
		BeachBall.CagedLogicat();
	}
}

BeachBall.DisplayDescription = function(option, status) {
	var error = 0;
	var description = 'error';
	if (option == 'AudioAlerts') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'RK Only'; BeachBall.RKPlayAudio = 1;}
		else if (status == 2) {description = 'LC Only'; BeachBall.RKPlayAudio = 1;}
		else if (status == 3) {description = 'ONG Only';}
		else if (status == 4) {description = 'All Alerts'; BeachBall.RKPlayAudio = 1;}
		else {Molpy.Notify('Display Description Error - Audio Alerts: ' + status, 1);}
	}
	else if (option == 'BeachAutoClick') {
		if (status == 0) {
			description = 'Off';
			clearInterval(BeachBall.BeachAutoClickTimer);}
		else if (status == 1) {
			description = 'Keep Ninja';
			clearInterval(BeachBall.BeachAutoClickTimer);}
		else if (status == 2) {
			description = 'On: <a onclick="BeachBall.SwitchOption(\'BeachAutoClickRate\')">' + BeachBall.BeachAutoClickCPS + ' cps</a>';
			clearInterval(BeachBall.BeachAutoClickTimer);
			BeachBall.BeachAutoClickTimer = setInterval(BeachBall.ClickBeach, 1000/BeachBall.BeachAutoClickCPS);}
		else {Molpy.Notify('Display Description Error - BeachAutoClick: ' + status, 1);}
	}
	else if (option == 'CagedAutoClick' || option == 'LCSolver' || option == 'MHAutoClick') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'On';}
		else {Molpy.Notify('Display Description Error - ' + option + ': ' + status, 1);}
	}
	else if (option == 'RKAutoClick') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'Find RK Only'; BeachBall.RKNew = 1;}
		else if (status == 2) {description = 'On'; BeachBall.RKNew = 1;}
		else {Molpy.Notify('Display Description Error - RKAutoClick: ' + status, 1);}
	}
	else if (option == 'RefreshRate') {
		description = BeachBall.refreshRate;
	}
	else if (option == 'ToolFactory') {
		if (Molpy.Got('Tool Factory') == 1) {
			g('BBToolFactory').innerHTML = '<a onclick="Molpy.LoadToolFactory(' + status + ')"> <h4>Load Tool Factory</h4> </a> <div id="ToolFactoryDesc"></div>';
			description = 'Load: <a onclick="BeachBall.SwitchOption(\'ToolFactory\')">' + status + ' chips</a>';
		}
		else {
			g('BBToolFactory').innerHTML = '<h4>Tool Factory Locked</h4><div id="ToolFactoryDesc"></div>';
			description = '<a onclick="BeachBall.CheckToolFactory()">Check Again!!</a>';
		}
	}
	else {
		Molpy.Notify(option + ' is not a valid option.', 1);
		error = 1;
	}
		
	if (error == 0) {g(option + 'Desc').innerHTML = '<br>' + description;}
}

BeachBall.FindRK = function() {
	/*
	RV of 1 is Sand Tools
	RV of 2 is Castle Tools
	RV of 3 is Boosts Main Page
	RV of 4 is Boosts Menus, Hill People Tech, etc.
	RV of 5 is Badges Earned, Discovery, Monuments and Glass Monuments
	RV of 6 is Badges Available
	*/
	
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
	
	if (BeachBall.MHAutoClickStatus == 1) {
		//If Monty Haul Problem is Unlocked
		if (Molpy.Boosts['MHP'].unlocked) {
		
			//If unpurchased, then buy
			if (!Molpy.Got('MHP')) {
				Molpy.BoostsById[31].buy();
			}
			
			//If purchased, open Door A
			else {
			Molpy.Monty('A');
			}
		}
	}
}

BeachBall.Ninja = function() {
    if (Molpy.ninjad == 0) {
        if (Molpy.npbONG != 0) {
            BeachBall.incoming_ONG = 0;
            if (BeachBall.BeachAutoClickStatus > 0 && Molpy.Got('Temporal Rift') == 0) {
				Molpy.ClickBeach();
				Molpy.Notify('Ninja Auto Click', 1);
			}
        }
	}
    else if (BeachBall.Time_to_ONG <= 15) {
        if (BeachBall.incoming_ONG == 0 && (BeachBall.AudioAlertsStatus == 3 || BeachBall.AudioAlertsStatus == 4)) {
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
	//If there is an active RK
	if (Molpy.redactedVisible > 0) {
		//Update the title, and determine the RK level
		document.title = "! kitten !";
		BeachBall.RKLevel = Molpy.redactedDrawType.length - 1;
		
		//If RKAutoClick is Selected or the Logicat Solver is turned on
		if (BeachBall.RKAutoClickStatus == 2 || BeachBall.LCSolverStatus == 1) {
			//If it is a Logicat, then solve it.
			if (Molpy.redactedDrawType[Molpy.redactedDrawType.length-1] == 'hide2') {
				BeachBall.SolveLogicat();
			}
			//Otherwise, if the RK AutoClick is on, click the Redundakitty 
			else if (BeachBall.RKAutoClickStatus == 2) {
				Molpy.ClickRedacted(BeachBall.RKLevel);
			}
		}
		//Otherwise if Find RK is selected, find the RK
		else if (BeachBall.RKAutoClickStatus == 1) {
			BeachBall.FindRK();
		}
		
		//If the RK is visible, then highlight it
		if ($('#redacteditem').length) {
			$('#redacteditem').css("border","2px solid red");
		}
		
		//If RK Audio Alert Enabled, Play Alert
		if (BeachBall.AudioAlertsStatus == 1 || BeachBall.AudioAlertsStatus == 4){
			BeachBall.PlayRKAlert();
		}
	}
	
	//If no RK active, update title Timer. Reset audio alert variable.
	else {
		BeachBall.RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;
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

BeachBall.SwitchOption = function(option) {
	var status = 99;
	switch (option) {
		case 'RKAutoClick':
			BeachBall.RKAutoClickStatus++;
			if (BeachBall.RKAutoClickStatus > 2) {BeachBall.RKAutoClickStatus = 0;}
			status = BeachBall.RKAutoClickStatus;
			//When AutoClick turned on, checks to make sure that Logicat solver is turned on. If not, it turns it on.
			if (status == 2) {
				if (BeachBall.LCSolverStatus == 0) {
					BeachBall.LCSolverStatus = 1;
					BeachBall.DisplayDescription('LCSolver', BeachBall.LCSolverStatus);
				}
			}
			break;
		case 'CagedAutoClick':
			BeachBall.CagedAutoClickStatus++;
			if (BeachBall.CagedAutoClickStatus > 1) {BeachBall.CagedAutoClickStatus = 0;}
			status = BeachBall.CagedAutoClickStatus;
			//When AutoClick turned on, checks to make sure that Logicat solver is turned on. If not, it turns it on.
			if (status == 1) {
				if (BeachBall.LCSolverStatus == 0) {
					BeachBall.LCSolverStatus = 1;
					BeachBall.DisplayDescription('LCSolver', BeachBall.LCSolverStatus);
				}
			}
			break;
			
		case 'LCSolver':
			if (BeachBall.CagedAutoClickStatus == 0) {
				BeachBall.LCSolverStatus++;
				if (BeachBall.LCSolverStatus > 1) {BeachBall.LCSolverStatus = 0;}
				status = BeachBall.LCSolverStatus;
			}
			else {
				status = 1;
				Molpy.Notify('Logicat solver must stay on while Logicat AutoClicker enabled', 0);
			}
			break;
			
		case 'BeachAutoClick':
			BeachBall.BeachAutoClickStatus++;
			if (BeachBall.BeachAutoClickStatus > 2) {BeachBall.BeachAutoClickStatus = 0;}
			status = BeachBall.BeachAutoClickStatus;
			break;
			
		case 'BeachAutoClickRate':
			var newRate = parseInt(prompt('Please enter your desired clicking rate per second (1 - 20):', BeachBall.BeachAutoClickCPS));
			if (newRate < 1 || newRate > 20 || isNaN(newRate)){
				Molpy.Notify('Invalid Clicking Rate', 1);
			}
			else {
				BeachBall.BeachAutoClickCPS = newRate;
			}
			option = 'BeachAutoClick';
			status = 2;
			break;
			
		case 'AudioAlerts':
			BeachBall.AudioAlertsStatus++;
			if (BeachBall.AudioAlertsStatus > 4) {BeachBall.AudioAlertsStatus = 0;}
			status = BeachBall.AudioAlertsStatus;
			break;
			
		case 'RefreshRate':
			var newRate = parseInt(prompt('Please enter your desired BeachBall refresh rate in milliseconds (500 - 3600):', BeachBall.refreshRate));
			if (newRate < 500 || newRate > 3600 || isNaN(newRate)){
				Molpy.Notify('Invalid Refresh Rate', 1);
			}
			else {
				BeachBall.refreshRate = newRate;
			}
			break;
			
		case 'MHAutoClick':
			BeachBall.MHAutoClickStatus++;
			if (BeachBall.MHAutoClickStatus > 1) {BeachBall.MHAutoClickStatus = 0;}
			status = BeachBall.MHAutoClickStatus;
			break;
			
		case 'ToolFactory':
			var newRate = parseInt(prompt('Tool Factory Loading:', BeachBall.toolFactory));
			if (isNaN(newRate)){
				Molpy.Notify('Invalid Tool Factory Loading', 1);
				status = BeachBall.toolFactory;
			}
			else {
				BeachBall.toolFactory = newRate;
				status = newRate;
			}
			break;
	}
	BeachBall.DisplayDescription(option, status);
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

BeachBall.CheckToolFactory = function() {
	if (Molpy.Got('Tool Factory')) {
		BeachBall.DisplayDescription('ToolFactory', BeachBall.toolFactory);
		Molpy.Notify('Tool Factory Option Now Available!', 1);
	}
	else {
		Molpy.Notify('Tool Factory is still unavailable... keep playing!', 1);
	}
}

BeachBall.LoadSettings = function() {
	if(typeof(Storage)!== 'undefined') {
		// Yes! localStorage and sessionStorage support!
		BeachBall.storage = 1;
		for (i = 0; i < BeachBall.AllOptions.length; i++) {
			var option = BeachBall.AllOptions[i];
			BeachBall.Settings[option] = {};
			for (j=0; j < BeachBall.AllOptionsKeys.length; j++){
				var key = BeachBall.AllOptionsKeys[j];
				if (localStorage['BB.'+ option + '.' + key]) {
					BeachBall.Settings[option][key] = localStorage['BB.'+ option + '.' + key];
				}
				else {
					BeachBall.Settings[option][key] = -99;
				}
			}
		}	
	}
	else {
		// Sorry! No web storage support..
		BeachBall.storage = 0;
		Molpy.Notify('No Local Storage Available. Setting can NOT be saved or loaded.',1);
	}
}

BeachBall.SaveToStorage = function() {
	if (BeachBall.storage == 1) {

	}
}

//Beach Ball Startup
//Set Settings
if (Molpy.Got('Kitnip') == 1){BeachBall.RKAlertFrequency = 10;}

//Create Menu
$('#optionsItems').append('<div id="BeachBall"></div>');
$('#BeachBall').append('<div class="minifloatbox"> <h3 style="font-size:150%; color:red">BeachBall Settings</h3> <h4 style"font-size:75%">v ' + BeachBall.version + '</div> <br>');
$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'RKAutoClick\')"> <h4>Redundakitty AutoClick</h4> </a> <div id="RKAutoClickDesc"></div></div>');
$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'CagedAutoClick\')"> <h4>Caged Logicat AutoClick</h4> </a> <div id="CagedAutoClickDesc"></div></div>');
$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'LCSolver\')"> <h4>Logicat Solver</h4> </a> <div id="LCSolverDesc"></div></div>');
$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'BeachAutoClick\')"> <h4>Beach AutoClick</h4> </a> <div id="BeachAutoClickDesc"></div></div>');
$('#BeachBall').append('<div class="minifloatbox" id="BBMontyHaul"> <a onclick="BeachBall.SwitchOption(\'MHAutoClick\')"> <h4>Monty Haul AutoClick</h4> </a> <div id="MHAutoClickDesc"></div></div>');
$('#BeachBall').append('<div class="minifloatbox" id="BBToolFactory"> <a onclick="Molpy.LoadToolFactory(' + BeachBall.toolFactory + ')"> <h4>Load Tool Factory</h4> </a> <div id="ToolFactoryDesc"></div></div>');
$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'AudioAlerts\')"> <h4>Audio Alerts</h4> </a> <div id="AudioAlertsDesc"></div></div>');
$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'RefreshRate\')"> <h4>Refresh Rate</h4> </a> <div id="RefreshRateDesc"></div></div>');
//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRK()"> <h4>Spawn RK</h4> </a></div>');
//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRift()"> <h4>Spawn Rift</h4> </a></div>');
//$('#BeachBall').append('<div class="minifloatbox"> <a onclick="BeachBall.ToggleMenus(\'ninj\')"> <h4>Open Ninja Tab</h4> </a></div>');
BeachBall.DisplayDescription('RKAutoClick', BeachBall.RKAutoClickStatus);
BeachBall.DisplayDescription('CagedAutoClick', BeachBall.CagedAutoClickStatus);
BeachBall.DisplayDescription('LCSolver', BeachBall.LCSolverStatus);
BeachBall.DisplayDescription('BeachAutoClick', BeachBall.BeachAutoClickStatus);
BeachBall.DisplayDescription('AudioAlerts', BeachBall.AudioAlertsStatus);
BeachBall.DisplayDescription('RefreshRate', BeachBall.refreshRate);
BeachBall.DisplayDescription('MHAutoClick', BeachBall.MHAutoClickStatus);
BeachBall.DisplayDescription('ToolFactory', BeachBall.toolFactory);

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

//Main Program and Loop
function BeachBallMainProgram() {
	//Molpy.Notify(BeachBall.refreshRate, 0);
	//BeachBall.BeachAutoClick();
	BeachBall.Time_to_ONG = Molpy.NPlength - Molpy.ONGelapsed/1000;
	BeachBall.RedundaKitty();
	BeachBall.CagedAutoClick();
	BeachBall.Ninja();
	BeachBall.MontyHaul();
	BeachBallLoop();
}

function BeachBallLoop() {
	BeachBall.Timeout = setTimeout(BeachBallMainProgram, BeachBall.refreshRate);
}

//Program Startup
Molpy.Notify('BeachBall version ' + BeachBall.version + ' loaded for SandCastle Builder version ' + BeachBall.SCBversion, 1);
//BeachBall.LoadSettings();
BeachBallLoop();
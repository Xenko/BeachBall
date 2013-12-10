//Declare and Initialize Variables
var BeachBall = {};
BeachBall.incoming_ONG = 0;
BeachBall.Time_to_ONG = 1800000;
BeachBall.lootBoxes = ['boosts', 'ninj', 'cyb', 'hpt', 'bean', 'chron', 'ceil', 'drac', 'badges', 'discov', 'badgesav', 'monums', 'monumg', 'tagged'];

//Version Information
BeachBall.version = '4.0 Beta';
BeachBall.SCBversion = '3.234'; //Last SandCastle Builder version tested

//BB Options Variables
BeachBall.AudioAlertsStatus = 0;
BeachBall.audio_Bell = new Audio("http://xenko.comxa.com/Ship_Bell.mp3");
	BeachBall.audio_Bell.volume = 1;
BeachBall.audio_Chime = new Audio("http://xenko.comxa.com/Chime.mp3");
	BeachBall.audio_Chime.volume = 1;
BeachBall.BeachAutoClickCPS = 1;
BeachBall.BeachAutoClickStatus = 1;
BeachBall.CagedAutoClickStatus = 0;
BeachBall.ClickRemainder = 0;
BeachBall.description = "Error";
BeachBall.LCSolverStatus = 0;
BeachBall.toolFactory = 1000;
BeachBall.refreshRate = 1000;
BeachBall.RKAlertFrequency = 8;
BeachBall.RKAutoClickStatus = 1;
BeachBall.RKPlayAudio = 1;

//RK Variables
BeachBall.start = -1;
BeachBall.content = "empty";
BeachBall.len = 0;
BeachBall.Logicat = 0;
BeachBall.oldRKLocation = -1;
BeachBall.oldRC = Molpy.redactedClicks - 1;
BeachBall.oldLC = Molpy.Boosts['Logicat'].power - 1;
BeachBall.RKLevel = '-1';
BeachBall.RKLocation = '123';
BeachBall.RKNew = 1;
BeachBall.RKNewAudio = 1;
BeachBall.RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;

//Autoclicks the Beach
BeachBall.BeachAutoClick = function() {
	clicks = 0;
	wholeClicks = 0;
	//If the auto clicker is enabled
	if (BeachBall.BeachAutoClickStatus == 2 && Molpy.ninjad != 0 && BeachBall.Time_to_ONG >= 5) {
		//Calculates number of clicks to process this tick
		clicks = BeachBall.BeachAutoClickCPS*BeachBall.refreshRate/1000 + BeachBall.ClickRemainder;
		//If > 1, process whole clicks this tick, save the remainder for the next tick.
		if (clicks >= 1) {
			wholeClicks = Math.floor(clicks);
			BeachBall.ClickRemainder = clicks - wholeClicks;
			BeachBall.ClickBeach(wholeClicks);
		}
		//If < 1, save for next tick
		else {
			BeachBall.ClickRemainder = clicks;
		}
	}
}

BeachBall.ClickBeach = function(number) {
	if (Molpy.Got('Temporal Rift') == 0){
		for (i = 0; i < number; i++) {
			Molpy.ClickBeach();
		}
	}
	else {
		Molpy.Notify('Temporal Rift Active, AutoClicking Disabled', 1);
	}
}

BeachBall.CagedAutoClick = function() {
	if (BeachBall.CagedAutoClickStatus == 1 && Molpy.Got('Caged Logicat') > 1) {
		Molpy.Notify('Caged AutoClick On and Caged Logicat Available', 1);
	}
}

BeachBall.Ninja = function() {
    if (Molpy.ninjad == 0) {
        if (Molpy.npbONG != 0) {
            BeachBall.incoming_ONG = 0;
            if (BeachBall.BeachAutoClickStatus > 0) {
				BeachBall.ClickBeach(1);
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
	
	//Resets old RK variables
	BeachBall.oldRKLocation = Molpy.redactedVisible;
	BeachBall.oldRC = Molpy.redactedClicks;
	BeachBall.oldLC = Molpy.Boosts['Logicat'].power;
}

BeachBall.RedundaKitty = function() {
	var content = '';
	//Refresh Timer Variable
	BeachBall.RKTimer = Molpy.redactedToggle - Molpy.redactedCountup;
	
	//If a RedundaKitty is active
	if (Molpy.redactedVisible > 0) {
	
		//Checks if RK is new
		if (BeachBall.RKNew == 1 || Molpy.redactedVisible != BeachBall.oldRKLocation || Molpy.redactedClicks > BeachBall.oldRC || Molpy.Boosts['Logicat'].power != BeachBall.oldLC) {
			BeachBall.RKNewAudio = 1;
			BeachBall.RKNew = 0;
			//Finds RK if AutoClick Enabled
			if (BeachBall.RKAutoClickStatus > 0) {	
				BeachBall.FindRK();
			}
		}
		
		//Determines if it is an RK or LC
		//If RK is visible
		if ($('#redacteditem').length) {
			$('#redacteditem').css("border","2px solid red"); //Highlights RK
			content = $('#redacteditem').html();
			//If RK contains word statement, it is a LC.
			if (content.indexOf("statement") !== -1) {
				BeachBall.Logicat = 1;
			}
			//Otherwise it is an RK
			else {
				BeachBall.Logicat = 0;
				start = content.indexOf("Show");
				if (start != -1) {
					content = content.substring(start+15,start+38);
					content = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
					len = content.length;
					BeachBall.RKLevel = content.substring(18,len);
					//Molpy.Notify('RedundaKitty Level is: ' + RKLevel, 1);
				}
				else {
					start = content.indexOf("iframe src=");
					content = content.substring(start-40,start-16);
					content = content.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
					len = content.length;
					BeachBall.RKLevel = content.substring(18,len);
					//Molpy.Notify('YT RedundaKitty Level is: ' + RKLevel, 1);
				}
			}
		}
		//If RK not visible, LC to 99.
		else {
			BeachBall.Logicat = 99;
		}

		//Clicks RK if AutoClick Enabled
		if (BeachBall.RKAutoClickStatus == 2 && BeachBall.Logicat == 0 ) {
			Molpy.ClickRedacted(BeachBall.RKLevel);
			//Molpy.Notify('Level ' + BeachBall.RKLevel + ' RK Clicked in ' + BeachBall.RKLocation + '.', 1);
			BeachBall.RKNew = 1;
			BeachBall.RKLocation = '123';
			BeachBall.ToggleMenus('123');
		}
		//Solves LC if AutoClick enabled
		else if (BeachBall.Logicat == 1 && (BeachBall.LCSolverStatus == 1 || BeachBall.LCSolverStatus == 3)) {
			BeachBall.SolveLogicat();
			//Molpy.Notify('LC Clicked in ' + BeachBall.RKLocation + '.', 1);
			BeachBall.RKNew = 1;
			BeachBall.RKLocation = '123';
			BeachBall.ToggleMenus('123');
		}

		//Redundakitty Notifications for Manual Clicking (Title Bar, Audio)
		else {	
			document.title = "! kitten !";
			//If RK Audio Alerts Enabled
			if ((BeachBall.AudioAlertsStatus == 1 || BeachBall.AudioAlertsStatus == 4) && BeachBall.Logicat == 0) {
				BeachBall.PlayRKAlert();
			}	
			else if ((BeachBall.AudioAlertsStatus == 2 || BeachBall.AudioAlertsStatus == 4) && BeachBall.Logicat == 1) {
				BeachBall.PlayRKAlert();
			}
		}
	}	
	//If no RK active, update title Timer. Reset some variables.
	else {
		document.title = BeachBall.RKTimer;
		BeachBall.oldRKLocation = -1;
		BeachBall.RKNew = 1;
		BeachBall.RKPlayAudio = 0;
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

BeachBall.CagedLogicat = function() {
	if (Molpy.Boosts['Caged Logicat'].power == 1 && BeachBall.LCSolverStatus > 1) {
		var i = 65;
		var LCSolution = 'A';
		do 
			{LCSolution = String.fromCharCode(i);
			i++;}
		while (Molpy.cagedPuzzleTarget != Molpy.cagedSGen.StatementValue(LCSolution));
		Molpy.ClickCagedPuzzle(LCSolution);
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
	var status = 0;
	switch (option) {
		case 'RKAutoClick':
			BeachBall.RKAutoClickStatus++;
			if (BeachBall.RKAutoClickStatus > 2) {BeachBall.RKAutoClickStatus = 0;}
			status = BeachBall.RKAutoClickStatus;
			break;
		case 'CagedAutoClick':
			BeachBall.CagedAutoClickStatus++;
			if (BeachBall.CagedAutoClickStatus > 1) {BeachBall.CagedAutoClickStatus = 0;}
			status = BeachBall.CagedAutoClickStatus;
		case 'LCSolver':
			BeachBall.LCSolverStatus++;
			if (BeachBall.LCSolverStatus > 3) {BeachBall.LCSolverStatus = 0;}
			status = BeachBall.LCSolverStatus;
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
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'Keep Ninja';}
		else if (status == 2) {description = 'On: <a onclick="BeachBall.SwitchOption(\'BeachAutoClickRate\')">' + BeachBall.BeachAutoClickCPS + ' cps</a>';}
		else {Molpy.Notify('Display Description Error - BeachAutoClick: ' + status, 1);}
	}
	else if (option == 'CagedAutoClick') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'On';}
		else {Molpy.Notify('Display Description Error - CagedAutoClick: ' + status, 1);}
	}
	else if (option == 'LCSolver') {
		if (status == 0) {description = 'Off';}
		else if (status == 1) {description = 'LC Only';}
		else if (status == 2) {description = 'Caged Only';}
		else if (status == 3) {description = 'All LCs'}
		else {Molpy.Notify('Display Description Error - LCSolver: ' + status, 1);}
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

BeachBall.CheckToolFactory = function() {
	if (Molpy.Got('Tool Factory')) {
		BeachBall.DisplayDescription('ToolFactory', BeachBall.toolFactory);
		Molpy.Notify('Tool Factory Option Now Available!', 1);
	}
	else {
		Molpy.Notify('Tool Factory is still unavailable... keep playing!', 1);
	}
}
//Beach Ball Startup
//Set Settings
if (Molpy.Got('Kitnip') == 1){BeachBall.RKAlertFrequency = 10;}

//Create Menu
$('#optionsItems').append('<br> <br> <div class="minifloatbox"> <h3 style="font-size:150%; color:red">BeachBall Settings</h3> <h4 style"font-size:75%">v ' + BeachBall.version + '</div> <br>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'RKAutoClick\')"> <h4>Redundakitty Auto Click</h4> </a> <div id="RKAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'CagedAutoClick\')"> <h4>Caged Logicat<br>Auto Click</h4> </a> <div id="CagedAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'LCSolver\')"> <h4>Logicat Solver</h4> </a> <div id="LCSolverDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'BeachAutoClick\')"> <h4>Beach Auto Click</h4> </a> <div id="BeachAutoClickDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'AudioAlerts\')"> <h4>Audio Alerts</h4> </a> <div id="AudioAlertsDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SwitchOption(\'RefreshRate\')"> <h4>Refresh Rate</h4> </a> <div id="RefreshRateDesc"></div></div>');
$('#optionsItems').append('<div class="minifloatbox" id="BBToolFactory"> <a onclick="Molpy.LoadToolFactory(' + BeachBall.toolFactory + ')"> <h4>Load Tool Factory</h4> </a> <div id="ToolFactoryDesc"></div></div>');
//$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRK()"> <h4>Spawn RK</h4> </a></div>');
//$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.SpawnRift()"> <h4>Spawn Rift</h4> </a></div>');
//$('#optionsItems').append('<div class="minifloatbox"> <a onclick="BeachBall.ToggleMenus(\'ninj\')"> <h4>Open Ninja Tab</h4> </a></div>');
BeachBall.DisplayDescription('RKAutoClick', BeachBall.RKAutoClickStatus);
BeachBall.DisplayDescription('CagedAutoClick', BeachBall.CagedAutoClickStatus);
BeachBall.DisplayDescription('LCSolver', BeachBall.LCSolverStatus);
BeachBall.DisplayDescription('BeachAutoClick', BeachBall.BeachAutoClickStatus);
BeachBall.DisplayDescription('AudioAlerts', BeachBall.AudioAlertsStatus);
BeachBall.DisplayDescription('RefreshRate', BeachBall.refreshRate);
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
	//Molpy.Notify('Tick', 0);
	BeachBall.Time_to_ONG = Molpy.NPlength - Molpy.ONGelapsed/1000;
	BeachBall.RedundaKitty();
	BeachBall.CagedLogicat();
	BeachBall.BeachAutoClick();
	BeachBall.Ninja();
	BeachBall.CagedAutoClick();
	BeachBallLoop();
}

function BeachBallLoop() {
	setTimeout(BeachBallMainProgram, BeachBall.refreshRate);
}

//Program Startup
BeachBallLoop();
Molpy.Notify('BeachBall version ' + BeachBall.version + ' loaded for SandCastle Builder version ' + BeachBall.SCBversion, 1);
//Declare and Initialize Variables
var BB = {};

//Version Information
BB.Version = {
	BB : '6.0a',
	SCB : 3.411,
	isTested : function () {
		return this.SCB == Molpy.version;
	}
}

// The spy system
BB.Spy = {
	 /*
	example call
	+ BB.Spy.putBug('Notify',Molpy,function(){console.log('call is being made')})
	Add a 4th parameter to specify 'before' or 'after' the call. Default is after
	// */
	putBug : function (pocket,vest,bug,when) {
		var cellphone = vest[pocket];
		vest[pocket] = (function(_cellphone,_when,_bug){
			return function(){
				var connectedCall;
				if (_when == 'before') {
					_bug();
					connectedCall = _cellphone.apply(this, arguments);
				} else {
					connectedCall = _cellphone.apply(this, arguments);
					_bug();
				}
				return connectedCall;
			};
		})(cellphone,when,bug);
	}
}

BB.Settings = {
	unlocked : {
		everything : false
	},
	unlockEverything : function () {
		if (!confirm('Are you sure ? You can also unlock everything by following those advices and playing the game !')) return;
		var cheat = confirm('Do you also want it to be free ?');
		for (i in BB.Boost.loot){
			if (i.className == 'alert')
				continue;
			Molpy.UnlockBoost(i.name);
			if (cheat && Molpy.Boost[i.name])
				Molpy.Boost[i.name].price = null;
			BB.Settings.unlocked.everything = true;
		}
	}
}

// loot and boosts to unlock
BB.Boost = {
	groups : {
		'beachball' : ["Beachball","Beachball","beachballscript"]
	},
	loot : [
		{
			name : 'Dreaming of balls',
			icon : 'freeadvice',
			group : 'beachball',
			desc : function(me) {
				var unlockedAdvices = [];
				if (!me.bought) {
					unlockedAdvices.push('You see bouncing balls when you close your eyes...<br/>(BeachBall Script)');
				} else {
					if (!Molpy.Boosts['Beachball'].unlocked)
						unlockedAdvices.push('Color is nice. Or not. I realy can\'t decide !');
					if (!Molpy.Boosts['Volleyball Match'].unlocked)
						unlockedAdvices.push('Cuegan seems to be interested in that Beachball.<br/>If only they had someone to play against...');
					if (Molpy.Boosts['Volleyball Match'].unlocked && !Molpy.Boosts['Cuegan Training'].unlocked)
						unlockedAdvices.push('Cuegan loose everytime. They should seek advices with the umpire');
				}
				if (unlockedAdvices.length == 0) unlockedAdvices.push('I love balls !');
				return unlockedAdvices[Math.floor((Math.random()*unlockedAdvices.length))] + (BB.Settings.unlocked['everything'] ? '' : '<br/><input type="Button" onclick="BB.Settings.unlockEverything()" value="Unlock everything"></input>');
			},
			checkUnlock : function () {
				return true;
			},
			ONG : function () {
				Molpy.Add('Ball',1);
			},
			stats : 'Gives advice on how to unlock BeachBall bosts, and 1 Ball per NP.'
		},
		{
			name: 'Ball',
			single: 'Ball',
			plural: 'Balls',
			icon: 'beachball',
			group: 'beachball',
			desc: function(me) {
				var str = 'You have ' + Molpify(me.Level, 3) + ' ball' + plural(me.Level) + ' pumped up.';
				return str;
			},
			defStuff: 1,
			stats : 'Base money for BeachBall Script.'
		},
		{
			name : 'Volleyball Match',
			icon : 'megball',
			group : 'beachball',
			className: 'toggle',
			desc : function (me) {
				if (!me.bought)
					return 'Autoclick beach at the end of the match.';
				return 'Cuegans'+(me.power ? '' : ' don\'t')+' play Volleyball with NewPixBots'+(me.power ? ', clicking the beach 10mNP after NewPixBots activate, at the cost of 1 ball.' : '.')
					+ '<br/>Cuegans are '+(!me.hasActivated ? 'full of energy but NewPixBots are '+(Molpy.npbONG ? 'not in the mood' : 'building castles')+'.' : ( Molpy.Boosts['Match in session'].countdown? 'playing !' : 'exhausted after the match.'))
					+ (me.bought ? '<br/><input type="Button" onclick="Molpy.BoostsById[\''+ me.id + '\'].toggle();" value="' + (me.power ? 'Dea' : 'A') + 'ctivate"></input>' : '');
			},
			stats : 'Autoclicks the picture 10mNP after NewPixBot activation. Will only click once per NP and consumes 1 Ball to activate. Won\'t activate if NewPixBots have already been ninjad or stealth.',
			IsEnabled: Molpy.BoostFuncs.BoolPowEnabled,
			toggle : function() {
				var me = Molpy.BoostsById[this.id];
				me.power = me.power ? 0 : 1;
				if (Molpy.Boosts['Match in session'].unlocked) {
					Molpy.LockBoost('Match in session');
					this.hasActivated = 0;
				}
			},
			price:{ Sand : '2000' },
			checkUnlock : function() {
				return ((Molpy.SandTools['Cuegan'].amount >= 8) && (Molpy.CastleTools['NewPixBot'].amount >= 8));
			},
			unlockFunction : function () {
			},
			buyFunction: function() {
				Molpy.Add('Ball',1);
				this.hasActivated = 0;
				this.power = 1;
			},
			ONG : function () {
				this.hasActivated = 0;
			},
			mNP : function () {
				if (this.power  && !this.hasActivated && !Molpy.Boosts['Match in session'].unlocked && (Molpy.npbONG || Molpy.ninjad)) {
					this.hasActivated = 1;
					Molpy.UnlockBoost('Match in session');
					Molpy.GiveTempBoost('Match in session');
				}
			},
			saveData: {
				4:['hasActivated', 0, 'int']
			}
		},
		{
			name : 'Match in session',
			icon : 'cheqflag',
			group : 'beachball',
			className: 'alert',
			desc : function (me) {
				return (me.countdown ? (
					'Match is in session between the NewPixBots and the Cueagans. It will end in '+MolpifyCountdown(me.countdown)
				) : '');
			},
			startCountdown : 10, // can also be function()
			lockFunction : function () { // also unlockFunction
				
				if (Molpy.Spend('Ball',1)) {
					Molpy.Notify('Match ended ! The ball was destroyed by a NPB and clicked the picture once.',1);
					Molpy.ClickBeach();
					Molpy.UnlockBoost('Ninja umpire');
				} else {
					Molpy.Notify('Match was canceled due to a lack of balls.',1)
				}
			}
		},
		{
			name : 'Ninja umpire',
			icon : 'ninjaclimber',
			group : 'beachball',
			desc : function(me) {
				return 'Each NP, gives '+me.power+' balls.'
				+ (me.bought ? '' : '<br/>Or does he ?');
			},
			stats : function(me) {
				if (me.bought)
					Molpy.UnlockBoost('Cuegan Training');
				return me.desc(me);
			},
			ONG : function () {
				Molpy.Add('Ball',this.power);
			},
			buyFunction: function() {
				this.power = 5;
			},
			price : {
				Ball : 1
			}
		},
		{
			name : 'Cuegan Training',
			icon : 'helpfulhands',
			group : 'beachball',
			className: 'toggle',
			desc : function(me) {
				if (!me.bought)
					return 'Cuegan start to train, droping some balls in the sand from time to time.';
				var actBtn = '<br/><input type="Button" onclick="Molpy.BoostsById[\''+ me.id + '\'].toggle();" value="' + (me.power ? 'Dea' : 'A') + 'ctivate"></input>';
				if (!me.power)
					return 'No training is planed.'+actBtn;
				if (Molpy.Boosts['Match in session'].unlocked)
					return 'Cuegans are playing a match ! They will train afterwards.'+actBtn;
				if (Molpy.Boosts['Volleyball Match'].IsEnabled() && !Molpy.Boosts['Volleyball Match'].hasActivated)
					return 'Cuegans are preparing for the match. They will train afterwards.'+actBtn;
				return 'Cuegans are training.'+actBtn;
			},
			stats : function(me) {
				if (!me.bought)
					return me.desc(me);
				return 'Clicks the Beach every mNP. If the Volleyball match is activated, will wait for the match to occur.';
			},
			IsEnabled: Molpy.BoostFuncs.BoolPowEnabled,
			toggle : function() {
				var me = Molpy.BoostsById[this.id];
				me.power = me.power ? 0 : 1;
			},
			mNP : function () {
				var me = Molpy.BoostsById[this.id];
				if (me.power && !Molpy.Boosts['Match in session'].unlocked && !(Molpy.Boosts['Volleyball Match'].IsEnabled() && !Molpy.Boosts['Volleyball Match'].hasActivated)) {
					Molpy.ClickBeach();
					me.activations ++;
					if (me.activations > 5)
						Molpy.UnlockBoost('Training strength');
				}
			},
			saveData: {
				4:['activations', 0, 'int']
			},
			buyFunction: function() {
				this.power = 0;
				this.activations = 0;
			},
			price : {
				Ball : 10
			}
		},
		{
			name : 'Training strength',
			icon : 'flyingbuckets',
			group : 'beachball',
			className: 'toggle',
			desc : function(me) {
				// if (!me.bought)
					return 'Cuegan intensify training, dropping more balls per mNP.';
				// var actBtn = '<br/><input type="Button" onclick="Molpy.BoostsById[\''+ me.id + '\'].toggle();" value="' + (me.power ? 'Dea' : 'A') + 'ctivate"></input>';
				// if (!me.power)
					// return 'No training is planed.'+actBtn;
				// if (Molpy.Boosts['Match in session'].unlocked)
					// return 'Cuegans are playing a match ! They will train afterwards.'+actBtn;
				// if (Molpy.Boosts['Volleyball Match'].IsEnabled() && !Molpy.Boosts['Volleyball Match'].hasActivated)
					// return 'Cuegans are preparing for the match. They will train afterwards.'+actBtn;
				// return 'Cuegans are training.'+actBtn;
			},
			stats : function(me) {
				// if (!me.bought)
					// return me.desc(me);
				// return 'Clicks the Beach every mNP. If the Volleyball match is activated, will wait for the match to occur.';
			},
			// IsEnabled: Molpy.BoostFuncs.BoolPowEnabled,
			// toggle : function() {
				// var me = Molpy.BoostsById[this.id];
				// me.power = me.power ? 0 : 1;
			// },
			mNP : function () {
				// var me = Molpy.BoostsById[this.id];
				// if (me.power && !Molpy.Boosts['Match in session'].unlocked && !(Molpy.Boosts['Volleyball Match'].IsEnabled() && !Molpy.Boosts['Volleyball Match'].hasActivated)) {
					// Molpy.ClickBeach();
					// me.activations ++;
					// if (me.activations > 5)
						// Molpy.UnlockBoost('Training strength');
				// }
			},
			saveData: {
				// 4:['activations', 0, 'int']
			},
			buyFunction: function() {
				// this.power = 0;
				// this.activations = 0;
			},
			price : {
				// Ball : 10
			}
		},
		{
			name : 'Cheat',
			icon : 'thunderbird',
			group : 'beachball',
			desc : function (me) {
				return 'For debug purposes,'
					+ '<br/><input type="Button" value="Reset BeachBall" onclick="localStorage[\'BeachBall.Boost\'] = \'\';window.location.reload()"></input>'
					+ '<br/><input type="Button" value="Get a ball" onclick="Molpy.Add(\'Ball\',1);"></input>'
					+ '<br/><input type="Button" value="ONG !" onclick="Molpy.ONG();"></input>';
			},
			checkUnlock : function () {
				return true;
			}
		}
	],
	ONG : function () {
		for (i in BB.Boost.loot)
			if (Molpy.Boosts[BB.Boost.loot[i].name].bought && Molpy.Boosts[BB.Boost.loot[i].name].ONG)
				Molpy.Boosts[BB.Boost.loot[i].name].ONG();
	},
	mNP : function () {
		for (i in BB.Boost.loot)
			if (Molpy.Boosts[BB.Boost.loot[i].name].mNP)
				Molpy.Boosts[BB.Boost.loot[i].name].mNP();
	},
	updateUnlocks : function () {
		for (i in BB.Boost.loot)
			if (Molpy.Boosts[BB.Boost.loot[i].name].checkUnlock && Molpy.Boosts[BB.Boost.loot[i].name].checkUnlock())
				Molpy.UnlockBoost(BB.Boost.loot[i].name);
	},
	lootSelectionRepaint : function () {
		var str = '';
		for (i in BB.Boost.groups)
			str += Molpy.PaintLootToggle(i, 4);
		g('lootselection').innerHTML = str + g('lootselection').innerHTML;
	},
	implantGroups : function () {
		for (i in BB.Boost.groups)
			Molpy.groupNames[i] = BB.Boost.groups[i];
	},
	implantLoot : function () {
		for (i in BB.Boost.loot)
			new Molpy.Boost(BB.Boost.loot[i]);
	},
	prepare : function () {
		this.baseBoostCount = Molpy.BoostsById.length;
		this.implantGroups();
		this.implantLoot();
		BB.Spy.putBug('RepaintLootSelection',Molpy,this.lootSelectionRepaint);
		BB.Spy.putBug('ONG',Molpy,this.ONG);
	},
	baseBoostCount : 0, // essential for loading system (offset based on system state before the loading
	// save system (taken and altered from castle.js, boostToSting/from section)
	fromString : function (thread) {
			// console.log('load from : '+thread);
		var s = 'S'; //Semicolon
		var c = 'C'; //Comma
		var pixels = thread.split(s);
		
		for( var idNum in Molpy.BoostsById) {
			if (idNum >= BB.Boost.baseBoostCount) {
				var me = Molpy.BoostsById[idNum];
				var saveData = me.saveData;
				
				// If save data exists for that boost, load it
				if(pixels[idNum-BB.Boost.baseBoostCount]) {
					var savedValueList = pixels[idNum-BB.Boost.baseBoostCount].split(c);
					for(var num in saveData){
						
						var loadedValue = null; // Just to avoid editor warnings of 'var may not be defined'
						
						// Load differently based on data type
						if(saveData[num][2] == 'int')
							loadedValue = parseInt(savedValueList[num]) || saveData[num][1];
						else if(saveData[num][2] == 'float')
							loadedValue = parseFloat(savedValueList[num]) || saveData[num][1];
						else
							loadedValue = savedValueList[num] || saveData[num][1];
						me[saveData[num][0]] = loadedValue;
					}
					
					// Make sure locked boosts didn't bug out and save a bought amount
					if(!me.unlocked) me.bought = 0;
					
					if(me.bought) {
						Molpy.BoostsOwned++;
						Molpy.unlockedGroups[me.group] = 1;
					}
					
					// If it has a countdown, then it was only a temporary boost
					if(me.countdown) {
						Molpy.GiveTempBoost(me.name, me.power, me.countdown);
					}
					
					// It would be nice if these could be changed or moved, they are not very dynamic
					if(isNaN(me.power)) me.power = 0; //compression! :P
					if(isNaN(me.countdown)) me.countdown = 0;
					
					me.getDiv({});
					me.faveRefresh=1;
					
					// console.log('boost loaded : ',me);
				// If no data was saved for the boost, set them to defaults
				} else {
					if ($.inArray(me.group,BB.Boost.groups)>=0)
						me.resetSaveData();
				}
			}
		}
	},
	toString : function () {
		var s = 'S'; //Semicolon
		var c = 'C'; //Comma
		var str = '';
		for( var which in BB.Boost.loot) {
			var boost = Molpy.Boosts[BB.Boost.loot[which].name];
			// console.log(boost);
			var saveData = boost.saveData;
			var fencePost = '';
			for(var num in saveData){
				str += fencePost + boost[saveData[num][0]];
				fencePost = c;
			}
			str += s;
		}
			// console.log('save to : '+str);
		return str;
	}
}

BB.Persist = {
	load : function () {
		BB.Boost.fromString(localStorage['BeachBall.Boost'] || "");
		
		Molpy.BuildLootLists();
	},
	save : function () {
		localStorage['BeachBall.Boost'] = BB.Boost.toString();
	},
	prepare : function () {
		BB.Spy.putBug('Load',Molpy,this.load);
		BB.Spy.putBug('Save',Molpy,this.save);
	}
}


BB.Balloon = {
	pump : function () {// pumping up the ball
		BB.Boost.prepare();
		BB.Persist.prepare();
		BB.Spy.putBug('Think',Molpy,function() {
			BB.Boost.updateUnlocks();
			BB.Boost.mNP();
		});
	},
	push : function () {// pushing it down the hill
		BB.Persist.load();
		// Molpy.RepaintLootSelection();
		Molpy.allNeedRepaint = 1;
		console.log('BeachBall started rolling !');
		return true;
	},
	test : function () {
	}
}

BB.Balloon.pump();
BB.Balloon.push();
// BB.Balloon.test();
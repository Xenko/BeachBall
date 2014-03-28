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
			Molpy.Boost[i.name].unlocked = 1;
			if (cheat)
				Molpy.Boost[i.name].price = {Sand : 0};
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
					// if (!Molpy.Boosts['Beachball'].unlocked)
				}
				if (unlockedAdvices.length == 0) unlockedAdvices.push('I love balls !');
				return unlockedAdvices[Math.floor((Math.random()*unlockedAdvices.length))] + (BB.Settings.unlocked['everything'] ? '' : '<br/><input type="Button" onclick="BB.Settings.unlockEverything()" value="Unlock everything"></input>');
			},
			price:{ Sand : '1' },
			checkUnlock : function () {
				return true;
			}
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
			defStuff: 1
		},
		{
			name : 'Volleyball Match',
			icon : 'megball',
			group : 'beachball',
			className: 'toggle',
			desc : function (me) {
				if (!me.bought)
					return '1 autoclick per NP (ninja or not)';
				return 'Cuegans'+(me.IsEnabled ? '' : ' don\'t')+' play Volleyball with NewPixBots'+(me.IsEnabled ? ', clicking the beach 10mNP after NewPixBots activate.' : '.')
					+ '<br/>Cuegans are '+(me.power ? 'full of energy.' : 'exhausted.')
					+ (me.bought ? '<br/><input type="Button" onclick="Molpy.GenericToggle('+ me.id + ');" value="' + (me.IsEnabled ? 'Dea' : 'A') + 'ctivate"></input>' : '');
			},
			IsEnabled: Molpy.BoostFuncs.BoolPowEnabled,
			price:{ Sand : '2000' },
			checkUnlock : function() {
				return ((Molpy.SandTools['Cuegan'].amount > 8) && (Molpy.CastleTools['NewPixBot'].amount > 8));
			},
			unlockFunction : function () {
				this.power = 1;
			},
			ONG : function () {
				this.power = 1;
			},
			mNP : function () {
				if (this.power && (!Molpy.ninjad) && Molpy.npbONG) {
					this.power = 0;
					Molpy.UnlockBoost('Match in session');
					Molpy.GiveTempBoost('Match in session');
				}
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
				Molpy.ClickBeach();
			}
		}
	],
	ONG : function () {
		for (i in this.loot)
			if (Molpy.Boosts[this.loot[i].name].ONG)
				Molpy.Boosts[this.loot[i].name].ONG();
	},
	mNP : function () {
		for (i in this.loot)
			if (Molpy.Boosts[this.loot[i].name].mNP)
				Molpy.Boosts[this.loot[i].name].mNP();
	},
	updateUnlocks : function () {
		for (i in this.loot)
			if (Molpy.Boosts[this.loot[i].name].checkUnlock && Molpy.Boosts[this.loot[i].name].checkUnlock())
				Molpy.Boosts[this.loot[i].name].unlocked = 1;
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
	},
	test : function () {
		// Molpy.unlockedGroups['beachball'] = true;
		
		// Molpy.Boosts['Test BeachBall'].unlocked=1
		// Molpy.RepaintLootSelection();
	}
}

BB.Balloon.pump();
BB.Balloon.push();
// BB.Balloon.test();
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
					unlockedAdvices[] = 'You see bouncing balls when you close your eyes...<br/>(BeachBall Script)'
				} else {
					if (!Molpy.Boosts['Beachball'].unlocked)
				}
				if (unlockedAdvices.length == 0) unlockedAdvices[] = 'I love balls !';
				return unlockedAdvices[Math.floor((Math.random()*unlockedAdvices.length))] + (BB.Settings.unlocked['everything'] ? '' : '<br/><input type="Button" onclick="BB.Settings.unlockEverything()" value="Unlock everything"></input>');
			},
			price:{ Sand : '1' }
		},
		{
			name: 'Balls',
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
				return (me.IsEnabled
					? 'The ball is bouncing on the beach, clicking '+this.power+' time in the sand each mNP.'
					: 'The ball is not bouncing right now.'
					)+'<br/><input type"Button" onclick="BB.Boosts.toggle(\''+me.name+'\')" Value="Toggle"></input>';
			},
			price:{ Sand : '500' }
			
		}
	],
	// complementary attributes/functions not present in the base Boost object(or not understood)
	lootComplement : {
		'Buble advice' : {
			unlock : function () {
				return true;
			}
		},
		// 'Balls' : function() {
			// return Molpy.Boosts['Beachball'].unlocked;
		// }
	},
	updateUnlocks : function () {
		for (i in this.lootComplement)
			if (this.unlockConditions[i].unlock && this.lootComplement[i].unlock())
				Molpy.Boosts[i].unlocked = 1;
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
	},
	baseBoostCount : 0, // essential for loading system (offset based on system state before the loading
	// save system (taken and altered from castle.js, boostToSting/from section)
	fromString : function (thread) {
			console.log('load from : '+thread);
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
					
					console.log('boost loaded : ',me);
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
			console.log(boost);
			var saveData = boost.saveData;
			var fencePost = '';
			for(var num in saveData){
				str += fencePost + boost[saveData[num][0]];
				fencePost = c;
			}
			str += s;
		}
			console.log('save to : '+str);
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
BB.Balloon.test();
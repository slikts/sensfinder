extends: base.html
block: content
title: CS sensitivity finder

#CS sensitivity finder

This is a tool to help finding the best individual mouse sensitivity setting for CS players. It simplifies and improves the steps used in [this method](http://youtu.be/uxBuiD11WDM) (video). The point of the method is to try to be more objective in comparing different sensitivities.

The tool gives you a command to paste in the game console&nbsp;(<kbd>~</kbd>) that allows switching between a pair of mouse sensitivity settings by pressing a key&nbsp;(<kbd class="switchkey"></kbd>). You test and compare both settings in-game and then return to the tool and select which setting worked better. The tool then gives you a new command to enter into the console and you repeat the process until you've found the sensitivity that is the most accurate.

##Steps

 1. Press *Start* in the tool
 
    If Flash is supported and the *Auto copy* option is checked, it will automatically copy the console commands for changing the sensitivity in-game to the clipboard, otherwise you will need to <kbd>Ctrl+C</kbd> the commands manually.
	
    Mouse over the tool options to see a detailed description of each option. The default settings should work in most cases.
	
 1. Go to the game and paste the commands in console
 
    The console can be enabled in *Options* &rarr; *Game Settings* &rarr; *Enable Developer Console* and accessed with the Tilde&nbsp;key&nbsp;(<kbd>~</kbd>).
	
	Setting the game to *Windowed Fullscreen* might be a good idea because it makes using <kbd>Alt+Tab</kbd> easier.
	
 1. Test the first sensitivity setting and remember the results
 
 1. Press the switch key&nbsp;(<kbd class="switchkey"></kbd>) and test the other sensitivity setting
 
    The switch key can be customized in tool options. You can unbind the key after the test by entering <code>unbind "<span class="switchkey"></span>"</code> in the console.
	
 1. Go to the tool and select the sensitivity that had better results
 
    The tool will calculate two new sensitivity settings and give you the console command to set them in game.
	
 1. Return to Step 1
    
	Do this until you've found the sensitivity setting that you think works the best.

##Testing

I recommend using the [training_aim_csgo_fixed](http://steamcommunity.com/sharedfiles/filedetails/?id=210194828) map for testing because it gives you results as numbers, so they're easy to compare, and the tests are closer to actual gameplay. The difficulty and length of testing depends on what you want, but it's important to test both sensitivity settings in the same way. For example, you could use the *Fast Aiming* test and repeat it at close and far distances for both settings.

To use the <strong>training_aim_csgo_fixed</strong> map, Subscribe to it from its Workshop page, and then go to *Play* &rarr; *Offline With Bots* &rarr; *Workshop* and select the map.

##About

Project [GitHub page](#) | [reddit post](#)

This tool is published under the MIT licence.

Made by slikts &lt;[dabas@untu.ms](mailto:dabas@untu.ms)>

# **Donnie Thornberry Troll Bot**
Based on https://github.com/aaronr5tv/DonnieThornberryBot, I updated the code in order to make it work with the most recent (at this time) version of discrod.js API(14.15.3)
Bot joins the channel and Donnie Thornberry speaks over the designated target when they try to speak. 

Feel free to fork the bot and extend it in anyway you can think of also I'm open to PR's if you are interested in that.

# Usage Instructions

### **Prerequisites**

- [Node.JS](https://nodejs.org/en/) 14.0.0 or higher.
- Setup a discord bot account and get your bot token. Instructions on this can be found [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#keeping-your-token-safe).

### **Instructions**
- **Step 1:** `git-clone` or download the project from this repo to your machine. CD into the project dir and run `npm install` to install dependencies.
- **Step 2**: In the project directory create a file named `.env` and copy the contents of `.env.example` into the new file. Replace the placeholder TOKEN with your own.
- **Step 3**: Start the bot by navigating in CMD prompt or terminal into the project dir and running `npm start`
- **Step 4:** The default command prefix for the bot is `don!` Running `don!help` will give you all the commands necassary. Essentially the main command is `don!target @(your target here)`. Also there is `don!start` and `don!stop`. By default he is turned on so to begin trolling your friends you should just have to target them.
Museum of the Future (Final Year Project)
=========================================

Discovering historic trends in user interests via topic modelling. Presented via node.js, AngularJS, Sass and Grunt.

Building on DigitalOcean
------------------------
The easiest way to get up and running is to make an Ubuntu 14.04 droplet on DigitalOcean. Connect to the droplet via SSH and save this shell script to the root directory (/root, where you start):

    REPO=https://github.com/jadaradix/fyp.git
    REPODIR=fyp
    
    # Freshen Up
    sudo apt-get update
    # Install Ruby
    apt-get install ruby -y
    # Install Git
    apt-get install git -y
    # Install Node.js and NPM
    apt-get install nodejs -y
    apt-get install npm -y
    # Fix NPM because Debian :<
    ln -s /usr/bin/nodejs /usr/bin/node
    # Install global NPM modules
    npm install -g grunt-cli
    npm install -g bower
    npm install -g forever
    # The Basics
    rm -rf $REPODIR
    mkdir $REPODIR
    cd $REPODIR
    # Clone some repo
    git clone $REPO tmp && mv tmp/.git . && rm -rf tmp && git reset --hard
    # Install Sass
    gem install sass --no-ri --no-rdoc
    # Install dependencies
    npm install
    bower install --allow-root
    cd node_modules-custom/yans
    npm install
    cd ../..
    # Built with Grunt
    grunt
    # Run server
    npm start

Run it:

    bash install.sh

Now put the IP of your droplet into your web browser and you can see it working. Hurrah!

Debugging
------------------------

### Error: listen EADDRINUSE

If you get this error right at the end, it's because something else is serving on port 80. This is probably node.js itself, so kill it like this and start http-server again:

    pkill node
    npm start

### Error: listen EACCES

If you get this error right at the end, it's because you need elevated permissions to run a server on port 80, which is a reserved port. Try this (or open command prompt as an Administrator on Windows):

    sudo npm start

### "twitter-credentials.json is missing or couldn't be read. I need this."

twitter-credentials.json holds credentials for the Twitter API. I don't publish mine on GitHub because they're confidential, so provide your own using this JSON template:

    {
      "consumer_key": "...",
      "consumer_secret": "...",
      "access_token_key": "...",
      "access_token_secret": "..."
    }

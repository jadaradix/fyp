Museum of the Future (Final Year Project)
========

Discovering historic trends in user interests via topic modelling. Presented via node.js, AngularJS, Sass and Grunt.

Building on DigitalOcean
-------------
The easiest way to get up and running is to make an Ubuntu 14.04 droplet on DigitalOcean. Connect to the droplet via SSH and save this shell script to the root directory (/root, where you start):

    REPO=https://github.com/jadaradix/fyp.git
    REPODIR=fyp
    BUILDNAME=build
    
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
    # Install http-server NPM module
    npm install http-server -g
    # Install Grunt CLI NPM module
    npm install -g grunt-cli
    # The Basics
    rm -rf $REPODIR
    mkdir $REPODIR
    cd $REPODIR
    # Clone some repo
    git clone $REPO tmp && mv tmp/.git . && rm -rf tmp && git reset --hard
    # Install Sass
    gem install sass --no-ri --no-rdoc
    # Install package.json dependencies
    npm install
    # Built with Grunt
    grunt
    # Run http-server on port 80
    cd $BUILDNAME && http-server -p 80

Run it:

    bash sh.sh
    

Now put the IP of your droplet into your web browser and you can see it working. Hurrah!

### Error: listen EADDRINUSE

    events.js:72
            throw er; // Unhandled 'error' event
                  ^
    Error: listen EADDRINUSE
        at errnoException (net.js:901:11)
        at Server._listen2 (net.js:1039:14)

If you get this error right at the end, it's because something else is serving on port 80. This is probably Node.js itself, so kill it like this and start http-server again:

    pkill node
    http-server -p 80

#!/bin/bash


nonArgs=$1||"no args"

echo "first arg $nonArgs"
echo $(expr length "$nonArgs") 
basepath=`pwd`
echo "pwd: $basepath"
size=$(expr length "$1") 
readJson() {  
    UNAMESTR=`uname`
    if [[ "$UNAMESTR" == 'Linux' ]]; then
        SED_EXTENDED='-r'
    elif [[ "$UNAMESTR" == 'Darwin' ]]; then
        SED_EXTENDED='-E'
    fi; 

    VALUE=`grep -m 1 "\"${2}\"" ${1} | sed ${SED_EXTENDED} 's/^ *//;s/.*: *"//;s/",?//'`

    if [ ! "$VALUE" ]; then
        echo "Error: Cannot find \"${2}\" in ${1}" >&2;
        exit 1;
    else
        echo $VALUE ;
    fi; 
}
id="0"
name="dev"
appkey="0"
appsec="0"
setDefaultConfig(){
    echo "setting default config..."
    truncate -s 0 ~/.config/stream-cli/config.yml
    defApp="apps:
- name: dev
  access-key: a473f9se75cz
  access-secret-key: jm9zssw8bquy5mnaxk9jzne63zwjxbvhjjt6ykqpznpaspg32f3bqc8rb3byn2cc
  chat-url: https://chat.stream-io-api.com
default: dev"
    # sed -i "`wc -l < ~/.config/stream-cli/config.yml` a$defApp " ~/.config/stream-cli/config.yml
    echo "$defApp" >> ~/.config/stream-cli/config.yml 
    echo "default config set!"  
}

createApp(){
    echo "creating app..."
    pwd
    c=$(ls -1q $basepath/utils/trial_extender/collected* | wc -l)
    lastId=0
    if [ $size -gt 1 ]
        then
            echo "procfile: running cleanSlate"
            c=0
    fi
    echo "app_count: $c"
    if [ $c -lt 1 ]
        then
            # command node
            echo "no apps found, creating apps"
            command node $basepath/utils/trial_extender/non.js $nonArgs
            c=$(ls -1q $basepath/utils/trial_extender/collected* | wc -l)
            # createApp
    fi
    
    
    echo "apps found..."
    for i in $(seq 1 $c); 
    do 
        id=$i
        
        if grep -Fq "name: app1" ~/.config/stream-cli/config.yml
            then
                echo "app1 found increasing count"
                id=$(expr $i + 1)
            else
                id=$i
        fi
        lastId=$id
        if [ ${BASH_VERSION%%[^0-9]*} -lt 4 ]
            then
                echo "using bash ${BASH_VERSION%%[^0-9.]*}"
                name="app$id"
                id=`readJson $basepath/utils/trial_extender/collected/app$id.json id` || exit 1;
                appkey=`readJson $basepath/utils/trial_extender/collected/app$id.json key` || exit 1;
                appsec=`readJson $basepath/utils/trial_extender/collected/app$id.json secret` || exit 1;
            else
                echo "using bash ${BASH_VERSION%%[^0-9.]*}"
                # if [ -e "$basepath/utils/trial_extender/collected/app$id.json" ]
                #     then
                #         echo "File exists"
                #     else
                #         echo "File does not exist, increasing id"
                # fi
                echo "id is $id"
                name="app$id"
                # id=`jq -r  '.id' $basepath/utils/trial_extender/collected/app$id.json`
                appkey=`jq -r '.key' $basepath/utils/trial_extender/collected/app$id.json` 
                appsec=`jq -r '.secret' $basepath/utils/trial_extender/collected/app$id.json`
        fi
        newApp="- name: $name\\
  access-key: $appkey\\
  access-secret-key: $appsec\\
  chat-url: https://chat.stream-io-api.com"
        sed -i "`wc -l < ~/.config/stream-cli/config.yml` i$newApp " ~/.config/stream-cli/config.yml
    done; 
    echo $lastId
    grep -F "default: app" ~/.config/stream-cli/config.yml 
    prevDefault=$(grep -F "default: " ~/.config/stream-cli/config.yml)
    echo $prevDefault
    sed -i "s/$prevDefault/default: app$lastId/" ~/.config/stream-cli/config.yml
        # printf '$i\ndefault: %s\n.\nw\n' "$id" | ed -s ~/.config/stream-cli/config.yml
    echo "config file updated, creating channel...";
    userId=`jq -r '.user_id' $basepath/utils/trial_extender/collected/app$lastId.json`
    echo "adding user with userid: $userId"
    echo `stream-cli chat upsert-user --properties "{\"id\":\"$userId\"}"`
    channelId="teamchat"
    checkChannel=`stream-cli chat get-channel --id $channelId --type messaging`
    if [ `jq -r '.id' <<< "$checkChannel"` ]; 
        then 
            echo "Channel Exists"; 
        else 
            echo "No channel found, creating channel..."

            echo `stream-cli chat create-channel --type messaging --id $channelId --user $userId`; 
    fi
    echo "current channels"
    stream-cli chat list-channels --type messaging
    echo "app created!"
}

bootStrapCli(){
    echo "bootstrapping cli..."
    envCount=$(ls -1q ./.env* | wc -l)
    if [ $envCount -lt 1 ]
    then
        touch .env
    fi
    if command -v stream-cli
    then
        echo "stream-cli exists!"
        echo "setting config to default"
        setDefaultConfig
        echo "updating config file"
        createApp
        echo "updated config list"
        stream-cli config list
        echo "starting node server"
        
        # npm start -p 5000
        
    else
        if command -v node
        then
            createApp
            if [ ${BASH_VERSION%%[^0-9]*} -lt 4 ]
            then
                echo ${BASH_VERSION%%[^0-9.]*}
                id=`readJson $basepath/utils/trial_extender/streamData.json id` || exit 1;
                appkey=`readJson $basepath/utils/trial_extender/streamData.json appkey` || exit 1;
                appsec=`readJson $basepath/utils/trial_extender/streamData.json appsec` || exit 1;
            else
                echo ${BASH_VERSION%%[^0-9.]*}
                id=`jq -r  '.id' $basepath/utils/trial_extender/streamData.json` 
                appkey=`jq -r '.appkey' $basepath/utils/trial_extender/streamData.json` 
                appsec=`jq -r '.appsec' $basepath/utils/trial_extender/streamData.json`
            fi
            
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/GetStream/stream-cli/master/install/install.sh)"
            # FILE= ~/.config/stream-cli/config.yml
            if [ -f ~/.config/stream-cli/config.yml ]
            then
                echo "config file exists."
                truncate -s 0 ~/.config/stream-cli/config.yml
                
            else
                echo "config file does not exist, touching..."
                mkdir ~/.config/stream-cli
                touch ~/.config/stream-cli/config.yml
                echo "touch complete!"
            fi
            
        echo "apps:\n- name: $name\n  access-key: $appkey\n  access-secret-key: $appsec\n  chat-url: https://chat.stream-io-api.com\n  default: dev" >> ~/.config/stream-cli/config.yml
        echo "stream-cli re-installed and config file updated\n"
        stream-cli config list
        echo "STREAM_API_KEY = $appkey\nSTREAM_API_SECRET = $appsec\nSTREAM_APP_ID = $id" >> ./server/.env
        fi
        stream-cli config list
    fi
    echo "bootstrapping complete!"
    return 0
}

bootStrapCli
echo "$?"

#! /bin/bash

CYAN="\033[36m"
GREEN="\033[32m"
WHITE="\033[0m"

echo -e "${CYAN}Start local server:\n"

echo -e "${GREEN}Run node-sass...${WHITE}"
echo "> ./node_modules/node-sass/bin/node-sass --watch ./app/src/scss --output ./app/src/css &"
./node_modules/node-sass/bin/node-sass --watch ./app/src/scss --output ./app/src/css &

echo -e "\n${GREEN}Reset server directory...${WHITE}"
echo "> rm -r ./server/*"
rm -r ./server/*

echo -e "\n${GREEN}Run parcel...${WHITE}"
echo -e "> parcel serve ./app/index.html -d ./server --open\n"
parcel serve ./app/index.html -d ./server --open
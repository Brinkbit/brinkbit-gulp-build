FROM node:5.3.0

RUN mkdir /app

WORKDIR /app

RUN npm install -g gulp

ADD package.json package.json
RUN npm install

ADD gulpfile.js gulpfile.js

ADD src/ src/
ADD test/ test/
ADD testFiles/ testFiles/
ADD index.js index.js

CMD npm test

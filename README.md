# Crowdsourcing Marketplace using MySQL
To demonstrate the use of stateless RESTful web services by creating prototype of Freelancer web application. (www.freelancer.com).

```
Individual assignment for CMPE 273 - Enterprise Distributed Systems course during Software Engineering.
```
## Goal

To design and develop the prototype of ‘Freelancer’ (www.freelancer.com) web application and demonstrate the use of RESTful web services along with distributed messaging system Kafka as a middleware and NoSQL database MongoDB along with Passport as a authentication service middleware and deployment on Amazon EC2 instance.

## Solution

My Freelancer prototype application is divided into 3 parts:

* freelancer-react-client
* freelancer-node-backend
* freelancer-kafka-backend

Freelancer react client consists of react components and calls freelancer-node-backend API on any user action. freelancer-node-backend consists of 23+ APIs to send message to kafka topic on user action. freelancer-kafka-backend consists of 23 consumer. These consumers keep on listening to 23 topics and perform activities on receiving the message on topic. freelancer-node-backend and freelancer-kafka-backend use ‘correlation-id’ to remember to communication and work as request/response. As there is one unique topic for each API, no single consumer is overloaded with multiple request and scalability is achieved.
In this way freelancer-node-backend does the message producing part and freelancer-kafka-backend deals with performing actual functionality involving MongoDB database.
In this application Passport JS node module is used as a authentication middleware with persistent session configuration which are stored in MongoDB. This provides horizontal scalability.


## User stories:

* Standard Sign Up, Sign In and Logout functionalities.
* As an authenticated user, I can Create and Update profile information.
* As an authenticated user, I can Post Project and allow other users to bids on project.
* As an authenticated user, I can bid on projects posted.
* As an authenticated user, I can Get list of all open projects to bid on with pagination having 10 projects/page.
* As an authenticated user, I can Sort project bids.
* As an authenticated user, I can Search project on the basis of Project Name and Technology Stack with filter on project status.
* As an authenticated user, I can Hire freelancer on the basis of bids received.
* As an authenticated user, I can Check open projects and bid on projects posted by other users.
* As an authenticated user, I can Check project completion date when freelancer is hired.
* As an authenticated user, I can add money to wallet, withdraw money and pay to hired freelancer.
* As an authenticated user, I can check transaction history along with pie chart.


> For Detailed Description check [Project Report](https://docs.google.com/document/d/14v4p5swxtRjUb70MkDxANsna8J_v6lTp_ZQQnkOU78Q/edit?usp=sharing)


## System Design
> Applications uses a simple Client-Server architecture

* Client Side : ReactJS (Redux, HTML5 and Bootstrap)
```
Consists of total 25+ React components. 
Effective modularisation is used in each component so as to increase reusability.
```

* Server Side : NodeJS, ExpressJS
```
Consists of 23+ APIs to serve client requests.
```

* Database :  MongoDB
```
Consists of 3 collections:
* User : To store user related information.
* Project : To stores project details posted by user along with array of bids in each project document.
* Payment : Stores all credit/debit transaction. (Add, withdraw and Payment)

```

## Built with the MERN stack 

|MongoDB|Express|React|NodeJS|
|--|--|--|--|
|[![mdb](https://github.com/mongodb-js/leaf/blob/master/dist/mongodb-leaf_256x256.png?raw=true)](https://www.mongodb.com/)|[![mdb](https://camo.githubusercontent.com/fc61dcbdb7a6e49d3adecc12194b24ab20dfa25b/68747470733a2f2f692e636c6f756475702e636f6d2f7a6659366c4c376546612d3330303078333030302e706e67)](http://expressjs.com/de/)|[![mdb](https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/React-icon.svg/1024px-React-icon.svg.png)](https://facebook.github.io/react/)|[![mdb](https://camo.githubusercontent.com/9c24355bb3afbff914503b663ade7beb341079fa/68747470733a2f2f6e6f64656a732e6f72672f7374617469632f696d616765732f6c6f676f2d6c696768742e737667)](https://nodejs.org/en/)|
|a free and open-source cross-platform document-oriented database program|Fast, unopinionated, minimalist web framework for node.|a JavaScript library for building user interfaces|a JavaScript runtime built on Chrome's V8 JavaScript engine|


## System Architecture
![Architecture](/Architecture.png)


## Frameworks / Libraries

| **Name** | **Description** |**Used**|
|----------|-------|---|
|  [React](https://facebook.github.io/react/)  |   Fast, composable client-side components.    | Frontend |
|  [Redux](http://redux.js.org) |  Enforces unidirectional data flows and immutable, hot reloadable store. Supports time-travel debugging. | Frontend |
|  [React Router](https://github.com/reactjs/react-router) | A complete routing library for React | Frontend |  Compiles ES6 to ES5. Enjoy the new version of JavaScript today.     | Frontend |
| [React Google Charts](https://github.com/RakanNimer/react-google-charts) | A React Google Charts Wrapper | Frontend |
| [Axios](https://github.com/mzabriskie/axios) | Promise based HTTP client for the browser and node.js | Frontend |
| [MaterializeCSS](http://materializecss.com/) | A a CSS Framework based on material design. | Frontend |
| [Express](https://github.com/expressjs/express) | For creating the backend logic | Backend |
| [Mongoose](https://github.com/Automattic/mongoose) | To work faster with MongoDB | Backend |
| [Apache Kafka](http://eslint.org/)| Messaging Service | Middleware |
| [Passport](http://passportjs.org/) | For simplified authentication in Node.js | Backend |
| [Babel](https://github.com/babel/babel) | Compiles ES6 into ES5 | General |
| [Webpack](http://webpack.github.io) | Bundles npm packages and our JS into a single file. | General |  
| [ESLint](http://eslint.org/)| Lint JS. Reports syntax and style issues. | General |


### Steps to run application:

* Create database schema 
* Go to path : …\Lab1-Freelancer\freelancer
* npm install
* npm run start-dev 
> This will start ReactJS server on 3000 port and NodeJS server will start at 3001 port.

## 📝 Author
[<img src="" align="right" height="100">](https://github.com/heyitsvajid)

##### Vajid Kagdi <kbd> [Github](https://github.com/heyitsvajid) / [LinkedIn](https://www.linkedin.com/in/heyitsvajid) / [E-Mail](mailto:vajid9@gmail.com)</kbd>

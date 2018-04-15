//Files
var connection = new require('./kafka/Connection');
var user = require('./services/user');
var project = require('./services/project');
var payment = require('./services/payment');
var utility = require('./util/util.js');

//Kafka Topics
var login_topic = 'login_request';
var signup_topic = 'signup_request';
var updateProfile_topic = 'updateprofile_request';
var getProfile_topic = 'getprofile_request'
var getprofileimage_topic = 'getprofileimage_request';
var postProject_topic = 'postproject_request';
var getOpenProjects_topic = 'getopenprojects_request';
var getSearchProject_topic = 'getsearchproject_request';
var getProject_topic = 'getproject_request';
var postBid_topic = 'postbid_request';
var getBids_topic = 'getbids_request';
var getUserBidProjects_topic = 'getuserbidprojects_request';
var getUserProjects_topic = 'getuserprojects_request';
var checkBid_topic = 'checkbid_request';
var hireEmployer_topic = 'hireemployer_request';
var addMoney_topic = 'addmoney_request';
var withdrawMoney_topic = 'withdrawmoney_request';
var getUserWalletDetails_topic = 'getuserwalletdetails_request';
var getUserDetails_topic = 'getuserdetails_request';
var payfreelancer_topic = 'payfreelancer_request'
var uploadImage_topic = 'uploadimage_request';
var uploadSubmissionDocument_topic = 'uploadsubmissiondocument_request'
var response_topic = 'response_topic';
//Producer
var producer = connection.getProducer();
producer.on('error', function (err) {
    console.log('producer.on error: ' + err);
    process.exit();
});

producer.on('ready', function () {
    producer.createTopics([
        uploadSubmissionDocument_topic,
        response_topic,
        login_topic,
        signup_topic,
        updateProfile_topic,
        getProfile_topic,
        getprofileimage_topic,
        postProject_topic,
        getOpenProjects_topic,
        getSearchProject_topic,
        getProject_topic,
        postBid_topic,
        getBids_topic,
        getUserBidProjects_topic,
        getUserProjects_topic,
        checkBid_topic,
        hireEmployer_topic,
        addMoney_topic,
        withdrawMoney_topic,
        getUserWalletDetails_topic,
        getUserDetails_topic,
        payfreelancer_topic,
        uploadImage_topic
    ], false, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Topics Created");


            //Consumers
            var login_consumer = connection.getConsumer(login_topic);
            var signup_consumer = connection.getConsumer(signup_topic);
            var updateProfile_consumer = connection.getConsumer(updateProfile_topic);
            var getprofileimage_consumer = connection.getConsumer(getprofileimage_topic);
            var postProject_consumer = connection.getConsumer(postProject_topic);
            var getOpenProjects_consumer = connection.getConsumer(getOpenProjects_topic);
            var getSearchProject_consumer = connection.getConsumer(getSearchProject_topic);
            var getProject_consumer = connection.getConsumer(getProject_topic);
            var postBid_consumer = connection.getConsumer(postBid_topic);
            var getBids_consumer = connection.getConsumer(getBids_topic);
            var getUserBidProjects_consumer = connection.getConsumer(getUserBidProjects_topic);
            var getUserProjects_consumer = connection.getConsumer(getUserProjects_topic);
            var checkBid_consumer = connection.getConsumer(checkBid_topic);
            var hireEmployer_consumer = connection.getConsumer(hireEmployer_topic);
            var addMoney_consumer = connection.getConsumer(addMoney_topic);
            var withdrawMoney_consumer = connection.getConsumer(withdrawMoney_topic);
            var getUserWalletDetails_consumer = connection.getConsumer(getUserWalletDetails_topic);
            var getUserDetails_consumer = connection.getConsumer(getUserDetails_topic);
            var payfreelancer_consumer = connection.getConsumer(payfreelancer_topic);
            var uploadImage_consumer = connection.getConsumer(uploadImage_topic);
            var uploadSubmissionDocument_consumer = connection.getConsumer(uploadSubmissionDocument_topic);
            var getprofile_consumer = connection.getConsumer(getProfile_topic);


            //Login Consumer
             login_consumer.on('message', function (message) {
                 console.log('Kafka Server login_consumer : message received');
                 console.log(JSON.stringify(message.value));
                 var data = JSON.parse(message.value);
                 user.login_request(data.data, function (err, res) {
                     console.log('Kafka Server : after handle');
                     console.log(res);
                     var payloads = utility.createPayload(data, res);
                     console.log('is producer ready : ' + producer.ready);
                     producer.send(payloads, function (err, data) {
                         utility.log(data, err);
                     });
                     return;
                 });
             });


            //Signup Consumer
            signup_consumer.on('message', function (message) {
                console.log('Kafka Server signup_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                user.signup_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);

                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            //Update Profile Consumer
            updateProfile_consumer.on('message', function (message) {
                console.log('Kafka Server updateprofile_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                user.updateProfile_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);

                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });


            //Get Profile Profile Consumer
            getprofile_consumer.on('message', function (message) {
                console.log('Kafka Server getprofile_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                user.getprofile_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);

                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            //Get Profile Image if any
            getprofileimage_consumer.on('message', function (message) {
                console.log('Kafka Server getprofileimage_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                user.getprofileimage_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });


            postProject_consumer.on('message', function (message) {
                console.log('Kafka Server postProject_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.postProject_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            getOpenProjects_consumer.on('message', function (message) {
                console.log('Kafka Server getOpenProjects_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.getOpenProjects_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            getSearchProject_consumer.on('message', function (message) {
                console.log('Kafka Server getSearchProject_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.getSearchProject_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            getProject_consumer.on('message', function (message) {
                console.log('Kafka Server getProject_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.getProject_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            postBid_consumer.on('message', function (message) {
                console.log('Kafka Server getProject_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.postBid_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });


            getBids_consumer.on('message', function (message) {
                console.log('Kafka Server getBids_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.getBids_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            getUserBidProjects_consumer.on('message', function (message) {
                console.log('Kafka Server getUserBidProjects_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.getUserBidProjects_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });


            getUserProjects_consumer.on('message', function (message) {
                console.log('Kafka Server getUserProjects_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.getUserProjects_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            checkBid_consumer.on('message', function (message) {
                console.log('Kafka Server getUserProjects_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.checkBid_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });


            hireEmployer_consumer.on('message', function (message) {
                console.log('Kafka Server hireEmployer_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.hireEmployer_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            addMoney_consumer.on('message', function (message) {
                console.log('Kafka Server addMoney_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                payment.addMoney_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            withdrawMoney_consumer.on('message', function (message) {
                console.log('Kafka Server withdrawMoney_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                payment.withdrawMoney_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            getUserWalletDetails_consumer.on('message', function (message) {
                console.log('Kafka Server getUserWalletDetails_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                payment.getUserWalletDetails_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            getUserDetails_consumer.on('message', function (message) {
                console.log('Kafka Server getUserDetails_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.getUserDetails_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            payfreelancer_consumer.on('message', function (message) {
                console.log('Kafka Server payfreelancer_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                payment.payfreelancer_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            uploadImage_consumer.on('message', function (message) {
                console.log('Kafka Server uploadImage_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                user.uploadImage_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });

            uploadSubmissionDocument_consumer.on('message', function (message) {
                console.log('Kafka Server uploadImage_consumer : message received');
                console.log(JSON.stringify(message.value));
                var data = JSON.parse(message.value);
                project.uploadSubmissionDocument_request(data.data, function (err, res) {
                    console.log('Kafka Server : after handle');
                    console.log(res);
                    var payloads = utility.createPayload(data, res);
                    console.log('is producer ready : ' + producer.ready);
                    producer.send(payloads, function (err, data) {
                        utility.log(data, err);
                    });
                    return;
                });
            });
            console.log('server is running');

            process.on('uncaughtException', function (err) {
                console.error(err.stack);
                console.log("Node NOT Exiting...");
              });

            process.on("SIGINT", function () {
                signup_consumer.close(true, function () {
                    process.exit();
                });
                updateProfile_consumer.close(true, function () {
                    process.exit();
                });
                getprofileimage_consumer.close(true, function () {
                    process.exit();
                });
                postProject_consumer.close(true, function () {
                    process.exit();
                });
                getOpenProjects_consumer.close(true, function () {
                    process.exit();
                });
                getSearchProject_consumer.close(true, function () {
                    process.exit();
                });
                getProject_consumer.close(true, function () {
                    process.exit();
                });
                postBid_consumer.close(true, function () {
                    process.exit();
                });
                getBids_consumer.close(true, function () {
                    process.exit();
                });
                getUserBidProjects_consumer.close(true, function () {
                    process.exit();
                });
                getUserProjects_consumer.close(true, function () {
                    process.exit();
                });
                checkBid_consumer.close(true, function () {
                    process.exit();
                });
                hireEmployer_consumer.close(true, function () {
                    process.exit();
                });
                addMoney_consumer.close(true, function () {
                    process.exit();
                });
                withdrawMoney_consumer.close(true, function () {
                    process.exit();
                });
                getUserWalletDetails_consumer.close(true, function () {
                    process.exit();
                });
                getUserDetails_consumer.close(true, function () {
                    process.exit();
                });
                payfreelancer_consumer.close(true, function () {
                    process.exit();
                });
                uploadImage_consumer.close(true, function () {
                    process.exit();
                });
                uploadSubmissionDocument_consumer.close(true, function () {
                    process.exit();
                });
                getprofile_consumer.close(true, function () {
                    process.exit();
                });

            });
         }
     });
 });



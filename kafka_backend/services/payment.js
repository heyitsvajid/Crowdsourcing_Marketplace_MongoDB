var User = require('../model/user.js');
var Payment = require('../model/payment.js');
var Project = require('../model/project.js');

exports.login_request = function login_request(msg, callback) {
    var res = {};
    console.log("In handle request:" + JSON.stringify(msg));

    if (msg.username == "bhavan@b.com" && msg.password == "a") {
        res.code = "200";
        res.value = "Success Login";
    }
    else {
        res.code = "401";
        res.value = "Failed Login";
    }
    callback(null, res);
}

exports.payfreelancer_request = function payfreelancer_request(msg, callback) {
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error posting Payment',
        data: {}
    }
    if (msg.project_id) {
        Project.findById(msg.project_id, function (err, project) {
            if (err) throw err;
            if (project) {
                project.set({ project_status: 'Closed' });
                project.save(function (error, updatedProject) {
                    try {

                        let bidAmount = 0;
                        let freelancerId = 0;
                        project.bids.forEach(bid => {
                            if (bid.bid_status == 'BID ACCEPTED') {
                                bidAmount = bid.bid_amount;
                                freelancerId = bid.freelancer_id;
                                return;
                            }
                        });
                        User.findById(freelancerId, function (err, user) {
                            if (err) throw err;
                            let new_balance = parseInt(user.account_balance) + parseInt(bidAmount);
                            user.set({
                                account_balance: new_balance
                            });
                            user.save(function (error, updatedUser) {
                                var payment = new Payment();
                                payment.project_id = project._id;
                                payment.project_name = project.title;
                                payment.freelancer_id = freelancerId;
                                payment.freelancer_name = updatedUser.name;
                                payment.employer_id = project.employer_id;
                                payment.employer_name = project.employer_name;
                                payment.amount = bidAmount;
                                payment.payment_type = 'Wallet Transfer';
                                payment.payment_date = (new Date()).toDateString();
                                payment.description = 'Payment for Project'
                                console.log(project);

                                console.log(payment);

                                payment.save(function (err, user) {
                                    if (err) {
                                        console.log('Error in Saving payment: ' + err);
                                    }
                                    console.log('Money Added Successfully');
                                });
                            });
                        });
                        User.findById(project.employer_id, function (err, user) {
                            if (err) throw err;
                            let new_balance = parseInt(user.account_balance) - parseInt(bidAmount);
                            user.set({
                                account_balance: new_balance
                            });
                            user.save(function (error, updatedUser) {
                            });
                        });
                        if (error) throw error;
                        console.log('Payment Posted Successfully');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Payment Posted Successfully';
                        callback(null, resultObject);
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        callback(null, resultObject);
                        return;
                    }
                });
            }
        });
    } else {
        console.log('Please provide user id');
        resultObject.errorMsg = 'Please provide user id';
        callback(null, resultObject);
        return;
    }
   
}


exports.getUserWalletDetails_request = function getUserWalletDetails_request(msg, callback) {
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error adding money to wallet',
        data: {}
    }
    if (msg.id) {

        User.findById(msg.id, function (err, user) {

            Payment.find({ $and: [{ freelancer_id: { '$eq': msg.id } }] }, function (error, creditPayments) {

                Payment.find({ $and: [{ employer_id: { '$eq': msg.id } }] }, function (error, debitPayments) {
                    try {
                        if (error) throw error;

                        resultObject.data.user = user;
                        console.log("User Details:");
                        console.log(user);

                        console.log("Credit Transaction: ");
                        console.log(creditPayments);
                        resultObject.data.creditTransaction = creditPayments;

                        console.log("Debit Transaction: ");
                        console.log(debitPayments);
                        resultObject.data.debitTransaction = debitPayments;

                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Wallet Details Fetched';
                        callback(null, resultObject);
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        callback(null, resultObject);
                        return;
                    }
                });
            });
        });
    } else {
        console.log('Please provide user id');
        resultObject.errorMsg = 'Please provide user id';
        callback(null, resultObject);
        return;
    }    }

exports.withdrawMoney_request = function withdrawMoney_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error withdrawing money from wallet',
        data: {}
    }

    try {
        var payment = new Payment();
        payment.employer_id = '' + msg.user_id;

        payment.amount = msg.amount;
        payment.payment_type = 'Bank';
        payment.payment_date = msg.payment_date;
        var bankDetails = {
            number: msg.accountNumber,
            name: msg.name,
            routing: msg.routingNumber
        }
        payment.bankDetails = bankDetails;
        payment.description = 'Money Withdrawn'
        payment.save(function (err, user) {
            if (err) {
                console.log('Error in Saving payment: ' + err);
            }
            console.log('Money Withdrawn Successfully');
        });

        User.findById(msg.user_id, function (err, user) {
            if (err) throw err;
            let new_balance = parseInt(user.account_balance) - parseInt(msg.amount);
            user.set({
                account_balance: new_balance
            });
            user.save(function (error, updatedUser) {
            });
        });

        resultObject.errorMsg = '';
        resultObject.successMsg = 'Money Withdrawn Successfully';
        callback(null, resultObject);
        return;
    } catch (error) {
        console.log(error);
        console.log('Catch : ' + error.message);
        resultObject.errorMsg = error.message;
        callback(null, resultObject);
        return;
    }
}


exports.addMoney_request = function addMoney_request(msg, callback) {
    // Add Money API
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error adding money to wallet',
        data: {}
    }

    try {
        var payment = new Payment();
        payment.freelancer_id = msg.user_id;
        payment.amount = msg.amount;
        payment.payment_type = 'Card';
        payment.payment_date = msg.payment_date;
        var cardDetails = {
            number: msg.cardNumber,
            name: msg.name,
            month: msg.expMonth,
            year: msg.expYear,
            cvv: msg.cardCVV
        }
        payment.cardDetails = cardDetails;
        payment.description = 'Added from Credit Card'
        payment.save(function (err, user) {
            if (err) {
                console.log('Error in Saving payment: ' + err);
            }
            console.log('Money Added Successfully');
        });

        User.findById(msg.user_id, function (err, user) {
            if (err) throw err;
            let new_balance = parseInt(user.account_balance) + parseInt(msg.amount);
            user.set({
                account_balance: new_balance
            });
            user.save(function (error, updatedUser) {
            });
        });

        resultObject.errorMsg = '';
        resultObject.successMsg = 'Money Added Successfully';
        callback(null, resultObject);
        return;
    } catch (error) {
        console.log(error);
        console.log('Catch : ' + error.message);
        resultObject.errorMsg = error.message;
        callback(null, resultObject);
        return;
    }
}
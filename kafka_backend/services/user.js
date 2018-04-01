//Files
var User = require('../model/user.js');
var Payment = require('../model/payment.js');
var Project = require('../model/project.js');
var bcrypt = require('bcrypt');



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


exports.uploadImage_request = function uploadImage_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error uploading image',
        data: {}
    }
    User.findById(msg.id, function (err, user) {
        if (err) return handleError(err);
        user.set({ profile: msg.dbPath });
        user.save(function (error, updatedUser) {
            try {
                if (error) throw error;
            } catch (error) {
                console.log(error);
                console.log('Catch : ' + error.message);
                resultObject.errorMsg = error.message;
                callback(null, resultObject);
                return;
            }
            resultObject.successMsg = 'Image Uploaded Successfully';
            resultObject.errorMsg = '';
            callback(null, resultObject);
            return;
        });
    });}

exports.getprofileimage_request = function getprofileimage_request(msg, callback) {
    // getprofileimage API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching image',
        data: {}
    }
    if (!msg.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject); return;
    } else {
        try {
            let id = msg.id;
            if (msg.id != '') {
                User.findById(id, function (error, user) {
                    try {
                        if (error) throw error;
                        if (user && user.profile != '') {
                            console.log('Profile image Found');
                            resultObject.data.src = user.profile;
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Profile Found';
                            callback(null, resultObject);
                        } else {
                            console.log('User profile image not found');
                            resultObject.errorMsg = 'User profile image not found';
                            resultObject.successMsg = '';
                            callback(null, resultObject);
                        }
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
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            callback(null, resultObject);
        }
    }
}


exports.getprofile_request = function getprofile_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching profile',
        data: {}
    }
    if (!msg.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject); return;
    } else {
        try {
            let id = msg.id;
            if (msg.id != '') {
                User.findById(id, function (error, user) {
                    try {
                        if (error) throw error;
                        if (user) {
                            console.log('Profile Found');
                            resultObject.data = user;
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Profile Found';
                            callback(null, resultObject);
                        } else {
                            console.log('User not found');
                            resultObject.errorMsg = 'User not found';
                            resultObject.successMsg = '';
                            callback(null, resultObject);
                        }
                        return;

                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        callback(null, resultObject); return;
                    }
                });
            }
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            callback(null, resultObject);
        }
    }
}

exports.signup_request = function signup_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error',
        data: {}
    }
    console.log('kafka : signup_request');
    console.log(JSON.stringify(msg));
    if (!msg.name || !msg.email || !msg.password) {
        console.log('No name, email and password');
        resultObject.errorMsg = 'Please Provide name, email and password';
        callback(null, resultObject);
    } else {
        let name = msg.name;
        let email = msg.email;
        var password = bcrypt.hashSync(msg.password, 10);
        console.log('Hashed Password: ' + password);
        //Check Username allready exists
        User.findOne({ 'email': email }, function (error, user) {
            // In case of any error return
            try {
                if (error) throw error;
                if (user) {
                    // already exists
                    console.log('Username allready taken');
                    resultObject.errorMsg = 'Username allready taken';
                    callback(null, resultObject);
                    return;
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();
                    // set the user's local credentials
                    newUser.email = email;
                    newUser.password = password;
                    newUser.name = name;
                    // save the user
                    newUser.save(function (err, user) {
                        if (err) {
                            console.log('Error in Saving user: ' + err);
                            throw err;
                        } else {
                            console.log('Sign Up Succcessful');
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Sign Up Succcessful';
                            resultObject.data = {
                                id: user._id,
                                name: user.name,
                                email: user.email
                            }
                            callback(null, resultObject);
                        }
                    });
                }
            } catch (error) {
                console.log(error);
                console.log('Catch : ' + error.message);
                resultObject.errorMsg = error.message;
                callback(null, resultObject);
            }
        });
    };
}



exports.updateProfile_request = function updateProfile_request(msg, callback) {
    // Update Profile API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error updating profile',
        data: {}
    }
    if (!msg.name || !msg.email) {
        console.log('No name and email');
        resultObject.errorMsg = 'Please Provide name and email';
        callback(null, resultObject)
        return;
    } else {
        try {
            let name = msg.name;
            let email = msg.email;
            let phone = msg.phone;
            let about = msg.about;
            let skills = msg.skills;
            console.log(skills)
            var result = skills.split(",");

            let id = msg.id;
            User.findById(id, function (err, user) {
                if (err) return handleError(err);

                while (user.skills.length > 0) {
                    user.skills.pop();
                }
                result.forEach(element => {
                    user.skills.push(element);
                });

                user.set({
                    name: name, email: email
                });
                if (phone) {
                    user.set({
                        phone: phone
                    });
                }
                if (about) {
                    user.set({
                        about: about
                    });

                }
                user.save(function (error, updatedUser) {
                    try {
                        if (error) throw error;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        callback(null, resultObject)
                        return;
                    }
                    console.log('Update Succcessful');
                    resultObject.errorMsg = '';
                    resultObject.successMsg = 'Update Succcessful';
                    callback(null, resultObject)
                    return;
                });
            });

        } catch (e) {
            console.log('Catch : ' + e.message);
            resultObject.errorMsg = e.message;
            callback(null, resultObject)
            return;
        }
    }
}



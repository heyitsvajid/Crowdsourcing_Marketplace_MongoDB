var db_controller;
var bcrypt = require('bcrypt');
var multiparty = require('multiparty');
let fs = require('fs');
const BID_STATUS_SENT = 'BID_SENT';
const BID_STATUS_ACCEPTED = 'BID_ACCEPTED';
const BID_STATUS_REJECTED = 'BID_REJECTED';
var User = require('../model/user.js');
var Payment = require('../model/payment.js');
var Project = require('../model/project.js');
var passport = require('../config/passport.js');
var kafka = require('../kafka/client');
// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'freelancer.prototype@gmail.com',
//         pass: '!QAZ2wsx#EDC'
//     }
// });

exports.uploadImage = function (req, res) {
    console.log("signup_request : node backend");
    console.log('API: uploadImage ' + 'STEP: Start');

    var resultObject = {
        successMsg: '',
        errorMsg: 'Error Uploading Image',
        data: {}
    }
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        resultObject = {
            successMsg: '',
            errorMsg: 'Error Uploading Image',
            data: {}
        }
        console.log(files);
        let { path: tempPath, originalFilename } = files.file[0];
        var fileType = originalFilename.split(".");
        let copyToPath = "./src/images/" + fields.id + '.' + fileType[1];
        let dbPath = fields.id + '.' + fileType[1];
        fs.readFile(tempPath, (err, data) => {
            if (err) throw err;
            fs.writeFile(copyToPath, data, (err) => {
                if (err) throw err;
                // delete temp image
                fs.unlink(tempPath, () => {
                    console.log('API: uploadImage ' + 'STEP: FIle save to new path');
                });
            });
        });
        let data = {
            dbPath: dbPath,
            id: fields.id
        };
        console.log(data);
        kafka.make_request('uploadimage_request', data, function (err, results) {
            console.log('Kafka Response:');
            console.log(results);
            if (err) {
                console.log('Controller : Error Occurred : ');
                console.log(err);
                res.json(results);
            }
            else {
                res.json(results);
                return;
            }
        });
    })

}

//method updated
exports.uploadImageOld = function (req, res) {
    // Upload Image API
    console.log('API: uploadImage ' + 'STEP: Start');

    var resultObject = {
        successMsg: '',
        errorMsg: 'Error Uploading Image',
        data: {}
    }
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        resultObject = {
            successMsg: '',
            errorMsg: 'Error Uploading Image',
            data: {}
        }
        console.log(files);
        let { path: tempPath, originalFilename } = files.file[0];
        var fileType = originalFilename.split(".");
        let copyToPath = "./src/images/" + fields.id + '.' + fileType[1];
        let dbPath = fields.id + '.' + fileType[1];
        fs.readFile(tempPath, (err, data) => {
            if (err) throw err;
            fs.writeFile(copyToPath, data, (err) => {
                if (err) throw err;
                // delete temp image
                fs.unlink(tempPath, () => {
                    console.log('API: uploadImage ' + 'STEP: FIle save to new path');
                });
            });
        });
        User.findById(fields.id, function (err, user) {
            if (err) return handleError(err);
            user.set({ profile: dbPath });
            user.save(function (error, updatedUser) {
                try {
                    if (error) throw error;
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }

                resultObject.successMsg = 'Image Uploaded Successfully';
                resultObject.errorMsg = '';
                res.json(resultObject);
                return;
            });
        });
    })
};


//New method with passport
exports.login = function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        var resultObject = {
            successMsg: '',
            errorMsg: 'Error Signing user in',
            data: {}
        }
        if (err) {
            return next(err); // will generate a 500 error
        }
        if (!user) {
            console.log(info.errMsg);
            resultObject.errorMsg = info.errMsg;
            res.json(resultObject);
            return;
        }
        req.login(user, function (err) {
            if (err) {
                console.error(err);
                res.json(resultObject);
                return;
            }
            resultObject.successMsg = 'Log In Successful';
            resultObject.errorMsg = '';
            console.log(user._id);
            resultObject.data = {
                id: user._id,
                name: user.name,
                email: user.email
            }
            req.session.id = user._id;
            req.session.name = user.name;
            req.session.email = user.email;
            res.json(resultObject);
            return;

        });
    })(req, res, next);
}

exports.signup = function (req, res) {
    console.log("signup_request : node backend");

    let data = req.body;
    console.log(data);
    kafka.make_request('signup_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.signupold = function (req, res) {
    // SignUp User API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error',
        data: {}
    }
    console.log(req.body);
    if (!req.body.name || !req.body.email || !req.body.password) {
        console.log('No name, email and password');
        resultObject.errorMsg = 'Please Provide name, email and password';
        res.json(resultObject);
        return;
    } else {
        let name = req.body.name;
        let email = req.body.email;
        var password = bcrypt.hashSync(req.body.password, 10);
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
                    res.json(resultObject);
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
                            res.json(resultObject);
                            return;
                        }
                    });
                }
            } catch (error) {
                console.log(error);
                console.log('Catch : ' + error.message);
                resultObject.errorMsg = error.message;
                res.json(resultObject);
                return;
            }
        });
    };
}



exports.updateprofile = function (req, res) {
    console.log("signup_request : node backend");

    let data = req.body;
    console.log(data);
    kafka.make_request('updateprofile_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Updated
exports.updateprofileold = function (req, res) {
    // Update Profile API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error updating profile',
        data: {}
    }
    if (!req.body.name || !req.body.email) {
        console.log('No name and email');
        resultObject.errorMsg = 'Please Provide name and email';
        res.json(resultObject);
        return;
    } else {
        try {
            let name = req.body.name;
            let email = req.body.email;
            let phone = req.body.phone;
            let about = req.body.about;
            let skills = req.body.skills;
            var result = skills.split(",");

            let id = req.body.id;
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
                        res.json(resultObject);
                        return;
                    }
                    console.log('Update Succcessful');
                    resultObject.errorMsg = '';
                    resultObject.successMsg = 'Update Succcessful';
                    res.json(resultObject);
                    return;
                });
            });

        } catch (e) {
            console.log('Catch : ' + e.message);
            resultObject.errorMsg = e.message;
            res.json(resultObject);
            return;
        }
    }
};



exports.getprofile = function (req, res) {
    console.log("getprofile_request : node backend");

    let data = req.body;
    console.log(data);
    kafka.make_request('getprofile_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}


//Method Converted
exports.getprofileold = function (req, res) {
    // Get User Profile API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching profile',
        data: {}
    }
    if (!req.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {
        try {
            let id = req.body.id;
            if (req.body.id != '') {
                User.findById(id, function (error, user) {
                    try {
                        if (error) throw error;
                        if (user) {
                            console.log('Profile Found');
                            resultObject.data = user;
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Profile Found';
                            res.json(resultObject);
                        } else {
                            console.log('User not found');
                            resultObject.errorMsg = 'User not found';
                            resultObject.successMsg = '';
                            res.json(resultObject);
                        }
                        return;

                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            }
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }
};



exports.getprofileimage = function (req, res) {
    console.log("getprofile_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getprofileimage_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//method converted
exports.getprofileimageold = function (req, res) {
    // getprofileimage API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching image',
        data: {}
    }
    if (!req.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {
        try {
            let id = req.body.id;
            if (req.body.id != '') {
                User.findById(id, function (error, user) {
                    try {
                        if (error) throw error;
                        if (user && user.profile != '') {
                            console.log('Profile image Found');
                            resultObject.data.src = user.profile;
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Profile Found';
                            res.json(resultObject);
                        } else {
                            console.log('User profile image not found');
                            resultObject.errorMsg = 'User profile image not found';
                            resultObject.successMsg = '';
                            res.json(resultObject);
                        }
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            }
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }
};

function responseUtil(err, results, res) {
    console.log('Kafka Response:');
    console.log(results);
    if (err) {
        console.log('Controller : Error Occurred : ');
        console.log(err);
        res.json(results);
    }
    else {
        res.json(results);
        return;
    }
}

//Method Converted
exports.postProject = function (req, res) {
    // Post Project API
    console.log('Post Project API Called');
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        var resultObject = {
            successMsg: '',
            errorMsg: 'Error Posting Project',
            data: {}
        }
        let { path: tempPath, originalFilename } = files.file[0];
        let copyToPath = "./src/files/_" + Date.now() + '_' + originalFilename;
        let dbPath = '_' + Date.now() + '_' + originalFilename;
        try {
            fs.readFile(tempPath, (err, data) => {
                if (err) throw err;
                fs.writeFile(copyToPath, data, (err) => {
                    if (err) throw err;
                    // delete temp image
                    fs.unlink(tempPath, () => {
                    });
                });
            });

            console.log("postProject_request : node backend");
            let data = fields;
            data.dbPath = dbPath
            console.log(data);
            kafka.make_request('postproject_request', data, function (err, results) {
                responseUtil(err, results, res);
            });
        } catch (e) {
            console.log('Catch');
            console.log(e);
            resultObject.errorMsg = 'Error Uploading Image';
            res.json(resultObject);
            return;
        }
    })
};



exports.getOpenProjects = function (req, res) {
    console.log("getOpenProjects_request : node backend");
    console.log(req);
    let data = {
        body:req.body,
        skills:req.user.skills
    }
    console.log(data);
    kafka.make_request('getopenprojects_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.getOpenProjectsold = function (req, res) {
    // SignUp User API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching profile',
        data: {}
    }
    if (!req.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {
        try {
            if (req.body.id != '') {
                let employer_id = req.body.id;
                console.log(employer_id);
                Project.find({ $and: [{ employer_id: { '$ne': employer_id }, freelancer_id: 0 }] }, function (error, projects) {
                    // In case of any error return
                    try {
                        if (error) throw error;
                        console.log(projects);
                        console.log('Fetch projects Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch projects Succcessful';
                        resultObject.data = projects;
                        res.json(resultObject);
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            }
        } catch (e) {
            console.log(e);
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }

};


exports.getSearchProject = function (req, res) {
    console.log("getSearchProject_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getsearchproject_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}
//New Project
exports.getSearchProjectold = function (req, res) {
    // SignUp User API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching profile',
        data: {}
    }
    if (!req.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {
        try {
            if (req.body.id != '') {
                let employer_id = req.body.id;
                let search_string = req.body.search_string;
                console.log("Inside Search Projects");
                Project.find({ $and: [{ title: new RegExp(search_string, 'i') }] }, function (error, projects) {
                    try {
                        if (error) throw error;
                        console.log('Fetch search projects Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch search projects Succcessful';
                        resultObject.data = projects;
                        console.log(resultObject);
                        res.json(resultObject);
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            }
        } catch (e) {
            console.log(e);
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }

};


exports.getProject = function (req, res) {
    console.log("getProject_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getproject_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.getProjectold = function (req, res) {
    // Get project detail from id API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching project',
        data: {}
    }
    if (!req.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {
        try {
            let id = req.body.id;
            if (req.body.id != '') {
                Project.findById(id, function (error, project) {
                    try {
                        if (error) throw error;
                        if (project) {
                            console.log('Project Found');
                            console.log(project);
                            resultObject.data = project;
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Project Found';
                            res.json(resultObject);
                        } else {
                            console.log('Project not found');
                            resultObject.errorMsg = 'Project not found';
                            resultObject.successMsg = '';
                            res.json(resultObject);
                        }
                        return;

                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            } else {
                console.log('Please provide Project Id');
                resultObject.errorMsg = 'Please provide Project Id';
                resultObject.successMsg = '';
                res.json(resultObject);
                return;
            }
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }
};


exports.postBid = function (req, res) {
    console.log("postBid_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('postbid_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}
//Method Converted
exports.postBidold = function (req, res) {
    // postBid API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error posting bid',
        data: {}
    }
    if (!req.body.projectId || !req.body.userId || !req.body.period || !req.body.amount) {
        console.log('No name, email and password');
        resultObject.errorMsg = 'Please Provide project id , employee id, amount and period';
        res.json(resultObject);
        return;
    } else {
        let update = req.body.update;
        let freelancer_name = req.body.freelancer_name;

        let projectId = req.body.projectId;
        let userId = req.body.userId;
        let amount = req.body.amount;
        let period = req.body.period;
        let status = BID_STATUS_SENT;

        if (update) {
            //to be implemented
            console.log('Updating Bid');
            Project.findById(projectId, function (err, project) {
                if (err) throw err;
                var bid = {
                    freelancer_name: freelancer_name,
                    freelancer_id: userId,
                    bid_amount: amount,
                    bid_period: period,
                    bid_status: status,
                }
                if (project) {
                    Project.findOneAndUpdate({ _id: projectId }, { $pull: { bids: { freelancer_id: userId } } }).exec();
                    //project.bids.pull({ freelancer_id:userId  });
                    project.bids.push(bid);
                    project.save(function (error, updatedProject) {
                        try {
                            if (error) throw error;
                            console.log('Bid Updated Successful');
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Bid Updated Successful';
                            res.json(resultObject);
                            return;
                        } catch (error) {
                            console.log(error);
                            console.log('Catch : ' + error.message);
                            resultObject.errorMsg = error.message;
                            res.json(resultObject);
                            return;
                        }
                    });
                }
            });
        } else {
            console.log('Adding new bid');
            Project.findById(projectId, function (err, project) {
                if (err) throw err;
                var bid = {
                    freelancer_name: freelancer_name,
                    freelancer_id: userId,
                    bid_amount: amount,
                    bid_period: period,
                    bid_status: status,
                }
                if (project) {
                    project.bids.push(bid);
                    project.save(function (error, updatedProject) {
                        try {
                            if (error) throw error;
                            console.log('Post Bid Successful');
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Post Bid Successful';
                            res.json(resultObject);
                            return;
                        } catch (error) {
                            console.log(error);
                            console.log('Catch : ' + error.message);
                            resultObject.errorMsg = error.message;
                            res.json(resultObject);
                            return;
                        }
                    });
                }
            });
        }
    }
};


exports.getBids = function (req, res) {
    console.log("getBids_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getbids_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.getBidsOld = function (req, res) {
    // Get project bids from id API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching project bids',
        data: {}
    }
    if (!req.body.id) {
        console.log('No project id provided');
        resultObject.errorMsg = 'No project id provided';
        res.json(resultObject);
        return;
    } else {
        try {
            let project_id = req.body.id;
            if (req.body.id != '') {
                Project.findById(project_id, function (error, project) {
                    try {
                        if (error) throw error;
                        if (project) {
                            console.log('Project Found');
                            resultObject.data = project.bids ? project.bids : [];
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Project Found';
                            res.json(resultObject);
                        } else {
                            console.log('Project not found');
                            resultObject.errorMsg = 'Project not found';
                            resultObject.successMsg = '';
                            res.json(resultObject);
                        }
                        return;

                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            }
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }
};


exports.getUserBidProjects = function (req, res) {
    console.log("getUserBidProjects_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getuserbidprojects_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.getUserBidProjectsOld = function (req, res) {
    // SignUp User API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching projects',
        data: {}
    }
    if (!req.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {

        try {
            if (req.body.id != '') {
                let employer_id = req.body.id;
                console.log(employer_id);
                Project.find({ $and: [{ employer_id: { '$ne': employer_id } }] }, function (error, projects) {
                    try {
                        if (error) throw error;
                        console.log(projects);
                        var userBidProject = [];
                        projects.forEach(project => {
                            project.bids.forEach(bid => {
                                if (bid.freelancer_id == req.body.id) {
                                    var eachProjectData = {
                                        title: project.title,
                                        employer_name: project.employer_name,
                                        employer_id: project.employer_id,
                                        project_id: project._id,
                                        average: calculateAverageBid(project.bids),
                                        bid_amount: bid.bid_amount,
                                        bid_status: bid.bid_status,
                                    }
                                    userBidProject.push(eachProjectData);
                                    return;
                                }
                            })
                        });
                        console.log('Fetch projects with bids Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch projects with bids Succcessful';
                        resultObject.data = userBidProject;
                        res.json(resultObject);
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            }
        } catch (e) {
            console.log(e);
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }
};

//Utility Method
function calculateAverageBid(bids) {
    let sum = 0;
    bids.forEach(bid => {
        sum = sum + bid.bid_amount;
    });
    return sum / bids.length;
}
//method converted
exports.isLoggedIn = function (req, res) {
    console.log('Check Login');

    if (req.isAuthenticated()) {

        console.log(req.user);
        console.log('is logged in');
        let responsePayload = {
            responseCode: 0,
            responseMsg: 'Allready Logged In',
            name: req.session.name,
            email: req.session.email,
            id: req.session.passport.user
        }
        res.json(responsePayload);
        return;
    } else {
        console.log('Not logged in');
        let responsePayload = {
            responseCode: 1,
            responseMsg: 'Log In Required',
        }
        res.json(responsePayload);
        return;
    }
};

//method converted
exports.logout = function (req, res) {
    console.log('Destroying Session');
    console.log('Session Destroyed');
    req.logout();
    req.session.destroy();
    res.send('Logout');
    return;
};



exports.getUserProjects = function (req, res) {
    console.log("getUserProjects_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getuserprojects_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.getUserProjectsOld = function (req, res) {
    // My Projects API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching projects',
        data: {}
    }
    if (!req.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {
        if (req.body.id != '') {
            try {
                if (req.body.id != '') {
                    let employer_id = req.body.id;
                    console.log(employer_id);
                    Project.find({ employer_id: { '$eq': employer_id } }, function (error, projects) {
                        try {
                            if (error) throw error;
                            console.log(projects);
                            var openProjects = [];
                            var progressProjects = [];
                            projects.forEach(project => {
                                if (project.freelancer_id === 0) {
                                    openProjects.push(project);
                                } else {
                                    progressProjects.push(project);
                                }
                            });
                            console.log('Fetch projects Succcessful');
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Fetch projects Succcessful';
                            resultObject.data.openProjects = openProjects;
                            resultObject.data.progressProjects = progressProjects;
                            res.json(resultObject);
                            return;
                        } catch (error) {
                            console.log(error);
                            console.log('Catch : ' + error.message);
                            resultObject.errorMsg = error.message;
                            res.json(resultObject);
                            return;
                        }
                    });
                }
            } catch (e) {
                console.log(e);
                resultObject.errorMsg = 'Error Occured';
                resultObject.successMsg = '';
                res.json(resultObject);
            }

        }
    }
};


exports.checkBid = function (req, res) {
    console.log("checkBid_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('checkbid_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.checkBidOld = function (req, res) {
    // Get bid detail API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching bid detail',
        data: {}
    }
    if (!req.body.userId || !req.body.projectId) {
        console.log('No Id provided checkBid');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {

        if (req.body.userId != '') {
            Project.findById(req.body.projectId, function (err, project) {
                try {
                    if (err) throw err;
                    var bidPresent = false;
                    var userBid = {};
                    console.log(project);
                    console.log('Fetch  project Succcessful');
                    resultObject.errorMsg = '';
                    if (project.bids.length > 0) {
                        project.bids.forEach(bid => {
                            console.log('Inside loop');
                            console.log(bid);
                            if (bid.freelancer_id == req.body.userId) {
                                console.log('Bid Present');
                                bidPresent = true;
                                userBid = bid;
                                return;
                            }
                        });
                    }
                    if (bidPresent) {
                        console.log('Bid Present');
                        resultObject.successMsg = 'Fetch user bid Succcessful';
                        resultObject.data.amount = userBid.bid_amount;
                        resultObject.data.period = userBid.bid_period;
                        resultObject.data.update = bidPresent
                    }
                    else {
                        resultObject.data.update = bidPresent
                        resultObject.successMsg = 'No bid found';
                    }
                    console.log(resultObject);
                    res.json(resultObject);
                    return;

                } catch (e) {
                    console.log(e);
                    console.log('Catch : ' + e.message);
                    resultObject.errorMsg = e.message;
                    res.json(resultObject);
                    return;
                }

            });
        }

    }

};


exports.hireEmployer = function (req, res) {
    console.log("hireEmployer_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('hireemployer_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

//Method Converted
exports.hireEmployerOld = function (req, res) {
    // Hire Employer API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error hiring employee',
        data: {}
    }
    if (!req.body.projectId || !req.body.freelancerId) {
        console.log('No name, email and password');
        resultObject.errorMsg = 'Please Provide project id and freelancer id';
        res.json(resultObject);
        return;
    } else {
        let date_end = req.body.endDate;
        let projectId = req.body.projectId;
        let freelancer_id = req.body.freelancerId;
        let freelancer_name = req.body.freelancer_name;
        let currentProject = {};
        Project.findById(projectId, function (err, project) {
            if (err) throw err;
            currentProject = project;
            project.set({
                freelancer_name: freelancer_name, freelancer_id: freelancer_id, date_end: date_end
            });
            project.save(function (error, updatedUser) {
                try {
                    if (error) throw error;
                    console.log('Update Succcessful');
                    resultObject.errorMsg = '';
                    resultObject.successMsg = 'Update Succcessful';
                    res.json(resultObject);
                    return;
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }
            });
            Project.update({ 'bids.freelancer_id': freelancer_id }, {
                '$set': {
                    'bids.$.bid_status': 'BID ACCEPTED',
                }
            }, function (err) {
                console.log('Freelancer Bid status changed to accepted');
            });
            Project.update({ 'bids.freelancer_id': { '$ne': freelancer_id } }, {
                '$set': {
                    'bids.$.bid_status': 'BID REJECTED',
                },
            }, function (err) {
                console.log('Other bid status changed to rejected.');
            });

            User.findById(freelancer_id, function (err, user) {
                try {
                    if (err) throw err;
                    var mailOptions = {
                        from: 'Freelancer Prototype',
                        to: user.email,
                        subject: 'Congrats ' + freelancer_name + '! You are Hired',
                        text: 'Congratulations. You are hired for project ' + currentProject.title +
                            ' by Employer ' + currentProject.employer_name + '.'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }
            });
        });

    }
};


exports.uploadSubmissionDocument = function (req, res) {
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {

        console.log(files);
        let { path: tempPath, originalFilename } = files.file[0];
        let copyToPath = "./src/files/_" + Date.now() + '_' + originalFilename;
        let dbPath = '_' + Date.now() + '_' + originalFilename;
        console.log(copyToPath);

        fs.readFile(tempPath, (err, data) => {
            if (err) throw err;
            fs.writeFile(copyToPath, data, (err) => {
                if (err) throw err;
                // delete temp image
                fs.unlink(tempPath, () => {
                    console.log('API: uploadImage ' + 'STEP: FIle save to new path');
                });
            });
        });
        console.log("uploadSubmissionDocument_request : node backend");
        let data = {dbPath:dbPath,project_id:fields.project_id,text:fields.text};
        console.log(data);
        kafka.make_request('uploadsubmissiondocument_request', data, function (err, results) {
            console.log('Kafka Response:');
            console.log(results);
            if (err) {
                console.log('Controller : Error Occurred : ');
                console.log(err);
                res.json(results);
            }
            else {
                res.json(results);
                return;
            }
        });
    });
}

exports.uploadSubmissionDocumentOld = function (req, res) {
    // Upload Image API
    console.log('API: upload Document ' + 'STEP: Start');

    var resultObject = {
        successMsg: '',
        errorMsg: 'Error Uploading Submission Document',
        data: {}
    }
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {

        console.log(files);
        let { path: tempPath, originalFilename } = files.file[0];
        let copyToPath = "./src/files/_" + Date.now() + '_' + originalFilename;
        let dbPath = '_' + Date.now() + '_' + originalFilename;
        console.log(copyToPath);

        fs.readFile(tempPath, (err, data) => {
            if (err) throw err;
            fs.writeFile(copyToPath, data, (err) => {
                if (err) throw err;
                // delete temp image
                fs.unlink(tempPath, () => {
                    console.log('API: uploadImage ' + 'STEP: FIle save to new path');
                });
            });
        });

        Project.findById(fields.project_id, function (err, project) {
            if (err) return handleError(err);
            project.submission_document.push([fields.text,dbPath]);
            project.save(function (error, updatedProject) {
                try {
                    if (error) throw error;
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }
                resultObject.successMsg = 'File Uploaded Successfully';
                resultObject.errorMsg = '';
                res.json(resultObject);
                return;
            });
        });
    })
};

exports.addMoney = function (req, res) {
    console.log("addMoney_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('addmoney_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}


exports.addMoneyOld = function (req, res) {
    // Add Money API
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error adding money to wallet',
        data: {}
    }

    try {
        var payment = new Payment();
        payment.freelancer_id = req.body.user_id;
        payment.amount = req.body.amount;
        payment.payment_type = 'Card';
        payment.payment_date = req.body.payment_date;
        var cardDetails = {
            number: req.body.cardNumber,
            name: req.body.name,
            month: req.body.expMonth,
            year: req.body.expYear,
            cvv: req.body.cardCVV
        }
        payment.cardDetails = cardDetails;
        payment.description = 'Added from Credit Card'
        payment.save(function (err, user) {
            if (err) {
                console.log('Error in Saving payment: ' + err);
            }
            console.log('Money Added Successfully');
        });

        User.findById(req.body.user_id, function (err, user) {
            if (err) throw err;
            let new_balance = parseInt(user.account_balance) + parseInt(req.body.amount);
            user.set({
                account_balance: new_balance
            });
            user.save(function (error, updatedUser) {
            });
        });

        resultObject.errorMsg = '';
        resultObject.successMsg = 'Money Added Successfully';
        res.json(resultObject);
        return;
    } catch (error) {
        console.log(error);
        console.log('Catch : ' + error.message);
        resultObject.errorMsg = error.message;
        res.json(resultObject);
        return;
    }

};


exports.withdrawMoney = function (req, res) {
    console.log("withdrawMoney_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('withdrawmoney_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

exports.withdrawMoneyOld = function (req, res) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error withdrawing money from wallet',
        data: {}
    }

    try {
        var payment = new Payment();
        payment.employer_id = '' + req.body.user_id;

        payment.amount = req.body.amount;
        payment.payment_type = 'Bank';
        payment.payment_date = req.body.payment_date;
        var bankDetails = {
            number: req.body.accountNumber,
            name: req.body.name,
            routing: req.body.routingNumber
        }
        payment.bankDetails = bankDetails;
        payment.description = 'Money Withdrawn'
        payment.save(function (err, user) {
            if (err) {
                console.log('Error in Saving payment: ' + err);
            }
            console.log('Money Withdrawn Successfully');
        });

        User.findById(req.body.user_id, function (err, user) {
            if (err) throw err;
            let new_balance = parseInt(user.account_balance) - parseInt(req.body.amount);
            user.set({
                account_balance: new_balance
            });
            user.save(function (error, updatedUser) {
            });
        });

        resultObject.errorMsg = '';
        resultObject.successMsg = 'Money Withdrawn Successfully';
        res.json(resultObject);
        return;
    } catch (error) {
        console.log(error);
        console.log('Catch : ' + error.message);
        resultObject.errorMsg = error.message;
        res.json(resultObject);
        return;
    }

};

exports.getUserWalletDetails = function (req, res) {
    console.log("getUserWalletDetails_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getuserwalletdetails_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

exports.getUserWalletDetailsOld = function (req, res) {
    // Post Project API
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error adding money to wallet',
        data: {}
    }
    if (req.body.id) {

        User.findById(req.body.id, function (err, user) {

            Payment.find({ $and: [{ freelancer_id: { '$eq': req.body.id } }] }, function (error, creditPayments) {

                Payment.find({ $and: [{ employer_id: { '$eq': req.body.id } }] }, function (error, debitPayments) {
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
                        res.json(resultObject);
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            });
        });
    } else {
        console.log('Please provide user id');
        resultObject.errorMsg = 'Please provide user id';
        res.json(resultObject);
        return;
    }
};

exports.getUserDetails = function (req, res) {
    console.log("getUserDetails_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('getuserdetails_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}


exports.getUserDetailsOld = function (req, res) {
    // Post Project API
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching user detail',
        data: {}
    }
    if (req.body.user_id) {

        User.findById(req.body.user_id, function (err, user) {

            Project.find({ $and: [{ _id: { '$eq': req.body.project_id } }] }, function (error, project) {

                try {
                    if (error) throw error;

                    resultObject.data.user = user;
                    console.log("User Details:");
                    console.log(user);

                    console.log("Project Details: ");
                    console.log(project);
                    resultObject.data.project = project;

                    resultObject.errorMsg = '';
                    resultObject.successMsg = 'User and project Details Fetched';
                    res.json(resultObject);
                    return;
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }
            });
        });
    } else {
        console.log('Please provide user id');
        resultObject.errorMsg = 'Please provide user id';
        res.json(resultObject);
        return;
    }
};


exports.payFreelancer = function (req, res) {
    console.log("payFreelancer_request : node backend");
    let data = req.body;
    console.log(data);
    kafka.make_request('payfreelancer_request', data, function (err, results) {
        console.log('Kafka Response:');
        console.log(results);
        if (err) {
            console.log('Controller : Error Occurred : ');
            console.log(err);
            res.json(results);
        }
        else {
            res.json(results);
            return;
        }
    });
}

exports.payFreelancerOld = function (req, res) {
    // Post Project API
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error posting Payment',
        data: {}
    }
    if (req.body.project_id) {
        let project = {}
        Project.findById(req.body.project_id, function (err, project) {
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
                        res.json(resultObject);
                        return;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                });
            }
        });

    } else {
        console.log('Please provide user id');
        resultObject.errorMsg = 'Please provide user id';
        res.json(resultObject);
        return;
    }
};



exports.kafkaTest = function (req, res) {
    kafka.make_request('login_request', { "username": 'bhavan@b.com', "password": 'a' }, function (err, results) {
        console.log('in result');
        console.log(results);
        if (err) {
            console.log('Error Occurred : ');
            console.log(err);
        }
        else {
            if (results.code == 200) {
                res.json({ username: "bhavan@b.com", password: "a" });
            }
            else {
                res.json({ error: 'error occurred' });
            }
        }
    });
}
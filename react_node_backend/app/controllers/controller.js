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

//method updated
exports.uploadImage = function (req, res) {
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




//modified
exports.login = function (req, res) {
    // Login User API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error Signing user in',
        data: {}
    }
    if (!req.body.email || !req.body.password) {
        res.status(400).send({
            message: "Please Provide email and password"
        });
        console.log("ERROR");
    } else {
        let email = req.body.email;
        User.findOne({ 'email': email },
            function (error, user) {
                // In case of any error, return using the done method
                try {
                    if (error) throw error;
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }
                // Username does not exist, log error & redirect back
                if (!user) {
                    console.log('User Not Found with username ' + email);
                    console.log('Username not found');
                    resultObject.errorMsg = 'Username not found';
                    res.json(resultObject);
                    return;
                } else {
                    if (!bcrypt.compareSync(req.body.password, user.password)) {
                        console.log('Invalid Password');
                        resultObject.errorMsg = 'Username password does not match';
                        res.json(resultObject);
                        return;
                    } else {
                        resultObject.successMsg = 'Log In Successful';
                        resultObject.errorMsg = '';
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
                    }
                }
            });
    }
};


//Method Converted
exports.signup = function (req, res) {
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
            } catch (error) {
                console.log(error);
                console.log('Catch : ' + error.message);
                resultObject.errorMsg = error.message;
                res.json(resultObject);
                return;
            }
            // already exists
            if (user) {
                console.log('User already exists');
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
                    }
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
                });
            }
        });
    };
}


//Method Updated
exports.updateprofile = function (req, res) {
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
            let skills = ['Java', 'Node'];
            let id = req.body.id;
            User.findById(id, function (err, user) {
                if (err) return handleError(err);
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
                if (skills) {
                    user.skills.push(skills);
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


//Method Converted
exports.getprofile = function (req, res) {
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

//method converted
exports.getprofileimage = function (req, res) {
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
                            resultObject.data = user.profile;
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

//Method Converted
exports.postProject = function (req, res) {
    // Post Project API
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error posting project',
        data: {}
    }
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        var resultObject = {
            successMsg: '',
            errorMsg: 'Error Uploading Image',
            data: {}
        }
        let { path: tempPath, originalFilename } = files.file[0];
        console.log(files);
        let copyToPath = "./src/files/_" + Date.now() + '_' + originalFilename;
        let dbPath = '../files/_' + Date.now() + '_' + originalFilename;
        console.log(copyToPath);
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
            var newProject = new Project();
            // set the user's local credentials
            newProject.title = fields.title
            newProject.employer_id = fields.employer_id;
            newProject.employer_name = fields.employer_name;
            newProject.description = fields.description;

            //newProject.technology_stack= [String];

            newProject.budget_range.push = fields.budget_min;
            newProject.budget_range.push = fields.budget_max
            newProject.budget_period = fields.budget_period;
            newProject.project_document = dbPath;
            newProject.project_status = "OPEN";
            // save the user
            newProject.save(function (err, user) {
                if (err) {
                    console.log('Error in Saving project: ' + err);
                    throw err;
                }
                console.log("Project posted Successfully");
                resultObject.successMsg = 'Project posted Successfully';
                resultObject.errorMsg = '';
                res.json(resultObject);
                return;
            });
        } catch (e) {
            console.log('Catch');
            resultObject.errorMsg = 'Error Uploading Image';
            res.json(resultObject);
            return;
        }
    })
};


exports.getOpenProjects = function (req, res) {
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
                db_controller.getConnection(function (error, connection) {
                    try {
                        if (error) throw error;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                    // Use the connection
                    // let sqlGetProjectDetail = 'select project.id,user.name,title,main_skill_id,budget_range,budget_period from project inner join user on project.employer_id=user.id';
                    // let sqlGetProjectDetail = 'select project_avg_detail.* from (select a.id,a.employer_id,user.name,a.title,a.main_skill_id,a.budget_range,a.budget_period,COALESCE(avg(b.bid_amount),0) as average '+ 
                    // 'from project inner join user on project.employer_id=user.id,project a left outer join bid b on a.id=b.project_id group by a.id,a.title) as project_avg_detail where project_avg_detail.employer_id!='+req.body.id;

                    let sqlGetProjects = 'select c.name,sub1.* from (select a.id,a.freelancer_id,a.employer_id,a.title,a.main_skill_id,a.budget_range,a.budget_period,COALESCE(avg(b.bid_amount),0) as average ,count(b.project_id) as count ' +
                        'from project a left outer join bid b on a.id=b.project_id group by a.id,a.title) as sub1,user c where c.id=sub1.employer_id and employer_id!=' + req.body.id + ' and sub1.freelancer_id IS NULL';
                    console.log(sqlGetProjects);
                    connection.query(sqlGetProjects, function (error, results, fields) {
                        if (error) throw error;
                        console.log(results);
                        connection.release();
                        console.log('Fetch projects Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch projects Succcessful';
                        resultObject.data = results;
                        res.json(resultObject);
                        return;
                    });
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

//Method Converted
exports.getProject = function (req, res) {
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

//Method Converted
exports.postBid = function (req, res) {
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
        let projectId = req.body.projectId;
        let userId = req.body.userId;
        let amount = req.body.amount;
        let period = req.body.period;
        let status = BID_STATUS_SENT;

        if (update) {
            //to be implemented
        } else {
            Project.findById(projectId, function (err, project) {
                if (err) throw err;
                var bid = {
                    freelancer_id: userId,
                    bid_amount: amount,
                    bid_period: period,
                    bid_status: status,
                }
                if (project) {
                    project.bids.push(bid);
                    user.save(function (error, updatedProject) {
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
    // Get project detail from id API
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
            let project_id = "\"" + req.body.id + "\"";
            if (req.body.id != '') {
                db_controller.getConnection(function (error, connection) {
                    // Use the connection
                    try {
                        if (error) throw error;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                    let sqlGetProjectBids = 'select sub1.* from (select a.project_id,a.user_id,b.name,b.id as userId,b.profile_id,a.bid_period,a.bid_amount' +
                        ' from bid a join user b on a.user_id=b.id)  as sub1 where project_id=' + project_id;
                    console.log(sqlGetProjectBids);
                    connection.query(sqlGetProjectBids, function (error, results, fields) {
                        if (error) throw error;
                        connection.release();
                        console.log('Fetch project bids Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch project bids Succcessful';
                        console.log(results);
                        resultObject.data = results;

                        res.json(resultObject);
                        return;


                    });
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
                db_controller.getConnection(function (error, connection) {
                    // Use the connection
                    try {
                        if (error) throw error;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                    // let sqlGetProjectDetail = 'select project.id,user.name,title,main_skill_id,budget_range,budget_period from project inner join user on project.employer_id=user.id';
                    // let sqlGetProjectDetail = 'select project_avg_detail.* from (select a.id,a.employer_id,user.name,a.title,a.main_skill_id,a.budget_range,a.budget_period,COALESCE(avg(b.bid_amount),0) as average '+ 
                    // 'from project inner join user on project.employer_id=user.id,project a left outer join bid b on a.id=b.project_id group by a.id,a.title) as project_avg_detail where project_avg_detail.employer_id!='+req.body.id;

                    let sqlGetProjects = 'select c.name,sub1.* from (select a.id,a.employer_id,a.title,a.main_skill_id,a.budget_range,a.budget_period,b.bid_amount,b.bid_status,b.user_id,COALESCE(avg(b.bid_amount),0) as average ,count(b.project_id) as count ' +
                        'from project a left outer join bid b on a.id=b.project_id group by a.id,b.user_id) as sub1,user c where c.id=sub1.employer_id and sub1.employer_id!=' + req.body.id + ' and sub1.user_id=' + req.body.id;
                    console.log(sqlGetProjects);
                    connection.query(sqlGetProjects, function (error, results, fields) {
                        try {
                            if (error) throw error;
                            console.log(results);
                            connection.release();
                            console.log('Fetch user project bid Succcessful');
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Fetch user project bid Succcessful';
                            resultObject.data = results;
                            res.json(resultObject);
                            return;

                        } catch (e) {
                            console.log('Error Occured');
                            resultObject.errorMsg = 'Error Occured';
                            resultObject.successMsg = '';
                            res.json(resultObject);
                        }
                    });
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


exports.isLoggedIn = function (req, res) {
    console.log('Check Login');
    console.log(req.session.name);
    if (req.session.name) {
        console.log('is logged in');
        let responsePayload = {
            responseCode: 0,
            responseMsg: 'Allready Logged In',
            name: req.session.name,
            email: req.session.email,
            id: req.session.id,
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

exports.logout = function (req, res) {
    console.log('Destroying Session');
    console.log('Session Destroyed');
    req.session.destroy();
    res.send('Logout');
    return;
};


exports.addUser = function (req, res) {
    var user = new User();
    user.name = 'Vajid';
    user.registration = Date.now();
    console.log(Date.now());
    user.save(function (err) {
        if (err)
            res.send(err);
        res.json({ message: 'User successfully added!' });
    });
}

exports.getUserProjects = function (req, res) {
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
            db_controller.getConnection(function (error, connection) {
                // Use the connection
                try {
                    if (error) throw error;
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }
                let sqlGetOpenProjects = 'select a.id,a.employer_id,a.title,a.budget_range,a.budget_period,COALESCE(avg(b.bid_amount),0) as average ,count(b.project_id) as count' +
                    ' from project a left outer join bid b on a.id=b.project_id and b.bid_status=\'BID_SENT\' where a.employer_id=' + req.body.id + ' and a.freelancer_id is NULL group by a.id,a.title';
                console.log(sqlGetOpenProjects);
                connection.query(sqlGetOpenProjects, function (error, results, fields) {
                    try {
                        if (error) throw error;
                        console.log(results);
                        console.log('Fetch user open project Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch user open project Succcessful';
                        resultObject.data.openProjects = results;
                    } catch (error) {
                        console.log(error);
                        console.log('Catch : ' + error.message);
                        resultObject.errorMsg = error.message;
                        res.json(resultObject);
                        return;
                    }
                    let sqlGetProgressProjects = 'select c.name,sub1.* from (select a.id as project_id,a.employer_id,a.freelancer_id,a.title,a.end_date,b.bid_amount,COALESCE(avg(b.bid_amount),0) as average ,count(b.project_id) as count' +
                        ' from project a left outer join bid b on a.id=b.project_id where b.bid_status!=\'BID_SENT\' and a.employer_id=' + req.body.id + ' group by a.id,a.title) as sub1,user c' +
                        ' where c.id=sub1.freelancer_id';
                    console.log(sqlGetProgressProjects);
                    connection.query(sqlGetProgressProjects, function (error, results1, fields) {
                        try {
                            if (error) throw error;
                            console.log(results1);
                            connection.release();
                            console.log('Fetch user progress project Succcessful');
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Fetch user progress project Succcessful';
                            resultObject.data.progressProjects = results1;
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
                });
            });
        }
    }
};

exports.checkBid = function (req, res) {
    // Get bid detail API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching bid detail',
        data: {}
    }
    if (!req.body.userId || !req.body.projectId) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        res.json(resultObject);
        return;
    } else {

        if (req.body.userId != '') {
            db_controller.getConnection(function (error, connection) {
                // Use the connection
                try {
                    if (error) throw error;
                } catch (error) {
                    console.log(error);
                    console.log('Catch : ' + error.message);
                    resultObject.errorMsg = error.message;
                    res.json(resultObject);
                    return;
                }
                let sqlBidDetail = 'select * from bid where user_id=' + req.body.userId +
                    ' and project_id=' + req.body.projectId;
                console.log(sqlBidDetail);
                connection.query(sqlBidDetail, function (error, results, fields) {
                    try {
                        if (error) throw error;
                        console.log(results);
                        connection.release();
                        console.log('Fetch user project bid Succcessful');
                        resultObject.errorMsg = '';
                        if (results.length > 0) {
                            resultObject.successMsg = 'Fetch user bid Succcessful';
                            resultObject.data.amount = results[0].bid_amount;
                            resultObject.data.period = results[0].bid_period;
                            resultObject.data.update = true;
                        } else {
                            resultObject.successMsg = 'No bid found';
                        }
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
        }

    }

};

exports.hireEmployer = function (req, res) {
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
        let endDate = "\"" + req.body.endDate + "\"";
        let projectId = "\"" + req.body.projectId + "\"";
        let freelancerId = "\"" + req.body.freelancerId + "\"";

        db_controller.getConnection(function (error, connection) {
            try {
                if (error) throw error;
            } catch (error) {
                console.log(error);
                console.log('Catch : ' + error.message);
                resultObject.errorMsg = error.message;
                res.json(resultObject);
                return;
            }
            // Use the connection
            let sqlQuery = 'update project set freelancer_id=' + freelancerId + ',end_date=' + endDate +
                ' where id=' + projectId + ';update bid set bid_status=\'BID_ACCEPTED\' where project_id=' + projectId +
                ' and user_id=' + freelancerId + ' ;update bid set bid_status=\'BID_REJECTED\' where project_id=' + projectId +
                ' and user_id!=' + freelancerId;
            console.log(sqlQuery);
            connection.query(sqlQuery, function (error, results, fields) {
                try {
                    // And done with the connection.
                    connection.release();
                    // Handle error after the release.
                    if (error) throw error;
                    console.log('Freelancer detail added to project');
                    resultObject.successMsg = 'Freelancer detail added to project';
                    resultObject.errorMsg = '';
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
    }
};


var mysql = require('mysql');
//without thread pool test method:
exports.getBidsWithoutThreadPool = function (req, res) {
    // Get project detail from id API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching project bids',
        data: {}
    }

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database: "freelancer",
    });

    if (!req.body.id) {
        console.log('No project id provided');
        resultObject.errorMsg = 'No project id provided';
        res.json(resultObject);
        return;
    } else {
        try {
            let project_id = "\"" + req.body.id + "\"";
            if (req.body.id != '') {

                con.connect(function (err) {
                    try {
                        if (err) throw err;
                        let sqlGetProjectBids = 'select sub1.* from (select a.project_id,a.user_id,b.name,b.id as userId,b.profile_id,a.bid_period,a.bid_amount' +
                            ' from bid a join user b on a.user_id=b.id)  as sub1 where project_id=' + project_id;
                        con.query(sqlGetProjectBids, function (err, results) {
                            if (err) throw err;
                            con.end();
                            console.log('Fetch project bids Succcessful');
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Fetch project bids Succcessful';
                            console.log(results);
                            resultObject.data = results;
                            res.json(resultObject);
                            return;

                        });
                    } catch (e) {
                        res.json(e.message);
                    }
                });
            }
        } catch (e) {
            console.log('Exception Occured');
            resultObject.errorMsg = e.message;
            resultObject.successMsg = '';
            res.json(resultObject);
        }
    }
};


                        // //add session to table for horizontal scalability
                        // db_controller.getConnection(function (error, connection) {
                        //     // Use the connection
                        //     try {
                        //         if (error) throw error;
                        //     } catch (error) {
                        //         console.log(error);
                        //         console.log('Catch : ' + error.message);
                        //         resultObject.errorMsg = error.message;
                        //         res.json(resultObject);
                        //         return;
                        //     }
                        //     let storeSession = 'insert into user_session(user_name,user_email,user_id)'+
                        //     'values(\''+results[0].name+ '\',\''+results[0].email+'\','+results[0].id+')';
                        //     console.log(storeSession);
                        //     connection.query(storeSession, function (error, result, fields) {
                        //         try{
                        //             if (error) throw error;      
                        //         }    catch(e){
                        //             console.log('##########################################');                                    
                        //             console.log(e.message);
                        //         }
                        //         if (error) throw error;
                        //         connection.release();
                        //     });
                        // });
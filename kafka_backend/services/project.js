//Files
var User = require('../model/user.js');
var Payment = require('../model/payment.js');
var Project = require('../model/project.js');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
const BID_STATUS_SENT = 'BID_SENT';
const BID_STATUS_ACCEPTED = 'BID_ACCEPTED';
const BID_STATUS_REJECTED = 'BID_REJECTED';


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'freelancer.prototype@gmail.com',
        pass: '!QAZ2wsx#EDC'
    }
});


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

exports.uploadSubmissionDocument_request = function uploadSubmissionDocumentOld_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error Uploading Submission Document',
        data: {}
    }
    Project.findById(msg.project_id, function (err, project) {
        if (err) return handleError(err);
        project.submission_document.push([msg.text, msg.dbPath]);
        project.save(function (error, updatedProject) {
            try {
                if (error) throw error;
            } catch (error) {
                console.log(error);
                console.log('Catch : ' + error.message);
                resultObject.errorMsg = error.message;
                callback(null, resultObject);
                return;
            }
            resultObject.successMsg = 'File Uploaded Successfully';
            resultObject.errorMsg = '';
            callback(null, resultObject);
            return;
        });
    });

}


exports.getUserDetails_request = function getUserDetails_request(msg, callback) {
    // Post Project API
    console.log('Post Project API Called');
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching user detail',
        data: {}
    }
    if (msg.user_id) {
        User.findById(msg.user_id, function (err, user) {
            Project.find({ $and: [{ _id: { '$eq': msg.project_id } }] }, function (error, project) {
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
    } else {
        console.log('Please provide user id');
        resultObject.errorMsg = 'Please provide user id';
        callback(null, resultObject);
        return;
    }
}


exports.hireEmployer_request = function hireEmployer_request(msg, callback) {
    // Hire Employer API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error hiring employee',
        data: {}
    }
    if (!msg.projectId || !msg.freelancerId) {
        console.log('No name, email and password');
        resultObject.errorMsg = 'Please Provide project id and freelancer id';
        callback(null, resultObject);
        return;
    } else {
        let date_end = msg.endDate;
        let projectId = msg.projectId;
        let freelancer_id = msg.freelancerId;
        let freelancer_name = msg.freelancer_name;
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
            Project.update({ 'bids.freelancer_id': freelancer_id }, {
                '$set': {
                    'bids.$.bid_status': 'BID ACCEPTED',
                }
            }, function (err) {
                console.log('Freelancer Bid status changed to accepted');
            });
            Project.update({ 'bids.freelancer_id': { '$ne': freelancer_id } }, {
                '$set': {
                    'bids.$[].bid_status': 'BID REJECTED',
                },
            }, function (err) {
                if (err) {
                    console.log('Error Changind bid status changed to rejected');
                } else {
                    console.log('Other bid status changed to rejected.');
                }
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
                    callback(null, resultObject);
                    return;
                }
            });
        });

    }
}

exports.checkBid_request = function checkBid_request(msg, callback) {
    // Get bid detail API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching bid detail',
        data: {}
    }
    if (!msg.userId || !msg.projectId) {
        console.log('No Id provided checkBid');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject);
        return;
    } else {

        if (msg.userId != '') {
            Project.findById(msg.projectId, function (err, project) {
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
                            if (bid.freelancer_id == msg.userId) {
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
                    callback(null, resultObject);
                    return;

                } catch (e) {
                    console.log(e);
                    console.log('Catch : ' + e.message);
                    resultObject.errorMsg = e.message;
                    callback(null, resultObject);
                    return;
                }
            });
        }
    }
}
exports.getUserProjects_request = function getUserProjects_request(msg, callback) {
    // My Projects API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching projects',
        data: {}
    }
    if (!msg.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject);
        return;
    } else {
        if (msg.id != '') {
            try {
                if (msg.id != '') {
                    let employer_id = msg.id;
                    console.log(employer_id);
                    Project.find({ employer_id: { '$eq': employer_id } }, function (error, projects) {
                        try {
                            if (error) throw error;
                            //                            console.log(projects);
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
            } catch (e) {
                console.log(e);
                resultObject.errorMsg = 'Error Occured';
                resultObject.successMsg = '';
                callback(null, resultObject);
            }

        }
    }
}
//Utility Method
function calculateAverageBid(bids) {
    let sum = 0;
    bids.forEach(bid => {
        sum = sum + bid.bid_amount;
    });
    return sum / bids.length;
}

exports.getUserBidProjects_request = function getUserBidProjects_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching projects',
        data: {}
    }
    if (!msg.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject);
        return;
    } else {

        try {
            if (msg.id != '') {
                let employer_id = msg.id;
                console.log(employer_id);
                Project.find({ $and: [{ employer_id: { '$ne': employer_id } }] }, function (error, projects) {
                    try {
                        if (error) throw error;
                        console.log(projects);
                        var userBidProject = [];
                        projects.forEach(project => {
                            project.bids.forEach(bid => {
                                if (bid.freelancer_id == msg.id) {
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
        } catch (e) {
            console.log(e);
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            callback(null, resultObject);
        }
    }
}

exports.getBids_request = function getBids_request(msg, callback) {
    // Get project bids from id API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching project bids',
        data: {}
    }
    if (!msg.id) {
        console.log('No project id provided');
        resultObject.errorMsg = 'No project id provided';
        callback(null, resultObject);
        return;
    } else {
        try {
            let project_id = msg.id;
            if (msg.id != '') {
                Project.findById(project_id, function (error, project) {
                    try {
                        if (error) throw error;
                        if (project) {
                            console.log('Project Found');
                            resultObject.data = project.bids ? project.bids : [];
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Project Found';
                            callback(null, resultObject);
                        } else {
                            console.log('Project not found');
                            resultObject.errorMsg = 'Project not found';
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


exports.postBid_request = function postBid_request(msg, callback) {
    // postBid API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error posting bid',
        data: {}
    }
    if (!msg.projectId || !msg.userId || !msg.period || !msg.amount) {
        console.log('No name, email and password');
        resultObject.errorMsg = 'Please Provide project id , employee id, amount and period';
        callback(null, resultObject);
        return;
    } else {
        let update = msg.update;
        let freelancer_name = msg.freelancer_name;

        let projectId = msg.projectId;
        let userId = msg.userId;
        let amount = msg.amount;
        let period = msg.period;
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
        }
    }

}

exports.getProject_request = function getProject_request(msg, callback) {
    // Get project detail from id API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching project',
        data: {}
    }
    if (!msg.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject);
        return;
    } else {
        try {
            let id = msg.id;
            let currentUserId = msg.currentUserId;
            if (msg.id != '') {
                Project.findById(id, function (error, project) {
                    try {
                        if (error) throw error;
                        if (project) {


                            console.log('Project Found');
                            console.log(project);

                            resultObject.data = project;
                            resultObject.errorMsg = '';
                            resultObject.successMsg = 'Project Found';
                            callback(null, resultObject);
                        } else {
                            console.log('Project not found');
                            resultObject.errorMsg = 'Project not found';
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
            } else {
                console.log('Please provide Project Id');
                resultObject.errorMsg = 'Please provide Project Id';
                resultObject.successMsg = '';
                callback(null, resultObject);
                return;
            }
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            callback(null, resultObject);
        }
    }
}

exports.getProject_request_withoutConnectionPooling = function getProject_request(msg, callback) {
    // Get project detail from id API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching project',
        data: {}
    }
    if (!msg.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject);
        return;
    } else {
        try {
            let id = msg.id;
            let currentUserId = msg.currentUserId;
            if (msg.id != '') {
                var MongoClient = require('mongodb').MongoClient;
                var url = "mongodb://root:root@ds221609.mlab.com:21609/freelancer";
                MongoClient.connect(url, function (err, db) {
                    if (err) throw err;
                    var dbo = db
                    dbo.collection("projects").findOne({}, function (err, result) {
                        if (err) throw err;
                        console.log("Printing Result:")
                        console.log(result);
                        resultObject.data = result;
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Project Found';
                        callback(null, resultObject);
                        db.close();
                    });
                });
            } else {
                console.log('Please provide Project Id');
                resultObject.errorMsg = 'Please provide Project Id';
                resultObject.successMsg = '';
                callback(null, resultObject);
                return;
            }
        } catch (e) {
            console.log('Error Occured');
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            callback(null, resultObject);
        }
    }
}

exports.getSearchProject_request = function getSearchProject_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching profile',
        data: {}
    }
    if (!msg.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject);
        return;
    } else {
        try {
            if (msg.id != '') {
                let search_string = msg.search_string;
                let status_filter = msg.status_filter + '';
                console.log("Inside Search Projects");
                Project.find({ $and: [{ project_status: new RegExp(status_filter, 'i') }, { $or: [{ title: new RegExp(search_string, 'i') }, { technology_stack: new RegExp(search_string, 'i') }] }] }, function (error, projects) {
                    try {
                        if (error) throw error;
                        console.log('Fetch search projects Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch search projects Succcessful';
                        resultObject.data = projects;
                        console.log(resultObject);
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
        } catch (e) {
            console.log(e);
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            callback(null, resultObject);
        }
    }
}


exports.getOpenProjects_request = function getOpenProjects_request(msg, callback) {
    // SignUp User API
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error fetching profile',
        data: {}
    }
    if (!msg.body.id) {
        console.log('No Id provided');
        resultObject.errorMsg = 'No Id provided';
        callback(null, resultObject);
        return;
    } else {
        try {
            if (msg.body.id != '') {
                let employer_id = msg.body.id;
                let skills = msg.skills;
                console.log(skills);
                console.log(employer_id);
                Project.find({ $and: [{ employer_id: { '$ne': employer_id }, freelancer_id: 0 }] }, function (error, projects) {
                    // In case of any error return
                    try {
                        if (error) throw error;
                        var data = {
                            allProjects:[],
                            releventProjects: []
                        }
                        
                        projects.forEach(project => {
                        data.allProjects.push(project);
                            let count = 0;
                            console.log("For Stack")
                            
                            console.log(project.technology_stack)
                            project.technology_stack.forEach(skill => {
                                console.log('For Skill :' +skill)
                                console.log(skills.includes(skill))
                                if (skills.includes(skill)) {
                                    count++;
                                }
                            });
                            if (count >= 3) {
                                data.releventProjects.push(project)
                            } 
                        });
//                        console.log(data);
                        console.log('Fetch projects Succcessful');
                        resultObject.errorMsg = '';
                        resultObject.successMsg = 'Fetch projects Succcessful';
                        resultObject.data = data;
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
        } catch (e) {
            console.log(e);
            resultObject.errorMsg = 'Error Occured';
            resultObject.successMsg = '';
            callback(null, resultObject);
        }
    }
}

exports.postProject_request = function postProject_request(msg, callback) {
    var resultObject = {
        successMsg: '',
        errorMsg: 'Error posting project',
        data: {}
    }
    var newProject = new Project();
    console.log(msg);
    let title = msg.title[0];
    let description = msg.description[0];
    let skills = msg.skills[0];
    let min = msg.min[0];
    let max = msg.max[0];
    let period = msg.period[0];
    let employer_id = msg.employer_id[0];
    let employer_name = msg.employer_name[0];
    let dbPath = msg.dbPath;

    newProject.title = title
    newProject.employer_id = employer_id;
    newProject.employer_name = employer_name;
    newProject.description = description;
    console.log(skills);
    var result = skills.split(",");
    result.forEach(element => {
        newProject.technology_stack.push(element);
    });
    newProject.budget_range.push(min)
    newProject.budget_range.push(max);
    newProject.budget_period = period;
    newProject.project_document = dbPath;
    newProject.project_status = "OPEN";
    newProject.save(function (err, user) {
        if (err) {
            console.log('Error in Saving project: ' + err);
            throw err;
        }
        console.log("Project posted Successfully");
        resultObject.successMsg = 'Project posted Successfully';
        resultObject.errorMsg = '';
        callback(null, resultObject);
        return;
    });
}

module.exports = function (app) {

  var api_controller = require('../controllers/controller.js');

  //Login
  app.post('/login', api_controller.login);

  //SignUp
  app.post('/signup', api_controller.signup);

  //Upload Image
  app.post('/uploadImage', api_controller.uploadImage);

  //Update profile
  app.post('/updateprofile', api_controller.updateprofile);

  //Get profile
  app.post('/getProfile', api_controller.getprofile);

  //Get profile image
  app.post('/getProfileImage', api_controller.getprofileimage);

  //Post Project
  app.post('/postProject', api_controller.postProject);

  //Post Project
  app.post('/getOpenProjects', api_controller.getOpenProjects);

  //Get Project from id
  app.post('/getProject', api_controller.getProject);

  //Post bid for project
  app.post('/postBid', api_controller.postBid);

  //Get bid for project id
  app.post('/getBids', api_controller.getBids);

  //Get bid for project id
  app.post('/getUserBidProjects', api_controller.getUserBidProjects);

  //Get bid for project id
  app.post('/getUserProjects', api_controller.getUserProjects);

  //Check Login
  app.get('/isLoggedIn', api_controller.isLoggedIn);

  //Logout
  app.get('/logout', api_controller.logout);

  //Check Bid 
  app.post('/checkBid', api_controller.checkBid);

  //hireEmployer
  app.post('/hireEmployer', api_controller.hireEmployer);

  //search project
  app.post('/searchProject', api_controller.getSearchProject);

  //submit document by freelancer
  app.post('/uploadSubmissionDocument', api_controller.uploadSubmissionDocument);

  //Add Money to wallet
  app.post('/addMoney', api_controller.addMoney);

  //Wallet Details
  app.post('/getUserWalletDetails', api_controller.getUserWalletDetails);

  //Get User and Project Details
  app.post('/getUserDetails', api_controller.getUserDetails);

  //Get User and Project Details
  app.post('/payFreelancer', api_controller.payFreelancer);

  //Get User and Project Details
  app.post('/withdrawMoney', api_controller.withdrawMoney);

  //Kafka Test Method
  app.post('/kafkaTest', api_controller.kafkaTest);

}



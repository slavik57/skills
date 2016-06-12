"use strict";
var loginUserOperation_1 = require("../operations/userOperations/loginUserOperation");
var createUserOperation_1 = require("../operations/userOperations/createUserOperation");
module.exports = {
    get_index: function (request, response) {
        response.render('signin');
    },
    post_login: function (request, response) {
        var operation = new loginUserOperation_1.LoginUserOperation(request.body.username, request.body.password);
        operation.execute().then(function () {
            response.redirect('/');
        }, function (_error) {
            response.send(_error);
        });
    },
    post_register: function (request, response) {
        var operation = new createUserOperation_1.CreateUserOperation(request.body.username, request.body.password, request.body.email, request.body.firstName, request.body.lastName);
        operation.execute().then(function () {
            response.redirect('/');
        }, function (_error) {
            response.send(_error);
        });
    }
};

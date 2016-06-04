"use strict";
var chai_1 = require('chai');
var skill_1 = require('./skill');
describe('Skill', function () {
    describe('new', function () {
        var validSkillInfo;
        var validSkillInfo2;
        beforeEach(function () {
            validSkillInfo = {
                name: 'skill name 1'
            };
            validSkillInfo2 = {
                name: 'skill name 2'
            };
            return skill_1.Skills.clearAll();
        });
        afterEach(function () {
            return skill_1.Skills.clearAll();
        });
        it('create skill with empty fields - should return error', function () {
            var skill = new skill_1.Skill();
            var promise = skill.save();
            return chai_1.expect(promise).to.be.rejected;
        });
        it('create skill with missing name - should return error', function () {
            delete validSkillInfo.name;
            var skill = new skill_1.Skill(validSkillInfo);
            var promise = skill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create skill with existing name should return error', function () {
            var skill1 = new skill_1.Skill(validSkillInfo);
            validSkillInfo2.name = validSkillInfo.name;
            var skill2 = new skill_1.Skill(validSkillInfo2);
            var promise = skill1.save().then(function () { return skill2.save(); }, function () { chai_1.expect(true).to.be.false; });
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create skill with empty name should return error', function () {
            validSkillInfo.name = '';
            var skill = new skill_1.Skill(validSkillInfo);
            var promise = skill.save();
            return chai_1.expect(promise).to.eventually.rejected;
        });
        it('create skill with everything ok should save user correctly', function () {
            var skill = new skill_1.Skill(validSkillInfo);
            var promise = skill.save();
            return chai_1.expect(promise).to.eventually.equal(skill);
        });
        it('create skill with everything ok should be fetched', function () {
            var skill = new skill_1.Skill(validSkillInfo);
            var promise = skill.save();
            var skillsPromise = promise.then(function () { return new skill_1.Skills().fetch(); });
            return chai_1.expect(skillsPromise).to.eventually.fulfilled
                .then(function (skills) {
                chai_1.expect(skills.size()).to.be.equal(1);
                chai_1.expect(skills.at(0).attributes.name).to.be.equal(validSkillInfo.name);
            });
        });
    });
});
describe('Skills', function () {
    describe('clearAll', function () {
        it('should clear all the skills', function () {
            var promise = skill_1.Skills.clearAll();
            var usersPromise = promise.then(function () { return new skill_1.Skills().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled
                .then(function (users) {
                chai_1.expect(users.size()).to.be.equal(0);
            });
        });
        it('should not fail on empty table', function () {
            var promise = skill_1.Skills.clearAll().then(function () { return skill_1.Skills.clearAll(); });
            var usersPromise = promise.then(function () { return new skill_1.Skills().fetch(); });
            return chai_1.expect(usersPromise).to.eventually.fulfilled;
        });
    });
});

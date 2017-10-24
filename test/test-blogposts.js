const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogdata() {
    console.info('seeding blog data');
    const seedData = [];

    for (let i=0; i<11; i++) {
        seedData.push(makeBlogData());
    }
    return BlogPost.insertMany(seedData);
}

function generateAuthor() {
    const authors = [
        {"firstName": "Billy", "lastName": "Smith"},
        {"firstName": "Sally", "lastName": "Smith"},
        {"firstName": "Wilson", "lastName": "Wilters"},
        {"firstName": "Tabernacle", "lastName": "Jeff"}
    ]
    return authors[Math.floor(Math.random() * authors.length)];
}

function generateTitle() {
    const titleNumbers = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const title = titleNumbers[Math.floor(Math.random() * titleNumbers.length)];
    return {
        title: title + "20 things -- you won't believe #4"
    }
}

function generateContent() {
    const holderText = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    return {
        content: holderText
    }
}

function makeBlogData() {
    return {
        author: generateAuthor(),
        title: generateTitle(),
        content: generateContent()
    }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

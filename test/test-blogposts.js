const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);
//make teardown and seed functions
  function seedBlogPostData() {
    console.info('seeding blog post data');
    const seedData = [];
    for (let i=1; i<=10; i++) {
      seedData.push({
        author: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        title: faker.lorem.sentence(),
        content: faker.lorem.text()
      });
    }
    return BlogPost.insertMany(seedData);
  }
  function tearDownDb() {
    return new Promise((resolve, reject) => {
      console.warn('Deleting database');
      mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(err => reject(err))
    });
  }
//set up tests, start with before and fater functions
describe('Blogposts API resource', function () {
    //connect to db url
    before(function() {
    return runServer(TEST_DATABASE_URL);
    });
    //seed the data
    beforeEach(function() {
    return seedBlogPostData();
    });
    //after each test teardown the db
    afterEach(function() {
    return tearDownDb();
    });
    //close server
    after(function() {
    return closeServer();
    })
//make test for get endpoint
    describe('GET endpoint', function() {
    
        it('should return existing blog posts', function() {
            let res;
            return chai.request(app)
            .get('/posts')
            .then(_res => {
                res = _res;
                res.should.have.status(200);
                res.body.should.have.length.of.at.least(1);
                return BlogPost.count();
            })
            .then(count => {
                res.body.should.have.length.of(count);
            });
        });
    
        it('should check for correct fields', function() {
            let resPost;
            return chai.request(app)
            .get('/posts')
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length.of.at.least(1);
                res.body.forEach(function(post) {
                post.should.be.a('object');
                post.should.include.keys('id', 'title', 'content', 'author', 'created');
                });
                resPost = res.body[0];
                return BlogPost.findById(resPost.id);
            })
            .then(post => {
                resPost.title.should.equal(post.title);
                resPost.content.should.equal(post.content);
                resPost.author.should.equal(post.authorName);
            });
        });
    });
//make test for post endpoint
        describe('POST endpoint', function() {
        it('should make a post', function() {
            const newPost = {
                title: faker.lorem.sentence(),
                author: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                },
                content: faker.lorem.text()
            };
    //should check for correct params
            return chai.request(app)
            .post('/posts')
            .send(newPost)
            .then(function(res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys(
                'id', 'title', 'content', 'author', 'created');
                res.body.title.should.equal(newPost.title);
                res.body.id.should.not.be.null;
                res.body.author.should.equal(
                `${newPost.author.firstName} ${newPost.author.lastName}`);
                res.body.content.should.equal(newPost.content);
                return BlogPost.findById(res.body.id);
            })
            .then(function(post) {
                post.title.should.equal(newPost.title);
                post.content.should.equal(newPost.content);
                post.author.firstName.should.equal(newPost.author.firstName);
                post.author.lastName.should.equal(newPost.author.lastName);
            });
        });
    });
//make test for put endpoint
        describe('PUT endpoint', function() {
        it('should update content sent', function() {
            const updateData = {
            title: 'clickbait',
            content: 'blah blah blah',
            author: {
                firstName: 'Setven',
                lastName: 'Lewis'
            }
            };
            return BlogPost
            .findOne()
            .then(post => {
                updateData.id = post.id;
                return chai.request(app)
                .put(`/posts/${post.id}`)
                .send(updateData);
            })
            .then(res => {
                res.should.have.status(204);
                return BlogPost.findById(updateData.id);
            })
            .then(post => {
                post.title.should.equal(updateData.title);
                post.content.should.equal(updateData.content);
                post.author.firstName.should.equal(updateData.author.firstName);
                post.author.lastName.should.equal(updateData.author.lastName);
            });
        });
    });
//make test for delete endpoint
        describe('DELETE endpoint', function() {
        it('should delete posts by id', function() {
            let post;
            return BlogPost
            .findOne()
            .then(_post => {
                post = _post;
                return chai.request(app).delete(`/posts/${post.id}`);
            })
            .then(res => {
                res.should.have.status(204);
                return BlogPost.findById(post.id);
            })
            .then(_post => {
                should.not.exist(_post);
            });
        });
    });
});
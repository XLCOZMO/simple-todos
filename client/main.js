import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Index, MinimongoEngine } from 'meteor/easy:search'
import { Session } from 'meteor/session';
import { Accounts } from 'meteor/accounts-base';

import './main.html';
import '../lib/collections.js';

Session.set('taskLimit', 3);
Session.set('userFilter', false);

lastScrollTop = 0;
$(window).scroll(function(event){

	if ($(window).scrollTop() + $(window).height() > $(document).height() - 100){
		var scrollTop = $(this).scrollTop();

		if (scrollTop > lastScrollTop){
			Session.set('taskLimit', Session.get('taskLimit') + 3);			
		}
		lastScrollTop = scrollTop;
	}
});

const TasksIndex = new Index({
	collection: todoDB,
	fields: ['task'],
	engine: new MinimongoEngine(),
});

// Tracker.autorun(function () {
//   let cursor = TasksIndex.search('More Code'); // search all docs that contain "Apply Patch" in the task field

//   console.log(cursor.fetch()); // log found documents with default search limit
//   console.log(cursor.count()); // log count of all found documents
// });

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});

Template.search.helpers({
  tasksIndex: () => TasksIndex, // instanceof EasySearch.Index
});

Template.top.helpers({
	tasksFound(){
  		return todoDB.find().count();
  	},
});

Template.main.helpers({
  	mainAll() {
  		if (Session.get("userFilter") == false){
	  		var time = new Date() - 15000;
	  		var results = todoDB.find({'createdOn': {$gte:time}}).count();

	  		if (results > 0){
	  			return todoDB.find({}, {sort:{createdOn: -1}, limit:Session.get('taskLimit')});
	  		} else {
	    		return todoDB.find({}, {sort:{createdOn: 1}, limit:Session.get('taskLimit')});
	    	}

    	} else {
    		return todoDB.find({postedBy:Session.get("userFilter")}, {sort:{createdOn: 1}, limit:Session.get('taskLimit')});
    	}  	
  	},

  	taskAge(){
  		var taskCreatedOn = todoDB.findOne({_id:this._id}).createdOn;
  		taskCreatedOn = Math.round((new Date() - taskCreatedOn) / 60000);

  		var unit = " mins";

  		if (taskCreatedOn > 60){
  			taskCreatedOn = Math.round(taskCreatedOn / 60);
  			unit = " hours";
  		}

  		if (taskCreatedOn > 1440){
  			taskCreatedOn = Math.round(taskCreatedOn / 1440);
  			unit = " days";

  		}
  		return taskCreatedOn + unit;
  	},

  	userLoggedIn(){
  		var logged = todoDB.findOne({_id:this._id}).postedBy;
  		return Meteor.users.findOne({_id:logged}).username;
  	},

  	userId(){
  		return todoDB.findOne({_id:this._id}).postedBy;
  	},
});

Template.main.events({
	'click .js-delete'(event, instance){
		var deleteID = this._id;

		var confirmation = confirm("Are you sure you want to delete this");

		if (confirmation == true) {
			$('#' + deleteID).fadeOut('slow', function(){
				todoDB.remove({_id:deleteID});
			});			
		}	
	},

	'click .js-edit'(event, instance){

	},

	'click .usrClick'(event, instance){
		event.preventDefault();
		Session.set("userFilter", event.currentTarget.id);
	},
});

// Template.top.events({

// });

Template.addTodo.events({
	'click .js-save'(event, instance){
		var Task = $('#Task').val();

		if (Task == ""){
			Task = "No Task";
		}

		todoDB.insert({'task':Task,'createdOn':new Date().getTime(), 'postedBy':Meteor.user()._id});

		$('#Task').val('');
		$('#addTodo').modal('hide');
	},
});
import { Meteor } from 'meteor/meteor';
import { Index, MinimongoEngine } from 'meteor/easy:search'

import '../lib/collections.js';

Meteor.startup(() => {
  // code to run on server at startup
	const TasksIndex = new Index({
		collection: todoDB,
		fields: ['task'],
		engine: new MinimongoEngine(),
	});
});
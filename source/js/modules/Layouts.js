define(['jquery', 'underscore', 'backbone', 'app',
	'modules/Header'
],
function ($, _, Backbone, app,
	Header
) {
	var Models = {};
	var Collections = {};
	var Views = {};

	Views.Base = Backbone.View.extend({
		template: 'layouts/base',
		initialize: function (options) {
			this.setViews({
				'header': new Header.Views.Account({
				})
			});
			window.scrollTo(0, 0);
		}
	});

	Views.Landing = Views.Base.extend({
		template: 'layouts/landing',
		events: {
			'submit form.signin': 'signin'
		},
		signin: function (event) {
			event.preventDefault();
			this.$el.addClass('working');
			app.session.signIn();
		}
	});

	Views.Github = Views.Base.extend({
		template: 'layouts/github',
		events: {
			'click button.cancel': 'cancel'
		},
		cancel: function () {
			app.session.signOut();
		},
		afterRender: function () {
			console.log('AFTER RENDER GITHUB');
		}
	});

	Views['404'] = Views.Base.extend({
		template: 'layouts/404'
	});

	return {
		Models: Models,
		Collections: Collections,
		Views: Views
	};

});

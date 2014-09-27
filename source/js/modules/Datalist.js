define([
  'jquery', 'underscore', 'backbone', 'app',
  'constants',
  'modules/GitHub',
],
function (
  $, _, Backbone, app,
  constants,
  GitHub
) {

  var Models = {};
  var Collections = {};
  var Views = {};

  Views.OwnerList = Backbone.View.extend({
    template: 'layouts/datalist',
    initialize: function (options) {
      this.options = options;
      this.listenTo(options.userOrgs, 'sync', this._showUserOrgs);
    },
    serialize: function () {
      return {
        listname: this.options.listname,
        userOrgs: this.options.userOrgs.toJSON()
      };
    },
    update: function (models) {
      var $results = this.$el.find('.results');

      $results.empty();
      models.each(function (model) {
        var option = document.createElement('option');
        option.value = model.get('login');
        $results.append(option);
      });
    },
    clear: function () {
      this.$el.find('.results').empty();
    },
    _showUserOrgs: function () {
      this.options.userOrgs.addUser();
      this.render();
    }
  });

  Views.OwnerInput = Backbone.View.extend({
    template: 'layouts/input',
    initialize: function (options) {
      this.options = options;
      this.options.datalistView = new Views.OwnerList({
        listname: this.options.listname,
        userOrgs: this.options.userOrgs
      });
    },
    afterRender: function () {
      this.insertViews({
        'label': this.options.datalistView
      });
      this.options.datalistView.render();
    },
    events: {
      'input input': '_throttledFindOrgs',
      'keyup input.owners': function (event) {
        if (event.keyCode === constants.KEY.RETURN) {
          this._findRepos($(event.target).val());
        }
      }
    },
    serialize: function () {
      return {
        listname: this.options.listname
      };
    },
    _findRepos: function (event) {
      console.log(event);
    },
    _throttledFindOrgs: _.throttle(function (event) {
      this._findOrgs(event);
    }, 400, {leading: true, trailing: true}),
    _findOrgs: function (event) {
      var that = this;
      var query = $(event.target).val().trim();
      var list = that.options.userOrgs.toJSON();
      if (that.options.datalist) {
        list = list.concat(that.options.datalist.toJSON());
      }
      var datalistMatch = _.findWhere(list, {login: query});

      if (datalistMatch) { //user manually selected from datalist
        that.options.datalist = null;
        that._findRepos(query);
      } else if (query) { // searching
        var owners = new GitHub.Collections.SearchUsers(null, {
          query: query
        }).fetch({
          success: function (data) {
            that.options.datalist = data;
            that.options.datalistView.update(data);
          }
        });
      } else { // empty
        that.options.datalist = null;
        that.options.datalistView.clear();
      }
    }
  });

  Views.RepoList = Backbone.View.extend({
    template: 'layouts/datalist',
    initialize: function (options) {
      this.options = options;
    }
  });

  Views.RepoInput = Backbone.View.extend({
    template: 'layouts/input',
    initialize: function (options) {
      this.options = options;
      this.options.datalistView = new Views.RepoList({
        listname: this.options.listname,
      });
    },
    afterRender: function () {
      this.insertViews({
        'label': this.options.datalistView
      });
      this.options.datalistView.render();
    }
  });

  return {
    Models: Models,
    Collections: Collections,
    Views: Views
  };
});

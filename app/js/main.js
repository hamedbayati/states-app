//name spacing
var App = App || {};
App = {
    Models      : {},
    Collections : {},
    Views       : {},
    Routers     : {},
    Mixins      : {}
};

//Models
App.Models.State = Backbone.Model.extend();

//Collections
App.Collections.States = Backbone.Collection.extend({
    model: App.Models.State,
    sort_key: 'id',

    url: function(){
        return 'js/states.json';
    },

    comparator: function(item) {
        return item.get(this.sort_key);
    },

    sortByField: function(fieldName) {
        this.sort_key = fieldName;
        this.sort();
    },

    search : function(letters){
        if(letters == "") return this;
 
        var pattern = new RegExp(letters,"gi");
        return _(this.filter(function(data) {
            return pattern.test(data.get("name"));
        }));
    }
});

//Views
App.Views.ViewState = Backbone.View.extend({
    tagName: 'li',
    className: 'state-info',

    template: _.template( $('#tmplStateInList').html() ),

    initialize: function(){
        _.bindAll(this, 'render');
    },

    render: function(){
        this.$el.html( this.template( this.model.toJSON() ) );
        return this;
    }

});

App.Mixins.ListHelpers = {
    events: {
        'keyup .form-search input': 'search',
        'submit .form-search': 'search',
        'click .search-reset': 'searchReset',
        'click .sort-list a': 'sort'
    },

    init: function(options) {
        _.bindAll(this, 'search', 'searchReset', 'sort');
    },

    search: function(e) {
        e.preventDefault();
        var letters = this.$(".form-search input").val();
        
        if (letters != ""){
            this.$(".search-reset").show();
            this.renderList(this.collection.search(letters));
        } else {
            this.render();
        }
    },

    searchReset: function(e){
        e.preventDefault();
        this.$(".search-reset").hide();
        this.$(".form-search input").val('');
        this.render();
    },

    sort: function(e){
        e.preventDefault();
        var orderBy = $(e.currentTarget).attr('data-sort');

        if (orderBy == "id")
           this.collection.sortByField('id');

        if (orderBy == "name")
           this.collection.sortByField('name');

        if (orderBy == "abbr")
           this.collection.sortByField('abbreviation');

        this.search(e); 
    },
}

App.Views.ViewStates = Backbone.View.extend({
    tagName: 'section',
    className: 'clearfix',

    template: _.template( $('#tmplStatesList').html() ),

    initialize: function(options) {
        if(this.init) this.init(options);
        _.bindAll(this, 'render', 'addState');
        this.collection.bind('reset', this.render);
    },

    render: function(){
        this.$el.html(this.template());
        this.$(".no-result").hide();
        this.collection.each(this.addState);
        return this;
    },

    renderList : function(states){
        this.$(".states-list").html("");
        this.$(".no-result").hide();
 
        states.each(function(state){
            var viewState = new App.Views.ViewState({
                model: state,
                collection: this.collection
            });
            this.$(".states-list").append(viewState.render().el);
        });

        if( this.$(".states-list").html() == "")
            this.$(".no-result").show();

        return this;
    },

    addState: function(state){
        var viewState = new App.Views.ViewState({model: state}); 
        this.$('.states-list').append( viewState.render().el);
    },

});

// App.Views.ViewStates.mixin(App.Mixins.ListHelpers);
App.Views.ViewStates.prototype = _.extend(App.Views.ViewStates.prototype, App.Mixins.ListHelpers);

//Routers
App.Routers.Main = Backbone.Router.extend({
    routes: {
        "": "list",
        "states": "list"
    },

    list: function(){
        var statesList = new App.Collections.States();

        statesList.fetch({
            success: function(){
                var viewStates = new App.Views.ViewStates({collection: statesList}); 
                $('#listofstates').html(viewStates.render().el);
            }
        });
        
    }
});

var mainRouter = new App.Routers.Main();

Backbone.history.start();

$('#app-wrap').css({'height': (($(window).height()))-70+'px'});

$(window).resize(function(){
    $('#app-wrap').css({'height': (($(window).height()))-70+'px'});
});

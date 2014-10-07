
$(function() {



	var ContactView = Backbone.View.extend({

		tagName: "div class=contact",

		template: _.template($("#script-template").html()),

		events: {
			"click #delete" : "destroy",
			"click #name" : "expandContact",
			"dblclick #name" : "substituteTextField",
			"click #address" : "substituteTextField",
			"click #phone_number" : "substituteTextField",
			"click #age" : "substituteTextField",
			"keydown #sub" : "updateElement",
			"focusout #sub" : "backToOne",
			"click span.friends" : "willThisWork",
		},

		backToOne: function() {
			this.render()
			collection.fetch()
			this.$el.find(".disappears").toggle()
		},

		expandContact: function() {
			this.$el.find(".disappears").toggle()
		},

		substituteTextField: function() {
			var attr = arguments[0].target.attributes.id.value
			this.$el.find("span#" + attr).html("<input id='sub' name='" + attr + "' type='text' placeholder='" + name + "'>")
			$("#sub").focus()
		},

		updateElement: function() {
			if (arguments[0].keyCode == 13) {
				this.model.attributes[arguments[0].target.name] = arguments[0].target.value
				this.model.save()
				collection.fetch()
				this.$el.find(".disappears").toggle()
			}
		},

		destroy: function() {
			this.model.destroy()
		},

		initialize: function() {
			this.listenTo(this.model, "change", this.render)
			this.listenTo(this.model, "remove destroy", this.remove)
		},

		render: function() {
			this.$el.html( this.template(this.model.attributes) )
			this.$el.attr("id", this.model.id)
		},

	})

	var ContactModel = Backbone.Model.extend({
		urlRoot: "/contacts",
	})

	var ContactCollection = Backbone.Collection.extend({
		url: "/contacts",
		model: ContactModel,
	})

	var collection = new ContactCollection()

	var ListView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.collection, "add", this.addOne)
			this.listenTo($(".categories span"), "all", this.willThisWork)

			collection.fetch()
		},

		willThisWork: function() {
			console.log(arguments)
		},


		addOne: function(contact){
			var view = new ContactView( {model: contact})
			view.render()
			//Might have to do some magic to insert it alphabetically
			this.$el.append(view.el)

		}
	})


	var list = new ListView({ collection: collection, el: $("div.book") })
	
	var FormView = Backbone.View.extend({

		events: {
			"click button.add" : "create",
		},	

		create: function() {
			var acceptable = true
			var nameEl = this.$el.find("input[name=name]")
			acceptable = evalElem(nameEl)
			var addressEl = this.$el.find("input[name=address]")
			acceptable = evalElem(addressEl)
			var ageEl = this.$el.find("input[name=age]")
			acceptable = evalElem(ageEl)
			var phone_numberEl = this.$el.find("input[name=phone_number]")
			acceptable = evalElem(phone_numberEl)
			var str = "option[name=" + $("select").val() + "]"
			var category_id = $(str).attr("index")
			if (category_id == undefined) {
				reddify($("select"))
				acceptable = false
			}
			var contact = {name: nameEl.val(), address: addressEl.val(), age: ageEl.val(), phone_number: phone_numberEl.val(), category_id: category_id}
			if (acceptable) {
				this.$el.find("input").val("")
				$.ajax({url:"http://api.randomuser.me"})
				.done(function() {
					contact.picture = arguments[0].results[0].user.picture.thumbnail
					collection.create(contact)
				})
			}
		},
	})
	function evalElem(element) {
		if (element.val() == "") {
			reddify(element)
			return false
		}
		else {return true}
	}

	function reddify(element) {
		element.toggleClass("red");
		window.setTimeout(function() {element.toggleClass("red")}, 800)}

	var formView = new FormView({ collection: collection, el: $("div.new-contact") })

	$("div.search input").keyup(searchExecute)

	function searchExecute(feed) {
		var term = feed.target.value
		$("div.contact").find("#name").each(function(i){
			if (this.attributes.name.value.toLowerCase().substr(0, term.length) == term.toLowerCase()) {
				$(this).parent().removeClass("none")
			}
			else {$(this).parent().addClass("none")}
		})
	}

	$(".categories span").click(modifyCategoryDisplay)

	function modifyCategoryDisplay(feed) {
		var targetedClass = feed.target.attributes.class.value.split(" ")[0]
		$("div." + targetedClass).toggle()
	}

	function assignNewCategory(feed) {
		var categories = [0, "friends", "family", "work"]
		var category = categories.indexOf(feed.target.classList[0])
		if (feed.toElement.parentNode.parentNode.id) {
			var el = feed.toElement.parentNode
			$(el).removeClass(_.last(el.classList))
			$(el).addClass(feed.target.classList[0])
			var contactID = feed.toElement.parentNode.parentNode.id
			collection.models.forEach(function(model) {
				if (model.id == contactID) {
					model.attributes.category_id = category
					model.set()
					model.save()
				}
			})
		}		
	}

	$(".categories span").draggable({
		revert: true,
		stop: assignNewCategory,
	})

	function initializeMap() {
		var mapOptions = {
			center: {lat: 51.8282, lng: -120.5795},
			zoom: 4
		}
		var map = new google.maps.Map(document.querySelector("#map-body"), mapOptions)

		$('#myModal').on('shown.bs.modal', function () {
			google.maps.event.trigger(map, "resize");
		});

		$(".btn").click(addMarkers)

		var names = []

		function addMarkers(feed) {
			$(".card").each(function(i) {
				var address = $(this).find("#address").text().split(" ").join("+")
				var name = $(this).find("#name").text().split("  x")[0]
				$.get((gmap + address + key), function(){
					var position = arguments[2].responseJSON.results[0].geometry.location
					var marker = new google.maps.Marker({
						position: {lat: position.lat, lng: position.lng},
						title: name,
					})
					marker.setMap(map)
					debugger
				})
			})			
		}
	}

	initializeMap()

})

var key = "&key=AIzaSyD2cbRqSmMdgLPExYSf-TwneYwlZjtbyqg"
var gmap = "https://maps.googleapis.com/maps/api/geocode/json?address="
function getThings(feed) {
	console.log(feed)
}
var jsons = []

function getPoints(place) {
	var targ = place.split(" ").join("+")
	$.get((gmap + targ + key), function(){jsons.push(arguments[2].responseJSON.results[0].geometry.location)})
}
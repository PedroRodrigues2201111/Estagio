// handles authentication
// provides permission API to views
function AuthController(scope, callback) {
	this.scope = scope;
	this.callbacks = [];
	var self = this;

	if (callback && typeof callback === "function") {
		this.callbacks.push(callback);
	}

	$(".login-placeholder > div").on("click", function () {
		$(".login-box-body").removeClass("error").addClass("running");		
		tryInit();
	});

	function tryInit() {
		$.ajax(window.app.settings["api-url"] + "/users/Authenticate", {
			data: "{}",
			type: "POST",
			dataType: "json",
			contentType: "application/json",
			headers: { 
				mob_token: localStorage.getItem("mob_token"),
				empresa: localStorage.getItem("empresa")
			}
		})
			.done(function (data) {
				self.fin(data);
			}) 
			.fail(function (err) {
				if (err.status !== 401) {
					$(".login-box-body").removeClass("running").addClass("error");
				} else {
					self.init(JSON.tryParse(JSON.tryParse(err.responseText)));
				}
			});
	}
	tryInit();
}

AuthController.prototype.init = function () {
	var self = this;
	this.$html = $(".login");

	$(".login-form").html(AuthController.templates.login());

	$.ajax(window.app.settings["api-url"] + "/empresas/GetEmpresas", {
		data: "{}",
		type: "GET",
		dataType: "json",
		contentType: "application/json",		
	})
		.done(function (data) {						
			if(data.length > 0){
				data.forEach(elem => {
					$("#empresa").append("<option value="+ elem.CODIGO +">"+ elem.NOME +"</option>");
				});
				localStorage.setItem("empresa", data[0].CODIGO);
				if (data.length > 1) {
					$("#DivSelectEmpresa").show();
				}
			}
		}) 
		.fail(function (err) {
			console.log(err);
		});

	this.$html.find("input").on("keyup", function (ev) {
		$(this).closest(".form-group").removeClass("has-error");
		if (ev.which === 13) self.checkAuth();
	});

	this.$html.find("button").on("click", function () {
		self.checkAuth();
	});

	this.$html.find("#username").prop("disabled", false);
	this.$html.find("#password").prop("disabled", false);
	this.$html
		.find("#remember-me")
		.prop("disabled", false)
		.parent()
		.removeClass("disabled");

	this.i18n();

	this.$html.find(".login-container").slideDown();
	this.$html.find(".login-placeholder").slideUp();
};
AuthController.prototype.i18n = function () {
	if (this.$html) this.$html.i18n();
};
AuthController.prototype.done = function (callback) {
	this.callbacks.push(callback);
};
AuthController.prototype.relog = function () {
	var self = this;
	if (!this.relogPromise) {
		this.relogPromise = new Promise(function (res, rej) {
			// relog here
			self.lock(function () {
				res();
			});
		}).then(function () {
			delete self.relogPromise;
		});
	}
	return this.relogPromise;
};
AuthController.prototype.checkAuth = function () {
	var self = this;
	var empresa = self.$html.find("#empresa")[0];
	var username = self.$html.find("#username")[0];
	var password = self.$html.find("#password")[0];
	var remember = self.$html.find("#remember-me")[0];

	if (empresa.value == "") {
		$(empresa).closest(".form-group").addClass("has-error").focus();
	} else if (username.value == "") {
		$(username).closest(".form-group").addClass("has-error").focus();
	} else if (password.value == "") {
		$(password).closest(".form-group").addClass("has-error").focus();
	} else if (!this.$html.find(".login-btn").hasClass("disabled")) {
		var info = {
			empresa: empresa.value,
			username: username.value,
			password: password.value,
			remember: remember.checked,
		};
		self.tryAuth(info, function (data) {
			self.fin(data, info);
		});
	}
};
AuthController.prototype.error = function (error) {
	var html;
	if (this.$lock) {
		html = this.$lock.find(".error-helper");
	} else {
		html = this.$html.find(".alert .msg");
	}

	if (error === "login") {
		html
			.attr("data-i18n", "app.errors.login-invalid")
			.i18n()
			.parent()
			.removeClass("hidden");
	} else if (error === "network") {
		html
			.attr("data-i18n", "app.errors.network")
			.i18n()
			.parent()
			.removeClass("hidden");
	} else {
		html.attr("data-i18n", "").text("").parent().addClass("hidden");
	}
};
AuthController.prototype.auth = function (data) {
	var self = this;

	var loginData = {
		Empresa: data.empresa,
		Username: data.username,
		Password: data.password,
		RememberMe: data.remember,
	};
	return new Promise(function (resolve, reject) {
		$.ajax(window.app.settings["api-url"] + "/users/Authenticate", {
			data: JSON.stringify(loginData),
			type: "POST",
			dataType: "json",
			contentType: "application/json",
		})
			.done(function (data) {
				localStorage.setItem("mob_token", data.userData.token);
				localStorage.setItem("empresa", data.userData.cod_empresa);
				resolve(data);
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				reject(new Errors.PostError(jqXHR.status, jqXHR.responseText));
			});
	});
};
AuthController.prototype.tryAuth = function (info, callback) {
	var self = this;

	self.error();
	this.$html
		.find(".login-btn")
		.addClass("disabled")
		.find(".msg")
		.text(i18n.t("app.core.signing-in"))
		.siblings("i")
		.removeClass("hidden");

	self.$html.find("#username").prop("disabled", true);
	self.$html.find("#password").prop("disabled", true);
	self.$html
		.find("#remember-me")
		.prop("disabled", true)
		.parent()
		.addClass("disabled");

	self
		.auth(info)
		.then(function (data) {
			callback(data);
		})
		.catch(function (err) {
			self.$html.find("#username").prop("disabled", false);
			self.$html.find("#password").prop("disabled", false);
			self.$html
				.find("#remember-me")
				.prop("disabled", false)
				.parent()
				.removeClass("disabled");

			if (err.status === 401 || err.status === 1510) {
				self.error("login");
			} else {
				self.error("network");
			}

			self.$html
				.find(".login-btn")
				.removeClass("disabled")
				.find(".msg")
				.text(i18n.t("app.core.sign-in"))
				.siblings("i")
				.addClass("hidden");
		});

	/* Não.
   * Não não não não não não.
   * Não.
   *    - Rodrigo
   *
    
  bla = $('.login');
  bla.animate('asd', {
    duration: 3000,
    progress:function( r,j , i ){
      bla.css({
        filter: 'hue-rotate( '+(i/5)%360+'deg )',
        transform: 'rotateX( '+(i/3)%360+'deg ) '
          +'rotateY( '+(i/4)%360+'deg ) '
          +'rotateZ( '+(i/6)%360+'deg ) '
          +'scale( '+((Math.cos((i/80)%90)/4)*-1+1+1/4)+' )'
      });
    }
  });//*/
};
AuthController.prototype.fin = function (data, form) {
	var self = this;

	// TODO: Add UserData to response
	this.userData = data.userData;

	// TODO: Add version
	// $(".version-label").text(data.userData.ApiVersion);

	var $html = $(AuthController.templates.userArea(data.userData));
	$html.i18n();

	this.$userArea = $html;

	$(".main-footer .pull-right").html(
		"<b>Version4</b> " + "0" //data.userData.ApiVersion
	);	

	$(".navbar-static-top > .navbar-custom-menu > ul").append($html);
	
	if (this.userData.username)
		$(".username-display").text(this.userData.username);
	
	if (this.userData.empresa[0].NOME)
		$(".empresa-display").text(this.userData.empresa[0].NOME);
	
	$html.find('[data-id="logout"]').on("click", function () {
		self.logout();
	});

	function toggleSignalR(ev, input) {
		// TODO: Enable SignalR?
		return;

		ev.preventDefault();
		ev.stopPropagation();
		input.checked = !input.checked;
		if (input.checked) {
			main.alerts.connectSignalR();
			main.storage.clear("signalr");
		} else {
			main.alerts.stopSignalR();
			main.storage.set("nosignalr", true);
		}
	}

	$html.find('[data-id="toggle-signalR"]').on("click", function (ev) {
		toggleSignalR(ev, $(this).find("input")[0]);
	});
	$html.find('[data-id="toggle-signalR"] label').on("click", function (ev) {
		toggleSignalR(ev, $(this).find("input")[0]);
	});

	$html.find('[data-id="lock"]').on("click", function () {
		$.get(window.app.settings["api-url"] + "/users/logout").always(function () {
			// refresh page
			self.lock();
		});
	});

	$html.find('[data-id="clear-data"]').on("click", function () {
		Tools.Modals.custom({
			cancel: "app.core.cancel",
			message: "app.core.clear-user-data-confirm-message",
			title: "app.core.clear-user-data-confirm",
			buttons: {
				"clear-all": "app.core.clear-all-data",
			},
		})
			.then(function (btn) {
				if (btn === "clear-all") {
					var storage = self._("<maincontroller")[0].storage;
					storage.clear();
				}
			})
			.catch(function () {
				console.log(arguments);
			});
	});

	$html.find('[data-id="change-pw"]').on("click", function () {
		var $html = $(AuthController.templates.changePw());
		$html.i18n();

		var $new = $html.find('[data-id="new"]');
		var $old = $html.find('[data-id="old"]');
		var $repeat = $html.find('[data-id="repeat"]');

		var validations = [
			[/[0-9]/, "number", 10],
			[/[a-z]/, "lowercase", 26],
			[/[A-Z]/, "uppercase", 26],
			[/[^a-zA-Z0-9]/, "special", 40],
		];
		var levels = [
			["weak", 1],
			["fair", 5000000],
			["good", 500000000000],
			["strong", 5000000000000000000],
		];
		$old.on("input", function () {
			$old.parent().toggleClass("has-error", $old.val().length === 0);
		});
		$html.find('[data-id="new"]').on("input", function () {
			// Update password strength display

			var val = $new.val();
			$new.parent().toggleClass("has-error", $new.val().length === 0);
			$html.find(".pass-hints").hide();
			$html.find("ul > li").hide();
			var score = Math.pow(
				validations.reduce(function (a, c) {
					if (c[0].test(val)) {
						return a + c[2];
					}
					$html.find(".pass-hints").show();
					$html.find("ul > .val-" + c[1]).show();
					return a;
				}, 0),
				val.length
			);
			var level = levels.reduce(function (a, c) {
				if (score > c[1]) {
					return c[0];
				}
				return a;
			}, "none");

			$html.find(".strength-val").text(i18n.t("app.changePassword." + level)); // #todo i18n
			var p = $html.find(".progress-bar")[0];

			for (var i = 0; i < p.classList.length; i++) {
				if (p.classList[i].indexOf("progress-bar-") > -1) {
					p.classList.remove(p.classList[i]);
				}
			}

			$html
				.find(".progress-bar")
				.removeClass(".progress-bar-*")
				.addClass(
					"progress-bar-" +
						{
							none: "red",
							weak: "red",
							fair: "yellow",
							good: "blue",
							strong: "green", //'rainbow',
						}[level]
				)
				.css(
					"width",
					{
						none: "  0%",
						weak: " 25%",
						fair: " 50%",
						good: " 75%",
						strong: "100%",
					}[level]
				);

			if ($new.val() !== $repeat.val()) {
				$repeat.parent().addClass("has-error");
			} else {
				$repeat.parent().removeClass("has-error");
			}
		});
		$html.find('[data-id="repeat"]').on("input", function () {
			if ($new.val() !== $repeat.val() || $repeat.val().length === 0) {
				$repeat.parent().addClass("has-error");
			} else {
				$repeat.parent().removeClass("has-error");
			}
		});

		var box = bootbox.dialog({
			title: i18n.t("app.changePassword.change-password"),
			message: $html,
			buttons: {
				success: {
					label: i18n.t("app.changePassword.save"),
					className: "btn-success",
					callback: function (ev) {
						if ($old.val().length === 0) {
							$old.parent().addClass("has-error");
						}
						if ($new.val().length === 0) {
							$new.parent().addClass("has-error");
						}
						if ($repeat.val().length === 0) {
							$repeat.parent().addClass("has-error");
						}

						if ($html.find(".has-error").length > 0) return false;

						$(ev.currentTarget)
							.css("position", "relative")
							.boxBusy("white", "rgba(0, 130, 16, 0.5)", "1em", "fa-spinner")
							.prop("disabled", true);

						Tools.Ajax.defaultPost(
							window.app.settings["api-url"] + "/users/ChangePassword",
							{
								oldPassword: $old.val(),
								newPassword: $new.val(),
							}
						)
							.then(function (data) {
								$(ev.currentTarget).prop("disabled", false).boxUnBusy();

								box.modal("hide");
							})
							.catch(function (err) {
								$(ev.currentTarget).prop("disabled", false).boxUnBusy();

								if (err.status === 403) {
									$old.parent().addClass("has-error");
								}
							});
						return false;
					},
				},
			},
		});
	});
	for (var i = 0; i < this.callbacks.length; i++) {
		this.callbacks[i](data);
	}
};

AuthController.prototype.lock = function (callback) {
	var self = this;

	if (this.locked) {
		if (callback) this.lockCallbacks.push(callback);

		return;
	}

	this.locked = true;
	this.lockCallbacks = [];

	$.ajax(window.app.settings["api-url"] + "/users/logout", {		
		type: "GET",
		dataType: "json",
		contentType: "application/json",
		headers: { 
			mob_token: localStorage.getItem("mob_token"),
			empresa: localStorage.getItem("empresa")
		}
	});

	if (callback) this.lockCallbacks.push(callback);

	var html = AuthController.templates.lockscreen({
		username: this.userData.username,
	});
	var $html = $(html);
	this.$lock = $html;

	$html.i18n();
	$html.appendTo(document.body);
	$html.slideDown(400, function () {
		$(document).off("focusin.modal");
	});
	$html.find("button").on("click", function (ev) {
		ev.preventDefault();
		$html.find("input").prop("disabled", true);
		$html.find("button").prop("disabled", true);
		$html.addClass("loading");
		self.error();
		self
			.auth({
				empresa: self.userData.cod_empresa,
				username: self.userData.username,
				password: $html.find('input[data-id="password"]').val(),
				remember: self.userData.remember,
			})
			.then(function () {
				$html.removeClass("loading");
				$html.find("input").prop("disabled", false);
				$html.find("button").prop("disabled", false);
				$html.slideUp(function () {
					$html.remove();
				});
				self.locked = false;

				for (var i = 0; i < self.lockCallbacks.length; i++) {
					self.lockCallbacks[i]();
				}
				main.alerts.connectSignalR();
			})
			.catch(function (err) {
				$html.removeClass("loading");
				$html.find("input").prop("disabled", false);
				$html.find("button").prop("disabled", false);
				if (err.status === 401 || err.status === 1510) {
					self.error("login");
				} else {
					self.error("network");
				}
				console.log(arguments);
			});
	});
	$html.find("a").on("click", function (e) {
		e.preventDefault();
		self.logout();
	});
};

AuthController.prototype.logout = function () {
	window.loggingOut = true;
	$.ajax(window.app.settings["api-url"] + "/users/logout", {		
		type: "GET",
		dataType: "json",
		contentType: "application/json",
		headers: { 
			mob_token: localStorage.getItem("mob_token"),
			empresa: localStorage.getItem("empresa")
		}
	})
		.done(function () {
			window.location.reload();
		});	
};

AuthController.templates = {
	changePw: Handlebars.compile(`
    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <label class="control-label" data-i18n="app.changePassword.old-password"></label>
          <input data-id="old" class="form form-control" type="password">
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <div class="form-group">
          <label class="control-label" data-i18n="app.changePassword.new-password"></label>
          <input data-id="new" class="form form-control" type="password">
        </div>
        <div class="form-group">
          <label class="control-label" data-i18n="app.changePassword.repeat-new-password"></label>
          <input data-id="repeat" class="form form-control" type="password">
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label class="control-label">
            <span data-i18n="app.changePassword.password-strength"></span> <span class="strength-val"></span>
          </label>
          <div class="progress">
            <div class="progress-bar progress-bar-green" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
            </div>
          </div>
        </div>
        <div class="pass-hints">
          <span data-i18n="app.changePassword.hints"></span>
          <ul>
            <li data-i18n="app.changePassword.hint-numbers" class="val-number">
            </li>
            <li data-i18n="app.changePassword.hint-case" class="val-lowercase val-uppercase">
            </li>
            <li data-i18n="app.changePassword.hint-special" class="val-special">
            </li>
          </ul>
        </div>
      </div>
    </div>
  `),
	login: Handlebars.compile(`
	<div id="DivSelectEmpresa" class="form-group" style="display: none;">
      <div class="input-group">
        <select type="text" id="empresa" class="form-control" data-i18n="[placeholder]app.core.empresa"/>
        <span class="input-group-addon">
          <i class="fa fa-fw fa-briefcase"></i>
        </span>
      </div>
    </div>
    <div class="form-group">
      <div class="input-group">
        <input type="text" id="username" class="form-control" data-i18n="[placeholder]app.core.username">
        <span class="input-group-addon">
          <i class="fa fa-fw fa-user"></i>
        </span>
      </div>
    </div>
    <div class="form-group">
      <div class="input-group">
        <input type="password" id="password" class="form-control" data-i18n="[placeholder]app.core.password">
        <span class="input-group-addon">
          <i class="fa fa-fw fa-key"></i>
        </span>
      </div>
    </div>
    <div class="form-group no-margin">
      <div class="row">
        <div class="col-xs-7">
          <div class="checkboxd">
            <label for="remember-me">
              <input id="remember-me" type="checkbox">
              <span data-i18n="app.core.remember-me"></span>
            </label>
          </div>
        </div>
        <div class="col-xs-5">
          <button type="submit"
            class="login-btn btn btn-primary btn-flat pull-right">
            <i class="fa fa-spinner fa-spin hidden"></i>
            <span class="msg" data-i18n="app.core.sign-in">
            </span>
          </button>
        </div>
      </div>
    </div>
  `),
	lockscreen: Handlebars.compile(`
    <div class="lockscreen-background" style="display: none;position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 2147483647; background-color: rgba(127, 142, 173, 0.71); vertical-align: middle;">
      <div style="box-shadow: 3px 3px 5px 0px rgba( 0, 0, 0, 0.69 );border-radius: 2px; padding: 8px 0px; margin-top: calc(50vh - 141px);background-color: rgb(0, 120, 180);color:white;" class="lockscreen-wrapper">
        <div class="lockscreen-logo" style="font-size: 4em;margin: 10px auto 30px auto;">
          <img
            style="filter:drop-shadow(5px 5px 3px #0000002d)"
            src="assets/logo.svg"
            height="180"
            alt="Logo"
          />
        </div>
        <div style="margin: auto; text-align: center;" class="lockscreen-name">
          <span>{{username}}</span>
        </div>
        <div class="lockscreen-item" style="margin: 3px auto 20px auto;">
          <div class="lockscreen-image" style="border: 5px solid white;background: rgb(0, 120, 180);top: -18px;width: 70px;height: 70px;text-align: center;">
            <i class="fa fa-user" style="line-height: 50px;font-size: 2.5em;"></i>
          </div>
          <form class="lockscreen-credentials" style="margin-left:60px">
            <div class="input-group">
              <input class="form-control" placeholder="password" data-id="password" type="password">
              <div class="input-group-btn">
                <button type="submit" class="btn">
                  <i class="fa fa-arrow-right text-muted"></i>
                  <i class="fa fa-spinner fa-spin text-muted"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
        <div class="hidden">
          <p class="error-helper text-danger text-center"></p>
        </div>
        <div style="color: black;" class="text-center">
          <a style="color: white;text-decoration: underline;" href="." data-i18n="app.core.sign-another-user"></a>
        </div>
      </div>
    </div>
  `),
	userArea: Handlebars.compile(`
    <li class="dropdown messages-menu users-menu">
      <a aria-expanded="false" href="#" data-toggle="dropdown">
        <i class="fa fa-fw fa-user"></i> {{name}} 
      </a>
      <!--<ul class="dropdown-menu dropdown-menu-right" style="width: auto;">-->
	  <ul class="dropdown-menu dropdown-menu-right">
	  	<li class="header">
		    <i class="fa fa-fw fa-briefcase"></i>
			<span
				class="empresa-display"
				style="font-size: .8em;"
			></span>
		</li>
        <li class="header">
			<i class="fa fa-fw fa-user"></i>
			<span
				class="username-display"
			></span>
		</li>		
        <li>
          <div style="position: relative; overflow: hidden; width: auto;" class="slimScrollDiv">
            <ul style="overflow: hidden; width: 100%;" class="menu">
              <li class="hidden">
                <div data-id="toggle-signalR" style="padding: 0;border: 0;position:relative;">
                  <div class="btn btn-flat btn-default" style="width: 100%;padding: 6px 12px;text-align:left;">
                    <i class="fa fa-fw fa-eraser"></i><span style="margin-left: 10px;" data-i18n="app.core.live-notifications"></span>
                    <div style="display: inline-block;margin:0;right: 10px;position: absolute;top: 12px;" class="checkbox checkbox-slider--b checkbox-slider-sm checkbox-slider-success">
                      <label class="" style="min-height:0px;">
                        <input type="checkbox">
                        <span style="padding-left: 1px;"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <button data-id="clear-data" class="btn btn-flat btn-default" style="width:100%">
                  <i class="fa fa-fw fa-eraser"></i><span data-i18n="app.core.clear-user-data"></span>
                </button>
              </li>
              <li class="hidden">
                <button data-id="change-pw" class="btn btn-flat btn-default" style="width:100%">
                  <i class="fa fa-fw fa-key"></i><span data-i18n="app.core.change-password"></span>
                </button>
              </li>
              <li>
                <button data-id="lock" class="btn btn-flat btn-default" style="width:100%">
                  <i class="fa fa-fw fa-lock"></i><span data-i18n="app.core.lock"></span>
                </button>
              </li>
              <li>
                <button data-id="logout" class="btn btn-flat btn-default" style="width:100%">
                  <i class="fa fa-fw fa-power-off"></i><span data-i18n="app.core.logout"></span>
                </button>
              </li>
            </ul>
          </div>
        </li>
        <li class="footer hidden"><a href="#"></a></li>
      </ul>
    </li>
  `),
};

AuthController.prototype._ = scopeInterface;
AuthController.prototype.is = scopeCompare;

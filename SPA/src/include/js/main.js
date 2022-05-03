var main;
$(function() {
  /*
  console.log(
    "" +
      "+------------------------------+\n" +
      "|%c                              %c|\n" +
      "|%c      ---   ---               %c|\n" +
      "|%c    /     \\     \\    sendys   %c|\n" +
      "|%c  /    ^    \\^    \\  explorer %c|\n" +
      "|%c  \\__/   \\__/  \\__/           %c|\n" +
      "|%c                              %c|\n" +
      "+------------------------------+\n" +
      "",
    "background:rgb(0, 120, 180);color:white",
    "color:default",
    "background:rgb(0, 120, 180);color:white",
    "color:default",
    "background:rgb(0, 120, 180);color:white",
    "color:default",
    "background:rgb(0, 120, 180);color:white",
    "color:default",
    "background:rgb(0, 120, 180);color:white",
    "color:default",
    "background:rgb(0, 120, 180);color:white",
    "color:default"
  );*/
  var browserVersion = (function() {
    var ua = navigator.userAgent,
      tem,
      M =
        ua.match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return "IE " + (tem[1] || "");
    }
    if (M[1] === "Chrome") {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null)
        return tem
          .slice(1)
          .join(" ")
          .replace("OPR", "Opera");
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M;
  })();

  var supported = {
    Chrome: 45,
    Firefox: 40,
    Edge: 12
  };

  if (
    supported[browserVersion[0]] &&
    (browserVersion[1] | 0) < supported[browserVersion[0]]
  ) {
    alert(
      "ControlServer has detected a possibly outdated browser.\n" +
        "ControlServer was built using some of the latest web technologies which may not be available in your browser.\n" +
        "Please update your browser to ensure a smooth experience.\n"
    );
  }

  $.ajax({
    url: "./include/resources/settings.json",
    dataType: "json",
    cache: true
  }).done(function(data) {
    window.app.settings = data.deepMerge(window.app.settings);

    main = new MainController(
      document.getElementsByClassName("sidebar")[0],
      document.getElementsByClassName("views-wrapper")[0]
    );
  });
});

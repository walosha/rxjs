jQuery(document).ready(function () {
    "use strict";
    $(".ed-datepicker input.form-control").focus(function () {
        $(".sbOptions").css("display", "none")
    }), $(".ed-datepicker").datepicker({
        format: "dd/mm/yyyy",
        autoclose: !0,
        orientation: "top auto",
        todayBtn: "linked",
        todayHighlight: !0
    }), $(".dropdown").hover(function () {
        $(this).addClass("open")
    }, function () {
        $(this).removeClass("open")
    }), jQuery(".custom_rev_slider").show().revolution({
        delay: 5e3,
        sliderLayout: "fullwidth",
        sliderType: "standard",
        responsiveLevels: [1201, 1025, 768, 480],
        gridwidth: [1201, 1025, 769, 480],
        gridheight: [745, 744, 644, 544],
        dottedOverlay: "twoxtwo",
        navigation: {
            arrows: {
                enable: !0,
                style: "hesperiden",
                hide_onleave: !1
            },
            bullets: {
                enable: !0,
                style: "hesperiden",
                hide_onleave: !1,
                h_align: "center",
                v_align: "bottom",
                h_offset: 0,
                v_offset: 20,
                space: 15
            }
        },
        disableProgressBar: "on"
    }), jQuery("#rev_video_slider").show().revolution({
        dottedOverlay: "none",
        delay: 9e3,
        navigation: {
            onHoverStop: "off"
        },
        responsiveLevels: [1240, 1024, 778, 480],
        visibilityLevels: [1240, 1024, 778, 480],
        gridwidth: [1240, 1024, 778, 480],
        gridheight: [750, 550, 425, 250],
        shadow: 0,
        spinner: "off",
        stopLoop: "on",
        stopAfterLoops: 0,
        stopAtSlide: 1,
        shuffle: "off",
        autoHeight: "off",
        disableProgressBar: "on",
        hideThumbsOnMobile: "off",
        hideSliderAtLimit: 0,
        hideCaptionAtLimit: 0,
        hideAllCaptionAtLilmit: 0,
        debugMode: !1,
        fallbacks: {
            simplifyAll: "off",
            nextSlideOnWindowFocus: "off",
            disableFocusListener: !1
        }
    });
    var e = $(".changeHeader .navbar-fixed-top");
    setInterval(function () { ApplyHeaderClass(); }, 100);

    function ApplyHeaderClass() {
        $(window).scrollTop() >= 1 && $(".navbar-default").hasClass("navbar-main") ? e.addClass("lightHeader") : $(".navbar-default").hasClass("static-light") ? e.addClass("lightHeader") : $("app-home").length >= 1 ? e.removeClass("lightHeader") : e.addClass("lightHeader")
    }
    $(window).scroll(function () {
        $(window).scrollTop() >= 1 && $(".navbar-default").hasClass("navbar-main") ? e.addClass("lightHeader") : $(".navbar-default").hasClass("static-light") ? e.addClass("lightHeader") : $("app-home").length >= 1 ? e.removeClass("lightHeader") : e.addClass("lightHeader")
    }), $(".select-drop").selectbox(), $(".datepicker").datepicker({
        startDate: "dateToday",
        autoclose: !0
    }), $(document).ready(function (e) {
        e(".counter").counterUp({
            delay: 10,
            time: 2e3
        })
    }), jQuery(document).ready(function () {
        $("#price-range").slider({
            range: !0,
            min: 20,
            max: 300,
            values: [20, 300],
            slide: function (e, a) {
                $("#price-amount-1").val("$" + a.values[0]), $("#price-amount-2").val("$" + a.values[1])
            }
        }), $("#price-amount-1").val("$" + $("#price-range").slider("values", 0)), $("#price-amount-2").val("$" + $("#price-range").slider("values", 1))
    });
    var a = $(".singlePackage .panel-heading i.fa");
    $(".singlePackage .panel-heading").click(function () {
        a.removeClass("fa-minus").addClass("fa-plus"), $(this).find("i.fa").removeClass("fa-plus").addClass("fa-minus")
    });
    var i = $(".accordionWrappar .panel-heading i.fa");
    $(".accordionWrappar .panel-heading").click(function () {
        i.removeClass("fa-minus").addClass("fa-plus"), $(this).find("i.fa").removeClass("fa-plus").addClass("fa-minus")
    });
    var o = $(".solidBgTitle .panel-heading i.fa");
    $(".solidBgTitle .panel-heading").click(function () {
        o.removeClass("fa-minus").addClass("fa-plus"), $(this).find("i.fa").removeClass("fa-plus").addClass("fa-minus")
    });
    var s = $(".accordionSolidTitle .panel-heading i.fa");
    $(".accordionSolidTitle .panel-heading").click(function () {
        s.removeClass("fa-arrow-circle-up").addClass("fa-arrow-circle-down"), $(this).find("i.fa").removeClass("fa-arrow-circle-down").addClass("fa-arrow-circle-up")
    });
    var l = $(".accordionSolidBar .panel-heading i.fa");
    $(".accordionSolidBar .panel-heading").click(function () {
        l.removeClass("fa-chevron-circle-up").addClass("fa-chevron-circle-down"), $(this).find("i.fa").removeClass("fa-chevron-circle-down").addClass("fa-chevron-circle-up")
    }), $(document).ready(function () {
        $(".accordionWrappar .panel-collapse, .accordionSolidTitle .panel-collapse, .accordionSolidBar .panel-collapse, .toggle-container .panel-collapse").on("show.bs.collapse", function () {
            $(this).siblings(".panel-heading").addClass("active"), $(this).addClass("active")
        }), $(".accordionWrappar .panel-collapse, .accordionSolidTitle .panel-collapse, .accordionSolidBar .panel-collapse, .toggle-container .panel-collapse").on("hide.bs.collapse", function () {
            $(this).siblings(".panel-heading").removeClass("active"), $(this).removeClass("active")
        })
    }), $("#simple_timer").syotimer({
        year: 2018,
        month: 5,
        day: 9,
        hour: 20,
        minute: 30
    }), $(".incr-btn").on("click", function (e) {
        var a, i = $(this),
            o = i.parent().find(".quantity").val();
        i.parent().find(".incr-btn[data-action=decrease]").removeClass("inactive"), "increase" === i.data("action") ? a = parseFloat(o) + 1 : o > 1 ? a = parseFloat(o) - 1 : (a = 0, i.addClass("inactive")), i.parent().find(".quantity").val(a), e.preventDefault()
    }), $(".slick-carousel").slick({
        centerMode: !0,
        centerPadding: "100px",
        slidesToShow: 1,
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: !0
            }
        }, {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: !1
            }
        }]
    }), $(".brandSlider").slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        centerMode: !0,
        centerPadding: "0px",
        responsive: [{
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: !0
            }
        }, {
            breakpoint: 768,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }]
    }), $(".google-maps").click(function () {
        $(this).find("iframe").addClass("clicked")
    }).mouseleave(function () {
        $(this).find("iframe").removeClass("clicked")
    })
});
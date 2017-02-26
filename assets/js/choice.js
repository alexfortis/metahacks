var makeChoice;
$(document).ready(function() {
    makeChoice = function(data) {
        console.log(JSON.parse($(data)[0].attributes[1].value));
        console.log(JSON.parse($(data)[0].attributes[2].value));
        console.log(JSON.parse($(data)[0].attributes[3].value));
        $.ajax({
            type: "POST",
            url: "/organize",
            dataType: 'json',
            data: {
                next_step: JSON.parse($(data)[0].attributes[1].value),
                effects: JSON.parse($(data)[0].attributes[2].value),
                chances: JSON.parse($(data)[0].attributes[3].value)
            },
            success: function(result) {
                if (result.refresh) {
                    window.location.reload(true);
                } else if (result.hasOwnProperty('choices')) {
                    $('.ui.image').attr('src', 'assets/img/' + result.image);
                    $('p.event').text(result.text);
                    $.when($('.row.choices').fadeOut()).then(function() {
                        $('.row.choices').html('');
                        $('.row.choices').append('<div class="column"></div><div class="eight wide column"></div><div class="column"></div>');
                        result.choices.forEach(function(item) {
                            if (item.effects !== null && item.effects.hasOwnProperty('url')) {
                                $('.row.choices .eight.wide.column').append('<a class="ui huge yellow button spaced-top choice" target="_blank" href="' + item.effects['url'] + '" data-next="' + JSON.stringify(null) + '" data-effects="' + JSON.stringify(null) + '" data-chances="' + JSON.stringify(null) + '">' + item.text + '</a>');
                            } else {
                                $('.row.choices .eight.wide.column').append('<a class="ui huge yellow button spaced-top choice" data-next="' + JSON.stringify(null) + '" data-effects="' + JSON.stringify(item.effects) + '" data-chances="' + JSON.stringify(null) + '">' + item.text + '</a>');
                            }
                        });
                        Array.from(document.getElementsByClassName("choice")).forEach(function(item) {
                            if (item['href'] === null || item['href'] === undefined || item['href'] === '') {
                                $(item).attr('onclick','makeChoice(this)');
                            }
                        });
                        $('.row.choices').fadeIn();
                    });
                } else {
                    $('p.event').text(result.text);
                    $.when($('.row.choices').fadeOut()).then(function() {
                        $('.row.choices').html('');
                        $('.row.choices').append('<div class="column"></div><div class="eight wide column"></div><div class="column"></div>');
                        $('.row.choices .eight.wide.column').append('<a class="ui huge yellow button spaced-top choice" href="/organize">Okay...</a>');
                        $('.row.choices').fadeIn();
                    });
                }
            }
        });
    }
    Array.from(document.getElementsByClassName("choice")).forEach(function(item) {
        $(item).attr('onclick','makeChoice(this)');
    });
});
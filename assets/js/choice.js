var makeChoice;
$(document).ready(function() {
    makeChoice = function(nextIn, effectsIn) {
        $.ajax({
            type: "POST",
            url: "/organize",
            dataType: 'json',
            data: {
                next: JSON.parse(nextIn),
                effects: JSON.parse(effectsIn)
            },
            contentType: 'application/json; charset=utf-8',
            success: function(err, result) {
                console.log(err);
                console.log(result);
            }
        });
    }
    Array.from(document.getElementsByClassName("choice")).forEach(function(item) {
        $(item).attr('onclick','makeChoice($(this)[0].attributes[1], $(this)[0].attributes[2])');
    });
});
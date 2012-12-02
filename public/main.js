var scripts = [
    {
        id: 'zeptoadapter',
        name: 'zepto adapter',
        url: 'https://raw.github.com/mmarcon/jhere/master/dist/zepto.adapter.min.js',
        description: 'Adds missing functionalities so jHERE works with Zepto.JS.'
    },
    {
        id: 'jhere',
        name: 'jhere',
        url: 'https://raw.github.com/mmarcon/jhere/master/dist/jhere.min.js',
        description: 'jHERE Core.'
    },
    {
        id: 'autoinit',
        name: 'auto init extension',
        url: 'https://raw.github.com/mmarcon/jhere/master/dist/extensions/autoinit.min.js',
        description: 'Add maps to your pages without any JavaScript code.',
        depends: ['jhere']
    },
    {
        id: 'route',
        name: 'route extension',
        url: 'https://raw.github.com/mmarcon/jhere/master/dist/extensions/route.min.js',
        description: 'Adds routing functionalities to jHERE.',
        depends: ['jhere']
    }
], byId = {};


function checkDeps(){
    var selected = byId[this.id];
    $.each(selected.depends || [], function(i, id){
        $('#' + id).prop('checked', true);
    });
}

function download(e) {
    e.preventDefault();
    var form = $(this), url = '?files=', scripts = [];
    $('.checkbox:checked').each(function(i, c){
        var script = byId[c.id];
        scripts.push(script.url);
    });
    url = url + scripts.join('+');
    window.location = url;
}

$(function(){
    var dl = $('.comps');

    $(document).on('click', '.checkbox', checkDeps);
    $('form').on('submit', download);

    $.each(scripts, function(i, s){
        byId[s.id] = s;
        var dt, dd;
        dt = $('<dt>');
        dd = $('<dd>');
        dt.append('<input class="checkbox" type="checkbox" id="' + s.id + '" val="' + s.url + '"/>');
        dt.append('<label for="' + s.id + '">' + s.name + '</label>');
        dd.text(s.description);
        dl.append(dt);
        dl.append(dd);
    });
});
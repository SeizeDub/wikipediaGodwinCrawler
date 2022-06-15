var Crawler = require("crawler");

let removedFromSearch = ['File:', 'Fichier:', 'Help:', 'Aide:', 'Special:', 'Wikipedia:'];

let visitedLinks = [];

const args = process.argv.slice(2);
 
var c = new Crawler({
    maxConnections : 1000,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            let links = [];
            $("body .mw-parser-output a").each(function() {
                links.push($(this).attr('href'));
            });
            links = links.filter(link => 
                link &&
                link.startsWith('/wiki/') && 
                !removedFromSearch.some(removed => link.includes(removed)) && 
                !visitedLinks.includes(link)
            );
            if (!links.length) return;
            links = [...new Set(links)];
            console.table(links);
            if (links.includes('/wiki/Adolf_Hitler')) {
                res.options.chain.push('Adolf_Hitler')
                console.log('found : ' + res.options.chain.join(' > '));
                process.exit();
            }
            visitedLinks.push(...links);
            links = links.map(link => 'https://fr.wikipedia.org' + link);
            links.forEach(link => c.queue({
                uri: link,
                chain: [...res.options.chain, decodeURIComponent(link).replace('https://fr.wikipedia.org/wiki/', '')]
            }));
        }
        done();
    }
});
 
// Queue just one URL, with default callback
c.queue({
    uri: 'https://fr.wikipedia.org/wiki/' + encodeURI(args[0]),
    chain: [args[0]]
});
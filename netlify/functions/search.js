var Crawler = require("crawler");

exports.handler = async function (event, context) {

    let articleLink = event.queryStringParameters.article
    let article = decodeURIComponent(articleLink.replace('https://fr.wikipedia.org/wiki/', ''));

    let removedFromSearch = ['File:', 'Fichier:', 'Help:', 'Aide:', 'Special:', 'Wikipedia:', 'Wikipédia:'];
    let visitedLinks = [];
    let returnedChain;

    let waitForValue = new Promise(resolve => {
        var c = new Crawler({
            maxConnections : 2000,
            callback : function (error, res, done) {
                if(error){
                    console.log(error);
                }else{
                    if (returnedChain) return;
                    var $ = res.$;
                    let links = [];
                    $("body .mw-parser-output a").each(function() {
                        links.push($(this).attr('href'));
                    });
                    links = links.filter(link => 
                        link &&
                        link.startsWith('/wiki/') && 
                        !removedFromSearch.some(removed => decodeURIComponent(link).includes(removed)) && 
                        !visitedLinks.includes(link)
                    );
                    if (!links.length) return;
                    links = [...new Set(links)];
                    console.table(links);
                    if (links.includes('/wiki/Adolf_Hitler')) {
                        res.options.chain.push('Adolf_Hitler')
                        returnedChain = res.options.chain;
                        console.log(returnedChain.join(' > '));
                        c = null;
                        return resolve({
                            statusCode: 200,
                            body: JSON.stringify(returnedChain),
                        });
                    }
                    links = links.map(link => 'https://fr.wikipedia.org' + link);
                    links.forEach(link => c.queue({
                        uri: link,
                        chain: [...res.options.chain, decodeURIComponent(link).replace('https://fr.wikipedia.org/wiki/', '')]
                    }));
                }
                done();
            }
        });
        c.queue({
            uri: articleLink,
            chain: [article]
        });
    });

    
    
    // Queue just one URL, with default callback

    return await waitForValue;
}
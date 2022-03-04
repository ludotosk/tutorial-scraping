'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

var corsi = [];

async function scrape(numero) {
    const html = await axios.get('https://www.universitaly.it/index.php/offerta/search?lingua_corso=&classi1=&classi2=&areacun=' + numero + '&accesso=&accesso_c=&cercaAnvur=1&anno_acc=2020&id_provincia_res=&cod_istat=&id_struttura=&azione=ricerca&lingua_corso=&classi1=&classi2=&areacun=' + numero + '&accesso=&accesso_c=&cercaAnvur=1&anno_acc=2020&id_provincia_res=&cod_istat=&id_struttura=&azione=ricerca&ajax=false&_=1625170460824')
    const $ = await cheerio.load(html.data);
    let data = [];
    var uni = '';
    var link = '';

    $('tr').each((i, el) => {
        if ($(el).find('.area-first-last') != '') {
            uni = $(el).find('.area-first-last').find('h3').text()
            link = $(el).find('.link_sito').attr('href')
        }
        try {
            data.push({
                nome: $(el).find('strong').text(),
                classe: $(el).find('.classe').find('span').text(),
                citta: $(el).text().split('\n')[7].split('\t')[12].split(', ')[1],
                tipo: (
                    function() {
                        if ($(el).find('.icona').find('img').attr('title') == 'Accesso con laurea') return 'Magistrale'
                        if ($(el).find('.icona').find('img').attr('title') == 'Accesso con diploma') {
                            if ($(el).find('.durata').find('img').attr('src') == '/images/anni3.png') return 'Triennale';
                            if ($(el).find('.durata').find('img').attr('src') == '/images/anni5.png') return 'Magistrale a Ciclo Unico';
                        }
                    })(),
                link: (function() {
                    var child = $(el).find('.nomecorso').children()[3]
                    return $(child).attr('href') ? $(child).attr('href') : link
                })(),
                accesso: (function() {
                    var icona = $(el).children()[5]
                    return $(icona).find('img').attr('alt')
                })(),
                internazionale: (function() {
                    var icona = $(el).children()[8]
                    return $(icona).find('img').attr('alt') ? 1 : 0
                })(),
                inglese: (function() {
                    var icona = $(el).children()[9]
                    return $(icona).find('img').attr('alt') ? 1 : 0
                })(),
                presenza: (function() {
                    var icona = $(el).children()[6]
                    return $(icona).find('img').attr('alt')
                })(),
                universita: uni.split(`(`)[0]
            })
        } catch (err) {
            //c'è qualche elemento con errore e passo
        }
    })

    corsi = corsi.concat(data)
}

async function launchScrape() {
    await Promise.all([scrape('01'), scrape('02'), scrape('03'), scrape('04'), scrape('05'), scrape('06'), scrape('07'), scrape('08'), scrape('09'), scrape('10'), scrape('11'), scrape('12'), scrape('13'), scrape('14')])

    console.log(corsi)
}

launchScrape()
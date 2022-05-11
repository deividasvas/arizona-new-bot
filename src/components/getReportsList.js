const {launch} = require("puppeteer");
const {load} = require("cheerio");
const axios = require("axios");
const getReportsList = async () => {

    const result = await axios({
        timeout: 1000,
        url: 'https://forum.robo-hamster.ru/forums/49/',
        method: 'GET'
    }) // * Запрос на сайт

    const $ = load(result.data);

    let reportInfo = [];
    $(`a[data-xf-init="preview-tooltip"]`).each(async (i, el) => { // * Ищем тайтл
        const titleReport = el.children[0].data;
        return reportInfo.push({
            index: i,
            title: titleReport
        })
    })

    $(`div.structItem-title .labelLink span`).each(async (i, element) => { // * Ищем лабел
        const oldElement = reportInfo.find(el => el.index === i);
        if (!oldElement) {
            return;
        }
        let arrElement = {
            ...oldElement,
            label: element.children[0].data,
        };

        reportInfo = [...reportInfo.filter(el => el.index !== i), arrElement];
    })

    return reportInfo;
}

module.exports = { getReportsList };
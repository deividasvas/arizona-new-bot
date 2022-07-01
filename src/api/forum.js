const { default: axios } = require("axios");

module.exports = class HamsterForum {
    constructor(url, threadId) {
        this.url = url;
        this.threadId = threadId;
    }

    async sendThread(message) {
        await axios({
            url: `https://forum.robo-hamster.com/threads/${this.threadId}/add-reply`,
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundary8dcfAlYtOSd0oK0o",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Microsoft Edge\";v=\"102\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "_ga=GA1.2.596560904.1654972691; _gid=GA1.2.652517711.1654972691; xf_csrf=VDv2CjP7VUaMNrEA; xf_user=16403%2CnUtxBmzUmG_UGPSYUybMYykFkwzmfpDOQ4FAOr5y; xf_session=pi2dTXk-qkl7Rb24ZVOCKHTOb1cqXVwn",
                "Referer": `https://forum.robo-hamster.com/threads/${this.threadId}/`,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            data: `------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"message_html\"\r\n\r\n${message}\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"attachment_hash\"\r\n\r\nda5961c9a153c5d041cdd2813672e450\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"attachment_hash_combined\"\r\n\r\n{\"type\":\"post\",\"context\":{\"thread_id\":${this.threadId}},\"hash\":\"da5961c9a153c5d041cdd2813672e450\"}\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"last_date\"\r\n\r\n1655013177\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"last_known_date\"\r\n\r\n1655014900\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"load_extra\"\r\n\r\n1\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"_xfToken\"\r\n\r\n1655014903,80aed22a7ac313e587d1923259956206\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"_xfRequestUri\"\r\n\r\n/threads/${this.threadId}/\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"_xfWithData\"\r\n\r\n1\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"_xfToken\"\r\n\r\n1655014903,80aed22a7ac313e587d1923259956206\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o\r\nContent-Disposition: form-data; name=\"_xfResponseType\"\r\n\r\njson\r\n------WebKitFormBoundary8dcfAlYtOSd0oK0o--\r\n`,
            method: "POST"
        }); // Отправка сообщения. ВАЖНО: сообщение надо писать в html разметке , к примеру <p>Message</p>
    }

    async stickyThread() {
        await axios({
            url: `https://forum.robo-hamster.com/threads/${this.threadId}/quick-stick`,
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Microsoft Edge\";v=\"102\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "_ga=GA1.2.596560904.1654972691; _gid=GA1.2.652517711.1654972691; xf_csrf=VDv2CjP7VUaMNrEA; xf_user=16403%2CnUtxBmzUmG_UGPSYUybMYykFkwzmfpDOQ4FAOr5y; xf_session=pi2dTXk-qkl7Rb24ZVOCKHTOb1cqXVwn",
                "Referer": `https://forum.robo-hamster.com/threads/${this.threadId}/`,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            data: "_xfRequestUri=%2Fthreads%2F36316%2F&_xfWithData=1&_xfToken=1655014903%2C80aed22a7ac313e587d1923259956206&_xfResponseType=json",
            method: "POST"
        });
    }

    async createThread(title, content, prefix) {
        
    }

    async editThreadStatus(status) {
        await axios({
            url: `https://forum.robo-hamster.com/threads/${this.threadId}/quick-close`,
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Microsoft Edge\";v=\"102\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "_ga=GA1.2.596560904.1654972691; _gid=GA1.2.652517711.1654972691; xf_csrf=VDv2CjP7VUaMNrEA; xf_user=16403%2CnUtxBmzUmG_UGPSYUybMYykFkwzmfpDOQ4FAOr5y; xf_session=pi2dTXk-qkl7Rb24ZVOCKHTOb1cqXVwn",
                "Referer": `https://forum.robo-hamster.com/threads/${this.threadId}/`,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            data: "_xfRequestUri=%2Fthreads%2F36316%2F&_xfWithData=1&_xfToken=1655014903%2C80aed22a7ac313e587d1923259956206&_xfResponseType=json",
            method: "POST"
        });
    }

    async editMessage(newContent, postId, page) {
        await axios({
            url: `https://forum.robo-hamster.com/posts/${postId}/edit`,
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryBTDELquq6FBl2SNT",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Microsoft Edge\";v=\"102\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "_ga=GA1.2.596560904.1654972691; xf_user=16403%2CnUtxBmzUmG_UGPSYUybMYykFkwzmfpDOQ4FAOr5y; xf_csrf=NuODsDTaKyCDR1kw; xf_session=WlcRaqMPG3Ng41Hhcw7nibacg8dyD1DN; xf_emoji_usage=%3Adurka%3A%2C%3Alove%3A",
                "Referer": `https://forum.robo-hamster.com/threads/${this.threadId}/page-${page ?? '1'}`,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            data: `------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"message_html\"\r\n\r\n${newContent}\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"_xfInlineEdit\"\r\n\r\n1\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"attachment_hash\"\r\n\r\n8be6ead04d77fd785fc73aca5d12726f\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"attachment_hash_combined\"\r\n\r\n{\"type\":\"post\",\"context\":{\"post_id\":${postId}},\"hash\":\"8be6ead04d77fd785fc73aca5d12726f\"}\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"_xfToken\"\r\n\r\n1655289427,54332513284e1b63058cb0c3b3798d4e\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"_xfRequestUri\"\r\n\r\n/threads/${this.threadId}/page-3\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"_xfWithData\"\r\n\r\n1\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"_xfToken\"\r\n\r\n1655289409,cc34b2fd84bcbcd05ba1bbf593c9c464\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT\r\nContent-Disposition: form-data; name=\"_xfResponseType\"\r\n\r\njson\r\n------WebKitFormBoundaryBTDELquq6FBl2SNT--\r\n`,
            method: "POST"
        });
    }

    async changePrefix(prefixId, title) {
        await axios({
            url: `https://forum.robo-hamster.com/threads/${this.threadId}/edit`,
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryBGXUmNn8RJfX9pCN",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Microsoft Edge\";v=\"102\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "_ga=GA1.2.596560904.1654972691; _gid=GA1.2.652517711.1654972691; xf_csrf=VDv2CjP7VUaMNrEA; xf_user=16403%2CnUtxBmzUmG_UGPSYUybMYykFkwzmfpDOQ4FAOr5y; xf_session=pi2dTXk-qkl7Rb24ZVOCKHTOb1cqXVwn",
                "Referer": `https://forum.robo-hamster.com/threads/${this.threadId}/`,
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            data: `------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"prefix_id[]\"\r\n\r\n${prefixId}\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\n${title}\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"_xfSet[discussion_open]\"\r\n\r\n1\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"sticky\"\r\n\r\n1\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"_xfSet[sticky]\"\r\n\r\n1\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"_xfToken\"\r\n\r\n1655013488,c9f40e2cbf26b15624cc3ebf9bbcc795\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"_xfRequestUri\"\r\n\r\n/threads/${this.threadId}/\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"_xfWithData\"\r\n\r\n1\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"_xfToken\"\r\n\r\n1655013465,c6db3f79b67eb75b60cbfc674e1c5eb6\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN\r\nContent-Disposition: form-data; name=\"_xfResponseType\"\r\n\r\njson\r\n------WebKitFormBoundaryBGXUmNn8RJfX9pCN--\r\n`,
            method: "POST"
          })
    }
}
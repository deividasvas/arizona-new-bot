const axios = require('axios');
const {AxiosInstance} = axios;
const cheerio = require('cheerio');
const slowAES = require("./aes.min.js");

class Parser {
  constructor() {
    this.instanceOriginalApi = axios.create({
      baseURL: 'https://backend.arizona-rp.com',
      withCredentials: true,
      validateStatus: (code) => String(code).startsWith("2"),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
        "Connection": "keep-alive",
        "Host": "backend.arizona-rp.com",
        Origin: "https://arizona-rp.com",
        Referer: "https://arizona-rp.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        TE: "trailers",
        "User-Agent": `Mozilla / 5.0(Macintosh; Intel Mac OS X 10.15; rv: 100.0) Gecko / 20100101 Firefox / 100.0`,
      }
    })
    this.instanceTestApi = axios.create({
      baseURL: `https://apitest.arizona-rp.com`,
      withCredentials: true,
      validateStatus: (code) => String(code).startsWith("2"),
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36'
      },
    })
  }

  toNumbers(_0x5cc1x2) {
    const _0x5cc1x3 = [];
    _0x5cc1x2['replace'](/(..)/g, function (_0x5cc1x2) {
      // @ts-ignore
      return _0x5cc1x3['push'](parseInt(_0x5cc1x2, 16));
    });
    return _0x5cc1x3
  }

  toHex() {
    let _0x5cc1x3 = ''
    for (let _0x5cc1x2 = 1 === arguments['length'] && arguments[0]['constructor'] === Array ? arguments[0] : arguments, _0x5cc1x5 = 0; _0x5cc1x5 < _0x5cc1x2['length']; _0x5cc1x5++) {
      _0x5cc1x3 += (16 > _0x5cc1x2[_0x5cc1x5] ? '0' : '') + _0x5cc1x2[_0x5cc1x5].toString(16)
    }
    ;
    return _0x5cc1x3['toLowerCase']()
  }

  async getDescriptiveCookie() {
    const request = await this.instanceTestApi({
      url: `/`
    });
    const htmlText = request.data;
    const $ = cheerio.load(htmlText);
    // @ts-ignore
    const codes = $('script')[3].children.map(a => a.data)[0].split(';')[0].split("=[")[1].split("]")[0].split(",").map(a => a.split('"')[1]);
    const [firstPart, secondPart, thirdPart] = [codes[7], codes[8], codes[9]];
    let a = this.toNumbers(firstPart), b = this.toNumbers(secondPart), c = this.toNumbers(thirdPart);

    // @ts-ignore
    return this.toHex(slowAES['decrypt'](c, 2, a, b));
  }
}

module.exports = Parser;
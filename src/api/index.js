const axios = require('axios')
const Parser = require('./parser');

class Api extends Parser{
  instance = axios.create({
    baseURL: `https://api.vprikol.tech`,
    validateStatus: () => true
  })
  // Токен к веселому приколу.
  token = 'u7BfqsDZVwUMJb60'

  // Функция возвращает информацию по игроку исходя из переданных параметров.
  async findPlayer (nickname, serverId = "10") {
    const request = await this.instance.get(`/find?nick=${nickname}&server=${serverId}&token=${this.token}`)
    if (request.status === 200) {
      return {
        statusCode: 0,
        statusText: 'OK',
        data: request.data
      }
    }
    return {
      statusCode: 1,
      statusText: 'ERR',
      error: request.data.message
    }
  }

  // Функция возвращает информацию об организации найденную по параметрам.
  async getFractionInfo (fractionId, serverId) {
    const result = {
      fractionLabel: '',
      leader: null,
      members: []
    }

    // Получаем данные из оригинальной апи Аризоны.
    const requestOriginalApi = await this.instanceOriginalApi({
      url: `/fraction/get-players?serverId=${serverId}&fractionId=${fractionId}`,
      method: 'get'
    })
    const data = requestOriginalApi.data
    const { items: membersFromOriginalApi } = data
    // Получаем данные из прошлой версий сайта Аризоны
    const requestTestApi = await this.instanceTestApi({
      url: `/mon/fraction/${serverId}/${fractionId}`,
      headers: {
        Cookie: `R3ACTLAB-ARZ2=${await this.getDescriptiveCookie()};`
      }
    })
    const text = requestTestApi.data
    // Получаем массив с элементами в которых присутствуют данные об людях которые состоят в организации.
    let elementsOfTestApi = [...text.matchAll(/\t*<tr>\n?\t*<td>(\d+)<\/td>\n?\t*<td>([a-zA-Z_]+)<\/td>\n?\t*<td>(\d|Лидер)<\/td>\n?\t*<td>(Сейчас играет|Не в игре)<\/td>\n?\t*<\/tr>/gm)]
    // Все игроки организаций полученные из прошлой версий сайта.
    const membersFromTestApi = elementsOfTestApi.map(element => {
      return {
        // @ts-ignore
        name: element[2],
        // @ts-ignore
        isOnline: element[4] === 'Сейчас играет',
        // @ts-ignore
        rank: element[3] === 'Лидер' ? 10 : Number(element[3]),
        // @ts-ignore
        isLeader: element[3] === 'Лидер'
      }
    })
    // С помощью цикла сравниваем две версий сайта, и если на на прошлой версий нет человека, то удаляем его из списка.
    // В ином случае, совмещаем данные и возвращаем их.
    for (const member of membersFromOriginalApi) {
      const memberOfTestApi = membersFromTestApi.find(memberOfTestApi => {
        return memberOfTestApi.name === member.name
      })
      if (!memberOfTestApi) {
        continue
      }
      result.members.push({
        ...member,
        ...memberOfTestApi
      })
    }

    // Ставим дополнительные параметры об организации.
    result.fractionLabel = requestOriginalApi.data.organizationLabel
    result.leader = result.members.find(member => member.isLeader) || null

    return {
      statusCode: 0,
      statusText: "OK",
      data: result
    }
  };
}

module.exports = new Api()
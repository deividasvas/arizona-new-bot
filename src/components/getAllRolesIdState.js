// Функция возвращает айдишники всех ролей сотрудник гос.организации.
const getAllRolesIdState = (rolesId) => {
    return [
        // Сотрудник гос
        rolesId.stateEmployee,
        // Сотрудник правительства
        rolesId.government,
        // Сотрудник ГЦЛ
        rolesId.licenseEmployee,
        // Сотрудник центрального банка
        rolesId.bank,
        // Сотрудник страховой компании
        rolesId.insuranceCompany,
        // Сотрудник ФБР
        rolesId.fbi,
        // Сотрудник ЛСПД
        rolesId.lspd,
        // Сотрудник SWAT
        rolesId.swat,
        // Сотрудник LVMPD
        rolesId.lvmpd,
        // Академист ФБР
        rolesId.fbi_academy,
        // Сотрудник RCSD
        rolesId.rcsd,
        // Сотрудник ТСР
        rolesId.prison,
        // Сотрудник ЛСМЦ
        rolesId.lsmc,
        // Сотрудник СФМЦ
        rolesId.sfmc,
        // Сотрудник ЛВМЦ
        rolesId.lvmc,
        // Сотрудник СМИ ЛС
        rolesId.lsfm,
        // Сотрудник СМИ СФ
        rolesId.sffm,
        // Сотрудник СМИ ЛВ
        rolesId.lvfm,
        // Военнослужащий ЛСа
        rolesId.lsa,
        // Военнослужащий СФа
        rolesId.sfa,
    ];
};

module.exports = getAllRolesIdState;

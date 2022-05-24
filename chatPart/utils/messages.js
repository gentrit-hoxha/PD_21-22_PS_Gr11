const moment = require("moment");


function formatMessage(username, text,labFile,patientName) {
    return {
        username,
        text,
        time: moment().format('h:mm a'),
        labFile,
        patientName
    }
}

const vlera1 = 'clinical-lab-nephrology-requisition-PDF.pdf';
const vlera2 = 'js-cheatsheet.pdf';
const vlera3 = 'API-GUIDE.pdf';



module.exports = {
    formatMessage,
    vlera1,
    vlera2,
    vlera3
};
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    const address = event["params"]["querystring"]["address"];
    const uuid = uuidv4();
    return {
        statusCode: '200',
        body: ( 'uuid: ' + uuid + ' ' + address )
    }
    //return 'uuid: ' + uuid + ' ' + address;
}
const fs = require('fs');
const Mustache = require('mustache');

function generateSession(adminList, userList) {
  let surveyValues = {
    // admin
    admin1: adminList[0],
    admin2: adminList[1],
    // user
    user1: userList[0],
    user2: userList[1],
    user3: userList[2],
    user4: userList[3],
    user5: userList[4],
    user6: userList[5],
  };

  let data = fs.readFileSync('./session.mustache');
  var output = Mustache.render(data.toString(), surveyValues);
  console.log(`generated response: ${output}`);
  return JSON.parse(output);
}

module.exports = { generateSession };

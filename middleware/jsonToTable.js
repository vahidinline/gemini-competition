function jsonToHtmlTable(json) {
  let html = '';
  console.log('json', json);

  // Add meal name
  html += `*Meal Name*: ${json.meal_name}\n`;

  // Add amount
  html += `*Amount*: ${json.amount}\n`;

  return html;
}

module.exports = jsonToHtmlTable;

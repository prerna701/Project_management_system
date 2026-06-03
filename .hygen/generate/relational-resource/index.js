const { prompt } = require('enquirer');

module.exports = {
  prompt: async ({ prompter, args }) => {
    const answer = await prompter.prompt({
      type: 'input',
      name: 'name',
      message: 'Module name (e.g. projects):',
    });
    return answer;
  },
};

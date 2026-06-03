module.exports = {
  prompt: async ({ prompter }) => {
    return prompter.prompt({
      type: 'input',
      name: 'name',
      message: 'Seed name (e.g. departments):',
    });
  },
};

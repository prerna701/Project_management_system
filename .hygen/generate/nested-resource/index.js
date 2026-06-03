module.exports = {
  prompt: async ({ prompter }) => {
    const nameAnswer = await prompter.prompt({
      type: 'input',
      name: 'name',
      message: 'Module name (e.g. milestones):',
    });
    const parentAnswer = await prompter.prompt({
      type: 'input',
      name: 'parent',
      message: 'Parent module name (e.g. projects):',
    });
    return { ...nameAnswer, ...parentAnswer };
  },
};

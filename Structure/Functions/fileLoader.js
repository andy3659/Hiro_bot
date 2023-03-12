const { promisify } = require("util");
const { glob } = require("glob");
const promise = promisify(glob);
/**
 * @param {String} folderName
 */
async function loadFiles(folderName) {
  const files = await promise(
    `${process.cwd().replace(/\\/g, "/")}/${folderName}/*/*.js`
  );
  console.log(files);
  files.forEach((file) => delete require.cache[require.resolve(file)]);
  return files;
}

module.exports = { loadFiles };

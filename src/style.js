module.exports = {
   build: build
}
const pfs = require('fs').promises;
const fs = require('fs');
const path = require('path');


var sass = require('node-sass');

async function walk(dir, fileList = []) {

   const files = await pfs.readdir(dir);
   for (const file of files) {
      const stat = await pfs.stat(path.join(dir, file));
      if (stat.isDirectory()) {
         fileList = await walk(path.join(dir, file), fileList);
      } else {
         const segments = dir.split('\\');
         const parentFolder = segments[segments.length - 1];

         if (file === parentFolder + '.scss') {
            var filePath = path.join(dir, file);
            fileList.push(filePath);
         }
      }
   }
   return fileList;
}

function build(dir) {
   console.log('style: dir');
   var results = [];
   walk(dir, results)
      .then((files) => {
         createLayout(dir, files.map(file => {
            let name = `@import ".${file.replace(/\\/g, '/')}"`;
            return name.replace(dir, '');
         }));
      });
}

async function createLayout(dir, styles) {

   let scss = `// auto generated by build/style.js
   
${styles.join(';\n')};`;

   scss = scss.replace(/\uFEFF/g, '');

   await fs.writeFileSync(`${dir}\\style.scss`, scss, 'utf8', function (err) {});

   sass.render({
      file: `${dir}\\style.scss`
   }, function (error, result) {
      if (!error) {
         fs.writeFile(`${dir}\\style.scs`,
            result.css,
            function (err) {
               if (!err) {
                  console.log('style complete');
               } else {
                  console.log(err);
               }
            });
      } else {
         console.log(error);
      }
   });
}
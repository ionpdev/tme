// Collecting Files, environment setup, run the test
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const forbidenDirs = ['node_modules']

class Runner {
    constructor() {
        this.testFiles = []
    }

    async runTest() {
        for (let file of this.testFiles) {
            //
            console.log(chalk.grey(`-----> ${file.shortName} <-----:`))
            //
            const beforeEaches = []
            global.beforeEach = (fn) => {
                beforeEaches.push(fn)
            }
            //
            global.it = (desc, fn) => {
                beforeEaches.forEach(func => func())
                try {
                    fn()
                    console.log(chalk.green(`\tOK - ${desc}`))
                } catch (error) {
                    const message = error.message.replace(/\n/g, '\n\t\t')
                    console.log(chalk.red(`\tX - ${desc}`))
                    console.log(chalk.red('\t', message))
                }
            }
            //to execute the file, we call require, then  ode will
            //find the file, load up all the code inside of it,
            //and execute all the code inside
            try {
                require(file.name)
            } catch (error) {
                    console.log(chalk.bgGrey(error))
            }
        }
    }

    async collectFiles(targetPath) {
        //targetPath === /users/some/some/some
        const files = await fs.promises.readdir(targetPath)

        for (let file of files) {
            const filepath = path.join(targetPath, file)
            const stats = await fs.promises.lstat(filepath)

            if (stats.isFile() && file.includes('.test.js')) {
                this.testFiles.push({ name: filepath, shortName: file })
                //loop over dirs and not include what is avoided
            } else if (stats.isDirectory() && !forbidenDirs.includes(file)) {
                const childFiles = await fs.promises.readdir(filepath)
                //add all from childFilles array and add them to testFilles array
                files.push(...childFiles.map(f => path.join(file, f)))
            }
        }
    }

}

module.exports = Runner
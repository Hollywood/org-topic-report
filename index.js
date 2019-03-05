require('dotenv').config()
const fs = require('fs')
const path = require('path')
const Json2csvParser = require('json2csv').Parser;
const github = require('@octokit/rest')({
    auth: `token ${process.env.ghToken}`,
    previews: [
        'hellcat-preview',
        'mercy-preview'
    ],
    //Set this to GHE API url if on GitHub Enterprise
    baseUrl: 'https://api.github.com'
})
require('./pagination')(github)

async function getTopicData() {
    var topics = []
    var table = []

    //Get List of Repos and their sizes
    topics = [].concat.apply([], 
        (await github.paginate(await github.repos.listForOrg({org: 'Albatoss'}))).map(n => n.data.map((n) => n.topics)))
    
    results = new Counter([].concat(...topics));
    for (let [topic, times] of results.entries())
        table.push({
            topic: topic,
            results: times
        })

    //Write to CSV file
    const fields = ['topic', 'results']
    var json2csvParser = new Json2csvParser({
      fields,
      delimiter: ';'
    })
    const csv = json2csvParser.parse(table)
    console.log(csv)
    fs.writeFile('org-topic-list.csv', csv, function (err) {
      if (err) throw err
      console.log('file saved!')
    })
}


getTopicData()


class Counter extends Map {
    constructor(iter, key=null) {
        super();
        this.key = key || (x => x);
        for (let x of iter) {
            this.add(x);
        }
    }
    add(x) {
      x = this.key(x);
      this.set(x, (this.get(x) || 0) + 1);
    }
}
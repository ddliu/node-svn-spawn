# svn-spawn

Easy way to access svn repository with node.js.

## Features

- Easy to use
- Fast way to add local changes
- Query svn infomation as array or object
- Common svn commands are all supported

## Usage

Create a svn client instance

```js
var Client = require('svn-spawn');
var client = new Client({
    cwd: '/path to your svn working directory'
});
```
`svn update`

```js
client.update(function(err, data) {
    console.log('updated');
});
```

`svn info`

```js
client.getInfo(function(err, data) {
    console.log('Repository url is %s', data.url);
});
```

Make some changes and commit all

```js
client.addLocal(function(err, data) {
    console.log('all local changes has been added for commit');

    client.commit('commit message here', function(err, data) {
        console.log('local changes has been committed!');
    });
});
```

## Requirements

You need to have the `svn` command installed.

## Installation

```bash
npm install svn-spawn
```

## TODO

- Detailed document for query result such as `svn info`, `svn log`, `svn status` etc.

## Changelog

- 0.1.0 - Inital version
- 0.1.1 - Fix `addLocal` bug; add some tests